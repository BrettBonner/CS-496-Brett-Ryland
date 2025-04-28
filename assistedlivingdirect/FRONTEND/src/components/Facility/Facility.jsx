import React, { useState, useEffect, useRef, useMemo } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useAuth } from "../../context/AuthContext";
import { saveFacility } from "../../api";
import axios from "axios";
import "./Facility.css";

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

const defaultCenter = {
  lat: 39.2904,
  lng: -76.6122,
};

function Facility({ facilities }) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(50);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [selectedFacilityId, setSelectedFacilityId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [geocodeError, setGeocodeError] = useState(null);
  const [filters, setFilters] = useState({
    radius: 0,
    medicaidCertified: false,
    salsCertified: false,
  });
  const [showFiltersPopdown, setShowFiltersPopdown] = useState(false);
  const mapRef = useRef(null);
  const listRef = useRef(null);
  const isUserScrolling = useRef(false);

  // Get browser geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation((prev) => prev ?? coords);
          setMapCenter((prev) => prev ?? coords);
        },
        (error) => {
          console.warn("Geolocation error:", error);
          setGeocodeError("Unable to access your location.");
        }
      );
    }
  }, []);

  // Update userLocation when search query is submitted
  useEffect(() => {
    if (searchQuery.trim()) {
      const geocodeAddress = async () => {
        try {
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
              searchQuery
            )}&region=us-md&key=${apiKey}`
          );
          if (response.data.results.length > 0) {
            const { lat, lng } = response.data.results[0].geometry.location;
            setUserLocation({ lat, lng });
            setMapCenter({lat, lng})
            setGeocodeError(null);
          } else {
            setGeocodeError("Could not find location.");
          }
        } catch (err) {
          setGeocodeError("Error geocoding location.");
        }
      };
      geocodeAddress();
    } else {
      setGeocodeError(null); // Don't clear userLocation
    }
  }, [searchQuery]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3958.8; // Radius of Earth in miles
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const allFilteredFacilities = useMemo(() => {
    let filtered = facilities;

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (facility) =>
          facility.City?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          facility.county?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(facility["Zip Code"] || "").includes(searchQuery)
      );
    }

    if (filters.medicaidCertified) {
      filtered = filtered.filter((f) => f["Medicaid Certified"] === "yes");
    }

    if (filters.salsCertified) {
      filtered = filtered.filter((f) => f["SALS certified"] === "yes");
    }

    if (filters.radius > 0 && userLocation) {
      filtered = filtered.filter((f) => {
        const lat = parseFloat(f.lat);
        const lng = parseFloat(f.lng);
        if (isNaN(lat) || isNaN(lng)) return false;
        const dist = calculateDistance(userLocation.lat, userLocation.lng, lat, lng);
        console.log(`Facility "${f["Licensee"]}" is ${dist.toFixed(2)} miles away`);
        return dist <= filters.radius;
      });
    }

    return filtered;
  }, [facilities, searchQuery, filters, userLocation]);

  const visibleFacilities = allFilteredFacilities.slice(0, visibleCount);

  const facilitiesWithCoords = useMemo(() => {
    return visibleFacilities.filter((f) => {
      const lat = parseFloat(f.lat);
      const lng = parseFloat(f.lng);
      return !isNaN(lat) && !isNaN(lng);
    });
  }, [visibleFacilities]);

  useEffect(() => {
    const first = facilitiesWithCoords[0];
    if (first) {
      const lat = parseFloat(first.lat);
      const lng = parseFloat(first.lng);
      const newCenter = { lat, lng };
      
      if (
        !mapCenter ||
        mapCenter.lat.toFixed(4) !== lat.toFixed(4) ||
        mapCenter.lng.toFixed(4) !== lng.toFixed(4)
      ) {
        setMapCenter({ lat, lng });
      if (mapRef.current) {
        mapRef.current.panTo(newCenter);
        mapRef.current.setZoom(10);
        }
      }
    }
  }, [facilitiesWithCoords]);

  useEffect(() => {
    if (selectedFacilityId !== null && listRef.current && !isUserScrolling.current) {
      const idx = visibleFacilities.findIndex((f) => f._id === selectedFacilityId);
      if (idx !== -1) {
        const el = document.getElementById(`facility-${idx}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [selectedFacilityId]);

  useEffect(() => {
    const handleScroll = () => {
      isUserScrolling.current = true;
      setTimeout(() => (isUserScrolling.current = false), 1000);
    };
    const list = listRef.current;
    list?.addEventListener("scroll", handleScroll);
    return () => list?.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSaveFacility = async (facilityId) => {
    if (!user) return alert("Please log in to save facilities.");
    try {
      await saveFacility(user.username, facilityId);
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : parseInt(value),
    }));
  };

  const handleFacilitySelect = (facility) => {
    const lat = parseFloat(facility.lat);
    const lng = parseFloat(facility.lng);
    if (!isNaN(lat) && !isNaN(lng)) {
      setSelectedFacilityId(facility._id);
      setMapCenter({ lat, lng });
      if (mapRef.current) {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(15);
      }
    }
  };

  return (
    <div className="facilities-container">
      <div className="facilities-list" ref={listRef}>
        {/* Search + Filter */}
        <div className="search-bar-container">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Enter Zip, County, or City..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-button">🔍</button>
            <div className="filter-button-container">
              <button
                className="filter-button"
                onClick={() => setShowFiltersPopdown(!showFiltersPopdown)}
              >
                <span role="img" aria-label="filter">🟣</span>
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
        {geocodeError && filters.radius > 0 && (
          <p className="filter-error">{geocodeError}</p>
        )}

        {/* Facility Cards */}
        {visibleFacilities.map((facility, index) => {
          const lat = parseFloat(facility.lat);
          const lng = parseFloat(facility.lng);
          return (
            <div
              key={facility._id || index}
              id={`facility-${index}`}
              className={`facility-card ${
                selectedFacilityId === facility._id ? "selected" : ""
              }`}
              onClick={() => handleFacilitySelect(facility)}
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
                <strong>Address:</strong> {facility["Street Address"]}, {facility.City},{" "}
                {facility.county} {facility["Zip Code"]}
              </p>
              <p><strong>Jurisdiction:</strong> {facility.county}</p>
              {facility["Number of Beds"] && (
                <p className="facility-details">🛏 {facility["Number of Beds"]} Total Beds</p>
              )}
              {facility["Medicaid Certified"] === "yes" && (
                <div className="medicaid-certified">Medicaid Certified</div>
              )}
              {facility["SALS certified"] === "yes" && (
                <div className="sals-certified">SALS Certified</div>
              )}
              <div className="facility-actions">
                <button className="action-button">Email</button>
                <button className="action-button">Call</button>
                <button className="action-button">Get Directions</button>
                {user && (
                  <button
                    className="action-button save"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveFacility(facility._id);
                    }}
                  >
                    Save
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {visibleCount < allFilteredFacilities.length && (
          <button
            className="load-more"
            onClick={() => setVisibleCount((prev) => prev + 50)}
          >
            Load More Facilities
          </button>
        )}
      </div>

      {/* Google Map */}
      <div className="map-container">
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={10}
            center={mapCenter}
            onLoad={(map) => (mapRef.current = map)}
            options={{
              gestureHandling: "auto",
              draggable: true,
              zoomControl: true,
              scrollwheel: true,
              disableDoubleClickZoom: false,
              fullscreenControl: true,
              mapTypeControl: true,
            }}
          >
            {facilitiesWithCoords.map((facility) => (
              <Marker
                key={facility._id}
                position={{
                  lat: parseFloat(facility.lat),
                  lng: parseFloat(facility.lng),
                }}
                onClick={() => handleFacilitySelect(facility)}
              />
            ))}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
}

export default Facility;
