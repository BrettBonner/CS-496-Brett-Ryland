import React, { useState, useEffect, useRef, useMemo } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import axios from "axios";
import "./Facility.css";

// CSS for container of Google Maps to ensure it is big enough for display
const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

const defaultCenter = {
  lat: 39.2904,
  lng: -76.6122, // Default center in Baltimore
};

function Facility({ facilities }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(50);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [facilityLocations, setFacilityLocations] = useState({});
  const [selectedFacility, setSelectedFacility] = useState(null);
  const mapRef = useRef(null);
  const listRef = useRef(null);

  const allFilteredFacilities = useMemo(() => {
    return facilities.filter(
      (facility) =>
        facility.City.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.county.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(facility["Zip Code"]).includes(searchQuery)
    );
  }, [facilities, searchQuery]);

  const visibleFacilities = allFilteredFacilities.slice(0, visibleCount);

  useEffect(() => {
    async function fetchLatLng() {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'mock-api-key';
      let updatedLocations = {};

      for (const facility of visibleFacilities) {
        const address = `${facility["Street Address"]}, ${facility.City}, ${facility.county}`;
        if (!facilityLocations[facility.Licensee]) {
          try {
            const response = await axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
            );
            if (response && response.data && response.data.results.length > 0) {
              updatedLocations[facility.Licensee] = {
                lat: response.data.results[0].geometry.location.lat,
                lng: response.data.results[0].geometry.location.lng,
              };
            } else {
              console.warn(`No geocoding results for ${address}`);
            }
          } catch (error) {
            console.error("Error fetching coordinates:", error);
          }
        }
      }

      if (Object.keys(updatedLocations).length > 0) {
        setFacilityLocations((prev) => ({ ...prev, ...updatedLocations }));
      }
    }

    fetchLatLng();
  }, [visibleFacilities, facilityLocations]);

  useEffect(() => {
    if (selectedFacility !== null && listRef.current) {
      const selectedElement = document.getElementById(`facility-${selectedFacility}`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [selectedFacility]);

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
            key={index}
            id={`facility-${index}`}
            className={`facility-card ${selectedFacility === index ? "selected" : ""}`}
            onClick={() => {
              if (facilityLocations[facility.Licensee]) {
                setMapCenter(facilityLocations[facility.Licensee]);
                setSelectedFacility(index);
              }
            }}
          >
            <div className="facility-logo">
              <img src="/assets/navbarlogo.jpg" alt="Assisted Living Direct" className="facility-logo-img" />
            </div>
            <h3>{facility.Licensee || "No Name"}</h3>
            <p>
              <strong>Address:</strong> {facility["Street Address"] || "No Address"}, {facility.City || "Unknown"}, {facility.county || "Unknown"} {facility["Zip Code"] || "No Zip Code"}, United States
            </p>
            <p>
              <strong>Jurisdiction:</strong> {facility.county || "Unknown"}
            </p>
            {/* Display Total Beds */}
            {facility["Number of Beds"] && (
              <p className="facility-details">
                <span className="beds-icon">🛏</span> {facility["Number of Beds"]} Total Beds
              </p>
            )}
            {/* Display Medicaid or SALS badge based on MongoDB variables */}
            {facility["Medicaid Certified"] === "yes" && (
              <div className="medicaid-certified">Medicaid Certified</div>
            )}
            {facility["SALS certified"] === "yes" && (
              <div className="sals-certified">SALS Certified</div>
            )}
            <div className="facility-actions">
              <button className="action-button email">Email</button>
              <button className="action-button call">Call</button>
              <button className="action-button directions">Get Directions</button>
            </div>
          </div>
        ))}
        {visibleCount < allFilteredFacilities.length && (
          <button className="load-more" onClick={() => setVisibleCount((prev) => prev + 50)}>
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
            {Object.keys(facilityLocations)
              .slice(0, 50)
              .map((key, index) => {
                const facility = visibleFacilities.find((f) => f.Licensee === key);
                if (!facility) return null;
                return (
                  <Marker
                    key={index}
                    position={facilityLocations[key]}
                    onClick={() => {
                      const facilityIndex = visibleFacilities.findIndex((f) => f.Licensee === key);
                      setSelectedFacility(facilityIndex);
                      setMapCenter(facilityLocations[key]);
                    }}
                  />
                );
              })}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
}

export default Facility;