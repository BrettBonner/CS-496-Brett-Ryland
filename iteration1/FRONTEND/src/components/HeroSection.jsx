import React from "react";
import "../styles/HeroSection.css"; 

function HeroSection() {
  return (
    <section className="hero-container">
      {/* Large Centered Logo */}
      <div className="hero-content">
        <img src="/MainLogo.jpeg" alt="Main Logo" className="hero-logo" />
        <h2>Find The Perfect Home For Your Loved Ones</h2>
        <h1>Discover All Assisted Living in Maryland</h1>
        <button className="cta-button">Find Your Facilities</button>
      </div>
    </section>
  );
}

export default HeroSection;

