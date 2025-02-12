import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { getFacilities } from "./api";
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Facility from "./components/Facility/Facility";
import FacilityPage from "./components/FacilityPage/FacilityPage";

function App() {
  const [facilities, setFacilities] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchFacilities = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const data = await getFacilities();
      console.log("API Response:", data); // ✅ Debug API Data
      if (data && data.length > 0) {
        setFacilities(data);
      } else {
        console.warn("No facilities found from API.");
      }
    } catch (error) {
      setError("Error fetching facility data.");
      console.error("Error fetching facilities:", error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<Hero fetchFacilities={fetchFacilities} />} />

        {/* New Facilities Page */}
        <Route path="/facilities" element={<FacilityPage facilities={facilities} />} />
      </Routes>
    </Router>
  );
}

export default App;
