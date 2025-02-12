import React from "react";
import { useNavigate } from "react-router-dom";
import "./Hero.css"; 

function Hero({ fetchFacilities }) {
  const navigate = useNavigate(); // ✅ Enables navigation

  return (
    <section className="hero-container">
      <div className="hero-content">
        <img src="../src/assets/MainLogo.jpeg" alt="Main Logo" className="hero-logo" />
        <h2>Find The Perfect Home For Your Loved Ones</h2>
        <h1>Discover All Assisted Living in Maryland</h1>

        {/* ✅ Button now fetches data and navigates to a new page */}
        <button
          className="cta-button"
          onClick={async () => {
            console.log("Find Your Facilities button clicked!");
            await fetchFacilities(); // Fetch data first
            navigate("/facilities"); // Navigate to new page
          }}
        >
          Find Your Facilities
        </button>
      </div>
    </section>
  );
}

export default Hero;
