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
        console.error("Failed to initialize GridFS storage:", error.message);
    }
}

// Initialize GridFS storage once the database is connected
// THis is how images will be stored on MongoDB
initializeStorage();
const upload = multer({ storage });

// Retrieving all facilities
facilityRoutes.get("/facilities", async (request, response) => {
    try {
        const db = getDB();
        // Information for all facilities set to array
        const data = await db.collection(dbcollection).find({}).toArray();
        
        response.json(data);
    } catch (error) {
        console.error("Error retrieving all facility information: ", error.message);
    }
});

// Retrieving specific facility by MongoDB ID
facilityRoutes.get("/facilities/:id", async (request, response) => {
    try {
        const db = getDB();
        const facility = await db.collection(dbcollection).findOne({ _id: new ObjectId(request.params.id) });

        response.json(facility);
    } catch (error) {
        console.error("Error retrieving specific facility: ", error.message);
    }
});

// Image upload for when a new facility is created
facilityRoutes.post("/facilities", upload.single("image"), async (request, response) => {
    try {
        const db = getDB();
        // HTTP request for facility
        console.log("Uploaded file:", request.file);
        
        // Creating the facility data object and directly assigning URL of image
        const facilityData = {
            ...request.body,
            imageUrl: `/files/${request.file.id}`
        };

        // Inserting the facility data into the database
        console.log("Facility data:", facilityData);
        const insertedFacility = await db.collection(dbcollection).insertOne(facilityData);

        // Successful HTTP response
        response.status(201).json(insertedFacility);
    } catch (error) {
        console.error("Error creating facility and uploading image: ", error.message);
    }
});

// Updating facility information
facilityRoutes.put("/facilities/:id", async (request, response) => {
    try {
        const db = getDB();

        // Attempting to update the facility document matching the ID from MongoDB
        const insertedFacility = await db.collection(dbcollection).updateOne(
            // Finding facility with matching ID from MongoDB
            { _id: new ObjectId(request.params.id) },
            // Updating fields with new data from request body
            { $set: request.body }
        );

        response.json(insertedFacility);
    } catch (error) {
        console.error("Error updating facility: ", error.message);
    }
});

// Deleting a facility by ID
facilityRoutes.delete("/facilities/:id", async (request, response) => {
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