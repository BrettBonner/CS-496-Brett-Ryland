import React, { useState } from "react";
import {GoogleMap, LoadScript, Marker} from "@react-google-maps/api"
import "./Facility.css"; // Ensure styling is linked

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

const defaultCenter = {
  lat: 39.2904,
  lng: -76.6122,
}

console.log("Google Maps API Key:", import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

function Facility({ facilities }) {
  const [visibleCount, setVisibleCount] = useState(50); // Show first 50 initially
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  return (
    <div className="facilities-container">
      {/* Left-side scrolling list */}
      <div className="facilities-list">
        {facilities.slice(0, visibleCount).map((facility, index) => {
          const isMedicaidCertified =
            facility["Medicaid Certified"]?.trim().toLowerCase() === "yes";

          return (
            <div
              key={index}
              className="facility-card"
              onClick={() =>
                facility.lat && facility.lng
                  ? setMapCenter({ lat: facility.lat, lng: facility.lng })
                  : null
              }
            >
              <h3>{facility.Licensee || "No Name"}</h3>
              <p><strong>Address:</strong> {facility["Street Address"] || "No Address"}</p>
              <p><strong>City:</strong> {facility.City || "Unknown"}</p>
              <p><strong>County:</strong> {facility.county || "Unknown"}</p>
              <p><strong>Level of Care:</strong> {facility["Level of Care"] || "N/A"}</p>
              <p>
                <strong>Medicaid Certified:</strong> 
                {isMedicaidCertified ? " ✅ Yes" : " ❌ No"}
              </p>
            </div>
          );
        })}

        {/* Load More Button inside list */}
        {visibleCount < facilities.length && (
          <button className="load-more" onClick={() => setVisibleCount(visibleCount + 50)}>
            Load More Facilities
          </button>
        )}
      </div>

      {/* Right-side Google Maps */}
      <div className="map-container">
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <GoogleMap mapContainerStyle={mapContainerStyle} zoom={10} center={mapCenter}>
            {/* Map Markers for Each Facility */}
            {facilities.map((facility, index) => (
              facility.lat && facility.lng ? (
                <Marker key={index} position={{ lat: facility.lat, lng: facility.lng }} />
              ) : null
            ))}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
}

export default Facility;