import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
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
  const [searchQuery, setSearchQuery] = useState(""); // Search input
  const [visibleCount, setVisibleCount] = useState(50);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [facilityLocations, setFacilityLocations] = useState({});
  const [selectedFacility, setSelectedFacility] = useState(null);
  const mapRef = useRef(null);
  const listRef = useRef(null);

  // Search all facilities (full dataset)
  const allFilteredFacilities = facilities.filter((facility) =>
    facility.City.toLowerCase().includes(searchQuery.toLowerCase()) ||
    facility.county.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(facility["Zip Code"]).includes(searchQuery)
  );

  // Display only up to 'visibleCount' facilities on the list and map
  const visibleFacilities = allFilteredFacilities.slice(0, visibleCount);

  useEffect(() => {
    async function fetchLatLng() {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      let updatedLocations = {};

      for (const facility of visibleFacilities) {
        const address = `${facility["Street Address"]}, ${facility.City}, ${facility.county}`;
        if (!facilityLocations[facility.Licensee]) { // Avoid duplicate API calls
          try {
            const response = await axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
            );
            if (response.data.results.length > 0) {
              updatedLocations[facility.Licensee] = {
                lat: response.data.results[0].geometry.location.lat,
                lng: response.data.results[0].geometry.location.lng,
              };
            }
          } catch (error) {
            console.error("Error fetching coordinates:", error);
          }
        }
      }

      setFacilityLocations((prev) => ({ ...prev, ...updatedLocations }));
    }

    fetchLatLng();
  }, [visibleFacilities]);

  // Scroll to selected facility when clicking a pin
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
        {/* Search Bar */}
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
            <h3>{facility.Licensee || "No Name"}</h3>
            <p><strong>Address:</strong> {facility["Street Address"] || "No Address"}</p>
            <p><strong>City:</strong> {facility.City || "Unknown"}</p>
            <p><strong>County:</strong> {facility.county || "Unknown"}</p>
            <p><strong>Level of Care:</strong> {facility["Level of Care"] || "N/A"}</p>
          </div>
        ))}

        {visibleCount < allFilteredFacilities.length && (
          <button className="load-more" onClick={() => setVisibleCount((prev) => prev + 50)}>
            Load More Facilities
          </button>
        )}
      </div>

      {/* Google Map - Only Load Markers for the First 50 Visible Facilities */}
      <div className="map-container">
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={10}
            center={mapCenter}
            onLoad={(map) => (mapRef.current = map)}
          >
            {Object.keys(facilityLocations)
              .slice(0, 50) // ✅ Only load 50 markers at a time
              .map((key, index) => {
                const facility = visibleFacilities.find((f) => f.Licensee === key);
                if (!facility) return null;

                return (
                  <Marker
                    key={index}
                    position={facilityLocations[key]}
                    onClick={() => {
                      const facilityIndex = visibleFacilities.findIndex(f => f.Licensee === key);
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
