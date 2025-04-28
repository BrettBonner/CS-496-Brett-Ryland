import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css"; 

function Home({ fetchFacilities }) {
  const navigate = useNavigate(); // ✅ Enables navigation

  return (
    <>
      <section className="Home-container">
        <div className="Home-content">
          <img src="../src/assets/MainLogo.png" alt="Main Logo" className="Home-logo" />
          <h2>Featured Facilities</h2>

          <div className="featured-images">
            <div className="featured-image-container">
              <img src="../src/assets/bestcare.jpg" alt="Featured Facility 1" className="featured-image" />
            </div>
            <div className="featured-image-container">
              <img src="../src/assets/woodsbestcare.jpg" alt="Featured Facility 2" className="featured-image" />
            </div>
          </div>

          <h1>Explore Facilities with Current Availability</h1>
          <h4>Discover our featured assisted living facilities, carefully selected for their current bed availability. By providing real-time data on beds, services, and amenities, we strive to offer the same up-to-date availability as hotels do.</h4>

          {/* Button now fetches data and navigates to a new page */}
          <button
            className="cta-button"
            onClick={async () => {
              await fetchFacilities(); // Fetch data first
              navigate("/facilitysearch"); // Navigate to new page
            }}
          >
            Find Your Facilities
          </button>
          
          <div className="info-section">
            <div className="info-text">
              <h1>Discover All Assisted Living in Maryland</h1>
              <ul className="info-list">
                <li>
                  <strong>Independent Search Process</strong>
                  <p>Find facilities without relying on placement agencies.</p>
                </li>
                <li>
                  <strong>Medicaid and Senior Assisted Living Subsidy Filtering</strong>
                  <p>Filter through facilities based on your criterias.</p>
                </li>
                <li>
                  <strong>First to showcase Availability</strong>
                  <p>Connect with facilities that are actively seeking inquires.</p>
                </li>
              </ul>
            </div>
            <div className="info-image-container">
              <img src="../src/assets/informationimage.jpg" alt="Information Image" className="info-image" />
            </div>
          </div>
        </div>
      </section>
  
      <footer className="site-footer">
        <img src="../src/assets/footer.jpg" alt="Footer House" className="footer-image" />
      </footer>
    </>
  );
}

export default Home;