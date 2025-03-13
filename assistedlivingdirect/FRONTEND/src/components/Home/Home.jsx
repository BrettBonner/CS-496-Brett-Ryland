import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css"; 

function Home({ fetchFacilities }) {
  const navigate = useNavigate(); // ✅ Enables navigation

  return (
    <section className="Home-container">
      <div className="Home-content">
        <img src="../src/assets/MainLogo.jpeg" alt="Main Logo" className="Home-logo" />
        <h2>Find The Perfect Home For Your Loved Ones</h2>
        <h1>Discover All Assisted Living in Maryland</h1>

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
