import React from "react";
import Navbar from "./components/Navbar"; 
import HeroSection from "./components/HeroSection"; 
import "./App.css";

function App() {
  return (
    <div>
      <Navbar />  {/* Navbar at the top */}
      <HeroSection />  {/* Hero section below the navbar */}
    </div>
  );
}

export default App;

