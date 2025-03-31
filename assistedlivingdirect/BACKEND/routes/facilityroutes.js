const express = require("express");
const facilityRoutes = express.Router();
const { ObjectId } = require("mongodb");
const { getDB } = require("../mongo-connect");


const dbcollection = "Facility Info V2";

// Retrieve all facilities
facilityRoutes.get("/", async (req, res) => {
  try {
    const db = getDB();
    const data = await db.collection(dbcollection).find({}).toArray();
    res.json(data);
  } catch (error) {
    console.error("Error retrieving facilities:", error.message);
    res.status(500).json({ error: "Failed to retrieve facilities" });
  }
});

// Retrieve a specific facility by ID
facilityRoutes.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid facility ID format" });
    }

    const db = getDB();
    const facility = await db.collection(dbcollection).findOne({
      _id: new ObjectId(id),
    });

    if (!facility) {
      return res.status(404).json({ error: "Facility not found" });
    }

    res.json(facility);
  } catch (error) {
    console.error("Error retrieving facility:", error.message);
    res.status(500).json({ error: "Failed to retrieve facility" });
  }
});

// Create a new facility
facilityRoutes.post("/", async (req, res) => {
  try {
    const db = getDB();
    const facilityData = {
      ...req.body,
      imageURL: req.body.imageURL || null,
      createdAt: new Date(),
    };

    const result = await db.collection(dbcollection).insertOne(facilityData);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating facility:", error.message);
    res.status(500).json({ error: "Failed to create facility" });
  }
});

// Update a facility
facilityRoutes.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid facility ID format" });
    }

    const db = getDB();
    const updateData = {
      ...req.body,
      updatedAt: new Date(),
    };

    const result = await db.collection(dbcollection).updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    res.json(result);
  } catch (error) {
    console.error("Error updating facility:", error.message);
    res.status(500).json({ error: "Failed to update facility" });
  }
});

// Delete a facility
facilityRoutes.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid facility ID format" });
    }

    const db = getDB();
    const result = await db.collection(dbcollection).deleteOne({
      _id: new ObjectId(id),
    });

    res.json(result);
  } catch (error) {
    console.error("Error deleting facility:", error.message);
    res.status(500).json({ error: "Failed to delete facility" });
  }
});

module.exports = facilityRoutes;
