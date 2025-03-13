import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Adjust path
import "./Navbar.css";

function Navbar() {
    const { user } = useAuth();

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