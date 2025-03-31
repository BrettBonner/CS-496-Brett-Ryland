// reviewroutes.js
const express = require("express");
const { getDB } = require("../mongo-connect");
const reviewRoutes = express.Router();

// GET reviews for a specific facility
reviewRoutes.get("/:facilityId", async (req, res) => {
  try {
    const db = getDB();
    const reviews = await db
      .collection("reviews")
      .find({ facilityId: req.params.facilityId })
      .toArray();
    res.json(reviews);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// POST a new review
reviewRoutes.post("/", async (req, res) => {
  try {
    const db = getDB();
    const review = {
      facilityId: String(req.body.facilityId),
      userId: req.body.userId,
      username: req.body.username,
      rating: req.body.rating,
      comment: req.body.comment,
      timestamp: new Date(),
    };

    const result = await db.collection("reviews").insertOne(review);
    res.status(201).json(result);
  } catch (err) {
    console.error("Error saving review:", err);
    res.status(500).json({ error: "Failed to save review" });
  }
});

module.exports = reviewRoutes;
