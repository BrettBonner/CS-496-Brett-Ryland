import React, { useState } from "react";
import "./Facility.css"; // Ensure styling is linked

function Facility({ facilities }) {
  const [visibleCount, setVisibleCount] = useState(50); // Show first 50 initially

  return (
    <div className="facilities-container">
      {/* Left-side scrolling list */}
      <div className="facilities-list">
        {facilities.slice(0, visibleCount).map((facility, index) => {
          // Ensure the Medicaid Certified field is processed correctly
          const isMedicaidCertified =
            facility["Medicaid Certified"]?.trim().toLowerCase() === "yes";
  
          return (
            <div key={index} className="facility-card">
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
  
      {/* Right-side Map Container */}
      <div className="map-container">
        {/* Your map component goes here */}
      </div>
    </div>
  );
  
}

export default Facility;
