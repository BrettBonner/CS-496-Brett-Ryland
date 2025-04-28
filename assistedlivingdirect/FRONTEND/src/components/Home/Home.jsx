import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css"; 

function Home({ fetchFacilities }) {
  const navigate = useNavigate(); // ✅ Enables navigation

  return (
    <section className="Home-container">
      <div className="Home-content">
        <img src="../src/assets/MainLogo.png" alt="Main Logo" className="Home-logo" />
        <h2>Featured Facilities</h2>
        <h1>Explore Facilities with Current Availability</h1>

        {/* ✅ Button now fetches data and navigates to a new page */}
        <button
          className="cta-button"
          onClick={async () => {
            await fetchFacilities(); // Fetch data first
            navigate("/facilitysearch"); // Navigate to new page
          }}
        >
          Find Your Facilities
        </button>
      </div>
    </section>
  );
}

export default Home;
