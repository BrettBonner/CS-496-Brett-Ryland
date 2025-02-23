import React, { useEffect } from "react";
import Facility from "../Facility/Facility";

function FacilitySearch({ facilities }) {
  useEffect(() => {
    console.log("Facilities Data Received: ", facilities); // ✅ Debugging
  }, [facilities]);

  return (
    <div>
      <h1>Available Assisted Living Facilities</h1>
      <Facility facilities={facilities} />
    </div>
  );
}

export default FacilitySearch;
