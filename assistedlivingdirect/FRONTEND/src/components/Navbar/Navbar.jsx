import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
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
            <div className="Featured-Facil">
                <Link to="/featured">
                    <button className="featured-btn">Featured Facilities ❤️</button>
                </Link>
            </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
