require('dotenv').config({ path: './.env' });
const { MongoClient, ServerApiVersion } = require('mongodb');

// Create a MongoClient with your Atlas connection string
const client = new MongoClient(process.env.ATLAS_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// We'll store the connected database here
let database;

// Connect function — use async/await to ensure full connection
async function connectToServer() {
  try {
    // 1) Actually establish the connection
    await client.connect(); 
    console.log('Successfully connected to MongoDB!');

    // 2) Pick your actual database name
    //    Replace "myDatabaseName" with the real name of your database
    database = client.db("MedicaidCompass"); 
    
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Decide how you want to handle errors: 
    // - throw err 
    // - or process.exit(1) 
    // For now, let's just throw:
    throw err;
  }
}

// Getter function to retrieve the db object 
function getDB() {
  if (!database) {
    throw new Error('Database not connected! Did you call connectToServer()?');
  }
  return database;
}

// Exports
module.exports = {
  connectToServer,
  getDB
};

console.log("Hello from mongo-connect");
