import React from "react";
import "./Navbar.css"; // Make sure this path is correct

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left Side - Logo */}
        <div className="logo">
          <img src="../src/assets/navbarlogo.jpg" alt="Assisted Living Direct" />
        </div>
        <div className="right-container">
          <a href="#">Find Assisted Living</a>
          <a href="#">Contact</a>
          <div className="Featured-Facil">
            <button className="featured-btn">Featured Facilities ❤️</button>
          </div>
        </div>
        {/* Center - Links */}
      </div>
    </nav>
  );
}

export default Navbar;
