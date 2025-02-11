import React from "react";
import "../styles/Navbar.css"; // Make sure this path is correct

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left Side - Logo */}
        <div className="logo">
          <img src="/MainLogo.jpeg" alt="Assisted Living Direct" />
          <span>Assisted Living Direct</span>
        </div>

        {/* Center - Links */}
        <ul className="nav-links">
          <li><a href="#">Find Assisted Living</a></li>
          <li><a href="#">Contact</a></li>
        </ul>

        {/* Right Side - Featured Facilities Button */}
        <button className="featured-btn">Featured Facilities ❤️</button>
      </div>
    </nav>
  );
}

export default Navbar;
