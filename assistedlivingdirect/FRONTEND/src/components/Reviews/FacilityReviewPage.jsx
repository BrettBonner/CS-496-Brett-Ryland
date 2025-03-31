import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getFacilities,
  getReviewsByFacilityId,
  submitReview,
} from "../../api";
import "./FacilityReviewPage.css";

function FacilityReviewPage() {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });

  // Fetch all facilities
  useEffect(() => {
    const fetchData = async () => {
      const data = await getFacilities();
      if (data) setFacilities(data);
    };
    fetchData();
  }, []);

  // Fetch reviews when a facility is selected
  useEffect(() => {
    const fetchReviews = async () => {
      if (selectedFacility) {
        const data = await getReviewsByFacilityId(selectedFacility._id);
        setReviews(Array.isArray(data) ? data : []);
      }
    };
    fetchReviews();
  }, [selectedFacility]);

  const handleSubmitReview = async () => {
    if (!user) return alert("Please log in to leave a review.");
    try {
      await submitReview({
        facilityId: selectedFacility._id,
        userId: user.email,
        username: user.username || user.email,
        rating: newReview.rating,
        comment: newReview.comment,
        timestamp: new Date().toISOString(),
      });

      setNewReview({ rating: 5, comment: "" });

      const updatedReviews = await getReviewsByFacilityId(selectedFacility._id);
      setReviews(Array.isArray(updatedReviews) ? updatedReviews : []);
    } catch (err) {
      console.error("Failed to submit review:", err);
    }
  };

  const filteredFacilities = Array.isArray(facilities)
    ? facilities.filter((f) =>
        (f.Licensee || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="review-page">
      {/* Left Column */}
      <div className="review-sidebar">
        <h1>Facility Reviews</h1>

        <input
          type="text"
          placeholder="Search facilities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />

        <div className="facility-list">
          {filteredFacilities.map((facility) => (
            <div key={facility._id} className="facility-card">
              <h3>{facility.Licensee || "No Name"}</h3>
              <p>
                {facility["Street Address"]}, {facility.City}
              </p>
              <button onClick={() => setSelectedFacility(facility)}>
                View Reviews
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column */}
      <div className="review-main">
        {selectedFacility && (
          <div className="review-section">
            <h2>Reviews for {selectedFacility.Licensee}</h2>

            {user ? (
              <div className="review-form">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmitReview();
                  }}
                >
                  <label htmlFor="rating">Rating:</label>
                  <select
                    id="rating"
                    name="rating"
                    value={newReview.rating}
                    onChange={(e) =>
                      setNewReview({ ...newReview, rating: Number(e.target.value) })
                    }
                  >
                    {[5, 4, 3, 2, 1].map((num) => (
                      <option key={num} value={num}>
                        {num} Stars
                      </option>
                    ))}
                  </select>

                  <label htmlFor="comment">Comment:</label>
                  <textarea
                    id="comment"
                    name="comment"
                    placeholder="Write your review..."
                    value={newReview.comment}
                    onChange={(e) =>
                      setNewReview({ ...newReview, comment: e.target.value })
                    }
                  />

                  <button type="submit">Submit Review</button>
                </form>
              </div>
            ) : (
              <p style={{ fontStyle: "italic", color: "gray", marginTop: "1rem" }}>
                Please log in to leave a review.
              </p>
            )}

            <div className="reviews-list">
              {Array.isArray(reviews) && reviews.length > 0 ? (
                reviews.map((review, idx) => (
                  <div key={idx} className="review-item">
                    <strong>{review.username}</strong> — {review.rating} ⭐
                    <p>{review.comment}</p>
                    <small>
                      {review.timestamp
                        ? new Date(review.timestamp).toLocaleString()
                        : "Unknown time"}
                    </small>
                  </div>
                ))
              ) : (
                <p style={{ fontStyle: "italic", color: "gray" }}>
                  No reviews yet. Be the first to write one!
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FacilityReviewPage;
