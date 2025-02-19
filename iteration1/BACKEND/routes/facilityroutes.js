const express = require("express");
const facilityRoutes = express.Router();
const multer = require("multer");
const { ObjectId } = require("mongodb");
const { GridFsStorage } = require("multer-gridfs-storage");
const { getDB, connectToServer } = require("../mongo-connect");

// Collection name from database cluster
const dbcollection = "Facility Info V2"

// Ensure database connection before initializing storage
let storage;

// Frontend will send an http request for the backend 
// and these are the routes for connecting the frontend 
// to the backend. Each route corresponds to a different 
// functionality for managing the database

// Create storage engine for GridFS
async function initializeStorage() {
    try {
        // Ensure MongoDB connection before proceeding
        await connectToServer();
        const db = getDB();
        storage = new GridFsStorage({
            db: db,
            file: (req, file) => ({
                filename: file.originalname,
                bucketName: "uploads",
            }),
        });
        console.log("GridFS storage initialized successfully");
    } catch (error) {
        console.error("Failed to initialize GridFS storage:", error);
    }
}

// Initialize GridFS storage once the database is connected
initializeStorage();

const upload = multer({ storage });

// Retrieving all facilities
facilityRoutes.get("/facilities", async (request, response) => {
    try {
        const db = getDB();
        const data = await db.collection(dbcollection).find({}).toArray();
        response.json(data.length > 0 ? data : { message: "No data found" });
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
});

// Retrieving specific facility
facilityRoutes.get("/facilities/:id", async (request, response) => {
    try {
        const db = getDB();
        const facility = await db.collection(dbcollection).findOne({ _id: new ObjectId(request.params.id) });
        facility ? response.json(facility) : response.status(404).json({ error: "Facility not found" });
    } catch (error) {
        response.status(500).json({ error: "Invalid ID format" });
    }
});

// Create a new facility with image upload
facilityRoutes.post("/facilities", upload.single("image"), async (request, response) => {
    try {
        const db = getDB();
        console.log("Uploaded file:", request.file);
        
        const facilityData = {
            ...request.body,
            imageUrl: request.file ? `/files/${request.file.id}` : null,
        };
        console.log("Facility data:", facilityData);
        const result = await db.collection(dbcollection).insertOne(facilityData);
        response.status(201).json(result);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
});

// Updating facility information
facilityRoutes.put("/facilities/:id", async (request, response) => {
    try {
        const db = getDB();
        const result = await db.collection(dbcollection).updateOne(
            { _id: new ObjectId(request.params.id) },
            { $set: request.body }
        );
        result.matchedCount > 0
            ? response.json({ message: "Facility updated successfully" })
            : response.status(404).json({ error: "Facility not found" });
    } catch (error) {
        response.status(500).json({ error: "Invalid ID format" });
    }
});

// Deleting a facility by id
facilityRoutes.delete("/facilities/:id", async (request, response) => {
    try {
        const db = getDB();
        const result = await db.collection(dbcollection).deleteOne({ _id: new ObjectId(request.params.id) });
        result.deletedCount > 0
            ? response.json({ message: "Facility deleted successfully" })
            : response.status(404).json({ error: "Facility not found" });
    } catch (error) {
        response.status(500).json({ error: "Invalid ID format" });
    }
});

module.exports = facilityRoutes;