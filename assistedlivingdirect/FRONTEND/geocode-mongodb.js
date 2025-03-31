import { MongoClient } from "mongodb";
import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// MongoDB connection details (use your Atlas connection string)
const uri = process.env.MONGODB_URI || "mongodb+srv://Brett:123@cluster0.qddvk.mongodb.net/MedicaidCompass?retryWrites=true&w=majority&appName=Cluster0"; // Updated to include database
const dbName = "MedicaidCompass"; // Confirmed database name
const collectionName = "Facility Info V2"; // Confirmed collection name

// Log the URI being used (for debugging)
console.log("Using URI:", uri);
console.log("Using Database:", dbName);
console.log("Using Collection:", collectionName);

// Google Maps API key (from environment variable with fallback)
const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyCV1IgcI-mJodfec9zFHO71qEpqWL2pEzk";

// Delay between API calls to respect rate limits (e.g., 200ms for ~5 requests/second)
const delayMs = 200;

// Maximum number of geocoding requests per run (within free tier limit of 1,000/day)
const maxRequestsPerRun = 1000;

async function connectToMongo() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    // List available databases to debug
    const adminDb = client.db("admin");
    const dbList = await adminDb.admin().listDatabases();
    console.log("Available databases:", dbList.databases.map(db => db.name));
    
    const db = client.db(dbName);
    // List collections in the database
    const collections = await db.listCollections().toArray();
    console.log("Collections in database:", collections.map(col => col.name));
    
    const collection = db.collection(collectionName);
    // Log sample documents to debug
    const sample = await collection.find().limit(5).toArray();
    console.log("Sample documents:", sample);
    // Log total documents and those missing coordinates
    const totalDocs = await collection.countDocuments();
    const missingCoords = await collection.countDocuments({
      $or: [{ lat: { $exists: false } }, { lng: { $exists: false } }],
    });
    console.log(`Total documents in collection: ${totalDocs}`);
    console.log(`Documents missing coordinates: ${missingCoords}`);
    return { client, collection };
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

async function geocodeAddress(address) {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${apiKey}`
    );
    if (response.data.results.length > 0) {
      const { lat, lng } = response.data.results[0].geometry.location;
      return { lat, lng };
    } else {
      console.warn(`No geocoding results for address: ${address}`);
      return null;
    }
  } catch (error) {
    console.error(`Geocoding error for address "${address}":`, error.message);
    if (error.response && error.response.data) {
      console.error("Google Maps API response:", error.response.data);
    }
    return null;
  }
}

async function updateCoordinates(collection) {
  let updatedCount = 0;
  let skippedCount = 0;
  let processedCount = 0;

  // Find documents missing coordinates with a limit
  const cursor = collection
    .find({
      $or: [{ lat: { $exists: false } }, { lng: { $exists: false } }],
    })
    .limit(maxRequestsPerRun);

  for await (const facility of cursor) {
    if (processedCount >= maxRequestsPerRun) {
      console.log(`Reached maximum requests (${maxRequestsPerRun}) for this run. Stopping.`);
      break;
    }

    console.log(`Processing: ${facility.Licensee} (Request ${processedCount + 1}/${maxRequestsPerRun})`);

    // Skip if already has coordinates
    if (facility.lat && facility.lng) {
      console.log(`Skipping ${facility.Licensee}: already has coordinates`);
      skippedCount++;
      processedCount++;
      continue;
    }

    // Construct address from available fields
    const address = `${facility["Street Address"] || ""}, ${
      facility.City || ""
    }, ${facility.county || ""}, ${facility["Zip Code"] || ""}`.trim();
    if (!address || address === ", , , ") {
      console.warn(`Skipping ${facility.Licensee}: invalid or empty address`);
      skippedCount++;
      processedCount++;
      continue;
    }

    // Geocode the address
    const coords = await geocodeAddress(address);
    if (coords) {
      await collection.updateOne(
        { _id: facility._id },
        { $set: { lat: coords.lat, lng: coords.lng } }
      );
      updatedCount++;
      console.log(`Updated ${facility.Licensee} with lat: ${coords.lat}, lng: ${coords.lng}`);
    } else {
      skippedCount++;
    }

    processedCount++;
    // Add delay to respect API rate limits
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  console.log(`Total facilities updated: ${updatedCount}`);
  console.log(`Total facilities skipped: ${skippedCount}`);
  console.log(`Total processed this run: ${processedCount}`);
}

async function main() {
  const { client, collection } = await connectToMongo();
  try {
    await updateCoordinates(collection);
  } catch (error) {
    console.error("Error during update:", error);
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB");
  }
}

main().catch(console.error);