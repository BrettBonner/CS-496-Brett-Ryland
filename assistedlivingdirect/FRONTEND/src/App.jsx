import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { getFacilities } from "./api";
import Admin from "./components/Admin/Admin";
import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Home/Home";
import Facility from "./components/Facility/Facility";
import FacilitySearch from "./components/FacilitySearch/FacilitySearch";
import Login from "./components/Login/Login";
import Register from "./components/Login/Register/Register";
import Account from "./components/Account/Account";
import { AuthProvider } from "./context/AuthContext";

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
            console.error("Error fetching facilities:", error.message);

        } finally {
            setLoading(false);
        }
    };
    
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/" element={
                        <>
                            <Navbar />
                            <Home fetchFacilities={fetchFacilities} />
                        </>
                    } />
                    <Route path="/facilitysearch" element={
                        <>
                            <Navbar />
                            <FacilitySearch facilities={facilities} />
                        </>
                    } />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/account" element={<Account />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
