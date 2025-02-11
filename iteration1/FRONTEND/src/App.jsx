import React from "react";
import Navbar from "./components/Navbar/Navbar"; 
import HeroSection from "./components/Hero/Hero"; 
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

