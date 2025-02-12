import React from "react";
import { getFacilities, createFacility, deleteFacility, getFacilityById } from "./api";
import { useState, useEffect } from "react";
import "./App.css";

import Navbar from "./components/Navbar/Navbar"; 
import Hero from "./components/Hero/Hero"; 

function App() {
  // Variables used for retrieving data from database for facilities
  const [data, setData] = useState()

  useEffect(() => {
    async function loadAllFacilities() {
      let data = await getFacilities()
      if (data) {
        setData(data)
      }
    }

    loadAllFacilities()
  }, [])

  return (
    <div>
      <Hero></Hero>
      <Navbar></Navbar>
      {JSON.stringify(data)}
    </div>
  );
}

export default App;
