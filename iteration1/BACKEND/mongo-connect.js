require('dotenv').config({ path: './config.env' });
const { MongoClient, ServerApiVersion } = require('mongodb');

// Create a MongoClient with your Atlas connection string
const client = new MongoClient(process.env.ATLAS_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Stored connected database
let database;

// Exports
module.exports = {
  // Connecting to MongoDB database
  connectToServer: () => {
    database = client.db("MedicaidCompass")
  },
  // Retrieving data from MongoDB
  getDB: () => {
    return database
  }
}

console.log("Hello from mongo-connect");