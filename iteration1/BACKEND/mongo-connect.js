const { config } = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config({path: './config.env'});

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.ATLAS_URI, { // Need to add your own config.env file that has URI from Atlas
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let database

module.exports = {
  // Connecting to MongoDB database
  connectToServer: () => {
    database = client.db("INSERT DATABASE NAME HERE")
  },

  // Retrieving data from MongoDB
  getDB: () => {
    return database
  }
}

console.log("Hello from mongo-connect");