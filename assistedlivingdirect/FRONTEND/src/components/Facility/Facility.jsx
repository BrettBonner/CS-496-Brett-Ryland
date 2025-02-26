import React, { useState, useEffect, useRef, useMemo } from "react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(50);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [facilityLocations, setFacilityLocations] = useState({});
  const [selectedFacility, setSelectedFacility] = useState(null);
  const mapRef = useRef(null);
  const listRef = useRef(null);

  // Memoize filtered facilities to prevent unnecessary recalculation
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
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "mock-api-key";
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
            }
          } catch (error) {
            console.error("Error fetching coordinates:", error);
          }
        }
      }

      // Only update state if there are new locations to avoid infinite loop
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
            <h3>{facility.Licensee || "No Name"}</h3>
            <p><strong>Address:</strong> {facility["Street Address"] || "No Address"}</p>
            <p><strong>City:</strong> {facility.City || "Unknown"}</p>
            <p><strong>County:</strong> {facility.county || "Unknown"}</p>
            <p><strong>Zip Code:</strong> {facility["Zip Code"] || "No Zip Code"}</p>
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
            {Object.keys(facilityLocations).slice(0, 50).map((key, index) => {
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