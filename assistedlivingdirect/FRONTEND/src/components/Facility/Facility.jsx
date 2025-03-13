import React, { useState, useEffect, useRef, useMemo } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useAuth } from "../../context/AuthContext"; // Adjust path
import { saveFacility, removeSavedFacility } from "../../api"; // Add new functions
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
  const mapRef = useRef(null);
  const listRef = useRef(null);

  // Filter facilities based on search query
  const allFilteredFacilities = useMemo(() => {
    return facilities.filter(
      (facility) =>
        facility.City?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.county?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(facility["Zip Code"] || "").includes(searchQuery)
    );
  }, [facilities, searchQuery]);

  const visibleFacilities = allFilteredFacilities.slice(0, visibleCount);

  // Set initial map center on mount
  useEffect(() => {
    const firstWithCoords = facilities.find((facility) => facility.lat && facility.lng);
    if (firstWithCoords) {
      setMapCenter({ lat: firstWithCoords.lat, lng: firstWithCoords.lng });
    } else {
      console.warn("No facilities with coordinates found, using default center");
      setMapCenter(defaultCenter);
    }
  }, [facilities]);

  // Scroll to selected facility
  useEffect(() => {
    if (selectedFacility !== null && listRef.current) {
      const selectedElement = document.getElementById(`facility-${selectedFacility}`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [selectedFacility]);

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
            {visibleFacilities
              .filter((facility) => facility.lat && facility.lng)
              .map((facility, index) => (
                <Marker
                  key={facility._id || index}
                  position={{ lat: facility.lat, lng: facility.lng }}
                  onClick={() => {
                    const facilityIndex = visibleFacilities.findIndex(
                      (f) => f._id === facility._id
                    );
                    console.log(
                      `Clicked marker for ${facility.Licensee} (Bel Air), selected index: ${facilityIndex}`
                    );
                    setSelectedFacility(facilityIndex);
                    setMapCenter({ lat: facility.lat, lng: facility.lng });
                  }}
                />
              ))}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
}

export default Facility;