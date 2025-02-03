import React from 'react';
import '../styles/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <h1 className="logo">Assisted Living Direct</h1>
      <div className="nav-links">
        <button className="btn">Find Assisted Living</button>
        <button className="btn">Contact</button>
        <button className="btn featured">Featured Facilities</button>
      </div>
    </nav>
  );
};

export default Navbar;
