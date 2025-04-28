import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left Side - Home Button */}
        <div className="logo">
          <Link to="/">
            <img src="../src/assets/navbarlogo.jpg" alt="Assisted Living Direct" />
          </Link>
        </div>

        {/* Right Side - Navigation Links */}
        <div className="right-container">
          <Link to="/facilitysearch">Find Assisted Living</Link>
          <Link to="/contact">Contact</Link>
          {user ? (
            <Link to="/account" className="username">
              {user.username}
            </Link>
          ) : (
            <Link to="/login">Login</Link>
          )}

          {/* Featured Facilities */}
          <div
            className="Featured-Facil"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <button className="featured-btn" type="button">
              Featured Facilities ❤️
            </button>

            {/* Dropdown */}
            <div className={`featured-dropdown ${isHovered ? "show" : ""}`}>
              <div className="dropdown-header">
                <h2>Featured Facilities</h2>
                <p>Explore our curated selection of assisted living facilities, chosen for their exceptional care
                and amenities.</p>
              </div>
              <div className="facilities-container">
                <div className="facility">
                  <img src="../src/assets/bestcare.jpg" alt="Facility 1" />
                  <div className="facility-text">
                    <h3>BestCare Assisted Living 639, LLC</h3>
                  </div>
                </div>
                <div className="facility">
                  <img src="../src/assets/woodsbestcare.jpg" alt="Facility 2" />
                  <div className="facility-text">
                    <h3>Woods of BestCare Assisted Living</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;