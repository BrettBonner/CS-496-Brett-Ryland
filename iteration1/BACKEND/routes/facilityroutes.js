const express = require('express')
let facilityRoutes = express.Router()
const { getDB } = require('../mongo-connect')
const { ObjectId } = require('mongodb')

// Collection name from database cluster
const dbcollection = "Facility Info V2"

// Frontend will send an http request for the backend 
// and these are the routes for connecting the frontend 
// to the backend. Each route corresponds to a different 
// functionality for managing the database

// Retrieve all facilities
facilityRoutes.route("/facilities").get(async (request, response) => {
    let db = getDB();
    // Converts raw database information into an array
    let data = await db.collection(dbcollection).find({}).toArray();
    if (data.length > 0) {
        response.json(data);
    } else {
        throw new Error("Data was not found");
    }
});

// Retrieving specific facility
facilityRoutes.route("/facilities").get(async (request, response) => {
    let db = getDB();
    // Retrieve data for a specific facility by the facility's ID
    let facility = await db.collection(dbcollection).findOne({ _id: new ObjectId(request.params.id) });
    if (facility) {
        response.json(facility);
    } else {
        throw new Error("Data was not found");
    }
});

// Creating a new facility
facilityRoutes.route("/facilities").post(async (request, response) => {
    let db = getDB();
    let result = await db.collection(dbcollection).insertOne(request.body);
});

// Updating facility information
facilityRoutes.route("/facilities").put(async (request, response) => {
    let db = getDB();
    let result = await db.collection(dbcollection).updateOne(
        { _id: new ObjectId(request.params.id) },
        { $set: request.body }
    );
    if (result.matchedCount > 0) {
        response.json({ message: "Facility updated successfully" });
    } else {
        throw new Error("Data was not found");
    }
});

// Deleting a facility
facilityRoutes.route("/facilities").delete(async (request, response) => {
    let db = getDB();
    let result = await db.collection(dbcollection).deleteOne({ _id: new ObjectId(request.params.id) });
    if (result.deletedCount > 0) {
        response.json({ message: "Facility deleted successfully" });
    } else {
        throw new Error("Data was not found");
    }
});

module.exports = facilityRoutes;