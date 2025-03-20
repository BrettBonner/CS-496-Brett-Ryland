import React, { useState, useEffect, useRef, useMemo } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useAuth } from "../../context/AuthContext"; // Adjust path
import { saveFacility, removeSavedFacility } from "../../api"; // Add new functions
import axios from "axios";
import "./Facility.css";

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

const defaultCenter = {
  lat: 39.2904,
  lng: -76.6122, // Default center in Baltimore
};

function Facility({ facilities }) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(50);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [userLocation, setUserLocation] = useState(null); // Store user's lat/lng
  const [filters, setFilters] = useState({
    radius: 0, // 0 means no radius filter
    medicaidCertified: false,
    salsCertified: false,
  });
  const [showFiltersPopdown, setShowFiltersPopdown] = useState(false); // Toggle for the single filter popdown
  const mapRef = useRef(null);
  const listRef = useRef(null);

  // Geocode the user's search query to get lat/lng
  useEffect(() => {
    if (searchQuery) {
      const geocodeAddress = async () => {
        try {
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
              searchQuery
            )}&key=${apiKey}`
          );
          if (response.data.results.length > 0) {
            const { lat, lng } = response.data.results[0].geometry.location;
            setUserLocation({ lat, lng });
          } else {
            console.warn("No geocoding results for search query:", searchQuery);
            setUserLocation(null);
          }
        } catch (error) {
          console.error("Error geocoding search query:", error);
          setUserLocation(null);
        }
      };
      geocodeAddress();
    } else {
      setUserLocation(null);
    }
  }, [searchQuery]);

  // Haversine formula to calculate distance between two points (in miles)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3958.8; // Radius of the Earth in miles
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in miles
  };

  // Filter facilities based on search query and filters
  const allFilteredFacilities = useMemo(() => {
    let filtered = facilities.filter(
      (facility) =>
        facility.City?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.county?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(facility["Zip Code"] || "").includes(searchQuery)
    );

    // Apply filters
    if (filters.medicaidCertified) {
      filtered = filtered.filter(
        (facility) => facility["Medicaid Certified"] === "yes"
      );
    }
    if (filters.salsCertified) {
      filtered = filtered.filter(
        (facility) => facility["SALS certified"] === "yes"
      );
    }
    if (filters.radius > 0 && userLocation) {
      filtered = filtered.filter((facility) => {
        if (
          !facility.lat ||
          !facility.lng ||
          typeof facility.lat !== "number" ||
          typeof facility.lng !== "number" ||
          isNaN(facility.lat) ||
          isNaN(facility.lng)
        ) {
          return false;
        }
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          facility.lat,
          facility.lng
        );
        return distance <= filters.radius;
      });
    }

    return filtered;
  }, [facilities, searchQuery, filters, userLocation]);

  const visibleFacilities = allFilteredFacilities.slice(0, visibleCount);
  console.log("Visible Facilities:", visibleFacilities);

  // Set initial map center on mount and when filtered facilities change
  useEffect(() => {
    const firstWithCoords = visibleFacilities.find(
      (facility) =>
        typeof facility.lat === "number" &&
        typeof facility.lng === "number" &&
        !isNaN(facility.lat) &&
        !isNaN(facility.lng)
    );
    if (firstWithCoords) {
      setMapCenter({ lat: firstWithCoords.lat, lng: firstWithCoords.lng });
    } else {
      setMapCenter(defaultCenter);
    }
  }, [visibleFacilities]);

  // Scroll to selected facility
  useEffect(() => {
    if (selectedFacility !== null && listRef.current) {
      const selectedElement = document.getElementById(`facility-${selectedFacility}`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [selectedFacility]);

  // Handle saving a facility
  const handleSaveFacility = async (facilityId) => {
    if (!user) {
      alert("Please log in to save facilities.");
      return;
    }
    try {
      await saveFacility(user.username, facilityId);
      console.log(`Facility ${facilityId} saved for user ${user.username}`);
    } catch (err) {
      console.error("Failed to save facility:", err);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : parseInt(value),
    }));
  };

  return (
    <div className="facilities-container">
      <div className="facilities-list" ref={listRef}>
        <div className="search-bar-container">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Enter Zip, County, or City..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-button">🔍</button>
            {/* Single Filter Button */}
            <div className="filter-button-container">
              <button
                className="filter-button"
                onClick={() => setShowFiltersPopdown(!showFiltersPopdown)}
              >
                <span role="img" aria-label="filter">🟣</span> {/* Purple circle emoji */}
              </button>
              {showFiltersPopdown && (
                <div className="filter-popdown">
                  <div className="filter-group">
                    <label>Radius (miles):</label>
                    <select
                      name="radius"
                      value={filters.radius}
                      onChange={handleFilterChange}
                    >
                      <option value="0">No Limit</option>
                      <option value="10">10 miles</option>
                      <option value="25">25 miles</option>
                      <option value="50">50 miles</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>
                      <input
                        type="checkbox"
                        name="medicaidCertified"
                        checked={filters.medicaidCertified}
                        onChange={handleFilterChange}
                      />
                      Medicaid Certified
                    </label>
                  </div>
                  <div className="filter-group">
                    <label>
                      <input
                        type="checkbox"
                        name="salsCertified"
                        checked={filters.salsCertified}
                        onChange={handleFilterChange}
                      />
                      SALS Certified
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <p className="result-count">{allFilteredFacilities.length} locations found</p>
        {visibleFacilities.map((facility, index) => (
          <div
            key={facility._id || index}
            id={`facility-${index}`}
            className={`facility-card ${selectedFacility === index ? "selected" : ""}`}
            onClick={() => {
              if (facility.lat && facility.lng) {
                setMapCenter({ lat: facility.lat, lng: facility.lng });
                setSelectedFacility(index);
              } else {
                console.warn(`No coordinates for ${facility.Licensee}`);
              }
            }}
          >
            <div className="facility-logo">
              <img
                src="/assets/navbarlogo.jpg"
                alt="Assisted Living Direct"
                className="facility-logo-img"
              />
            </div>
            <h3>{facility.Licensee || "No Name"}</h3>
            <p>
              <strong>Address:</strong>{" "}
              {facility["Street Address"] || "No Address"}, {facility.City || "Unknown"}{" "}
              {facility.county || "Unknown"} {facility["Zip Code"] || "No Zip Code"}, United
              States
            </p>
            <p>
              <strong>Jurisdiction:</strong> {facility.county || "Unknown"}
            </p>
            {facility["Number of Beds"] && (
              <p className="facility-details">
                <span className="beds-icon">🛏</span> {facility["Number of Beds"]} Total Beds
              </p>
            )}
            {facility["Medicaid Certified"] === "yes" && (
              <div className="medicaid-certified">Medicaid Certified</div>
            )}
            {facility["SALS certified"] === "yes" && (
              <div className="sals-certified">SALS Certified</div>
            )}
            {!facility.lat && !facility.lng && (
              <p className="warning">Coordinates unavailable for this location</p>
            )}
            <div className="facility-actions">
              <button className="action-button email">Email</button>
              <button className="action-button call">Call</button>
              <button className="action-button directions">Get Directions</button>
              {user && (
                <button
                  className="action-button save"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    handleSaveFacility(facility._id);
                  }}
                >
                  Save
                </button>
              )}
            </div>
          </div>
        ))}
        {visibleCount < allFilteredFacilities.length && (
          <button
            className="load-more"
            onClick={() => setVisibleCount((prev) => prev + 50)}
          >
            Load More Facilities
          </button>
        )}
      </div>
      <div className="map-container">
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={10}
            center={mapCenter}
            onLoad={(map) => (mapRef.current = map)}
          >
            {(() => {
              const facilitiesWithCoords = visibleFacilities.filter(
                (facility) =>
                  typeof facility.lat === "number" &&
                  typeof facility.lng === "number" &&
                  !isNaN(facility.lat) &&
                  !isNaN(facility.lng)
              );
              console.log("Facilities with coordinates for map:", facilitiesWithCoords);
              return facilitiesWithCoords.map((facility, index) => (
                <Marker
                  key={facility._id || index}
                  position={{ lat: facility.lat, lng: facility.lng }}
                  onClick={() => {
                    const facilityIndex = visibleFacilities.findIndex(
                      (f) => f._id === facility._id
                    );
                    console.log(
                      `Clicked marker for ${facility.Licensee}, selected index: ${facilityIndex}`
                    );
                    setSelectedFacility(facilityIndex);
                    setMapCenter({ lat: facility.lat, lng: facility.lng });
                  }}
                />
              ));
            })()}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
}

export default Facility;