require("dotenv").config({ path: "./config.env" });
const { MongoClient, ServerApiVersion } = require("mongodb");

// Create a MongoClient with the Atlas connection string
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
	connectToServer: async () => {
		try {
			await client.connect()
			database = client.db("MedicaidCompass")
			return database
		} catch (error) {
			console.error("Could not connect to MongoDB: ", error)
			throw error
		}
	},
	// Retrieving data from MongoDB
	getDB: () => {
		if (!database) {
			throw new Error("No database connection established")
		}
		return database
	}
}

console.log("Hello from mongo-connect");