const express = require("express");
const facilityRoutes = express.Router();
const { ObjectId } = require("mongodb");
const { getDB } = require("../mongo-connect");

// Collection name from database cluster
const dbcollection = "Facility Info V2"

// Frontend will send an http request for the backend 
// and these are the routes for connecting the frontend 
// to the backend. Each route corresponds to a different 
// functionality for managing the database

// Middleware to add update timestamp
const addTimestamp = (req, res, next) => {
    if (req.body && req.body["Number of Beds"] !== undefined) {
        req.body.updatedAt = new Date();
    }
    next();
};

// Retrieving all ALD_database
facilityRoutes.get("/ALD_database", async (request, response) => {
    try {
        const db = getDB();
        // Information for all ALD_database set to array
        const data = await db.collection(dbcollection).find({}).toArray();
        
        response.json(data);

    } catch (error) {
        console.error("Error retrieving all facility information: ", error.message);
    }
});

// Retrieving specific facility by MongoDB ID
facilityRoutes.get("/ALD_database/:id", async (request, response) => {
    try {
        const db = getDB();
        const facility = await db.collection(dbcollection).findOne({ _id: new ObjectId(request.params.id) });

        response.json(facility);

    } catch (error) {
        console.error("Error retrieving specific facility: ", error.message);
    }
});

// Route to retrieve image by ID
facilityRoutes.get("/files/:id", async (req, res) => {
    try {
        const fileId = new ObjectId(req.params.id);
        const file = await gfs.files.findOne({ _id: fileId });

        if (!file) {
            return res.status(404).json({ error: "File not found" });
        }

        // Stream the file back to the client
        const readStream = gfs.createReadStream({ _id: fileId });
        readStream.pipe(res);
    } catch (error) {
        console.error("Error fetching image:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Create new facility with base64 image
facilityRoutes.post("/ALD_database", async (request, response) => {
    try {
        const db = getDB();
        
        // The image is now part of the request body as a base64 string
        const facilityData = {
            ...request.body,
            imageURL: request.body.imageURL // Store base64 string directly
        };

        const insertedFacility = await db.collection(dbcollection).insertOne(facilityData);
        response.status(201).json(insertedFacility);

    } catch (error) {
        console.error("Error creating facility: ", error.message);
        response.status(500).json({ error: "Failed to create facility" });
    }
});

// Updating facility information
facilityRoutes.put("/ALD_database/:id", async (request, response) => {
    try {
        const db = getDB();
        const updateData = { ...request.body, updatedAt: new Date() };
        console.log("Updating facility with ID:", request.params.id, "Data:", updateData);
        const insertedFacility = await db.collection(dbcollection).updateOne(
            { _id: new ObjectId(request.params.id) },
            { $set: updateData }
        );
        console.log("Update result:", insertedFacility);
        response.json(insertedFacility);
    } catch (error) {
        console.error("Error updating facility: ", error.message);
        response.status(500).json({ error: "Failed to update facility" });
    }
});

// Deleting a facility by ID
facilityRoutes.delete("/ALD_database/:id", async (request, response) => {
    try {
        const db = getDB();
        // Attempting to delete the facility document matching the ID from MongoDB
        const insertedFacility = await db.collection(dbcollection).deleteOne({ _id: new ObjectId(request.params.id) });

        response.json(insertedFacility);
        
    } catch (error) {
        console.error("Error deleting facility: ", error.message);
    }
});

module.exports = facilityRoutes;