// File to run for starting actual Node.js server

// Setting connect variable equal to the functions made in mongo-connect.js
const { connectToServer } = require('./mongo-connect');
// Establishing Express library
const express = require('express');
const cors = require('cors');
// Establishing ALD_database routing functionality
const ALD_database = require("./routes/facilityroutes");
const USER_database = require("./routes/userroutes");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use(ALD_database);
app.use(USER_database)

// Tells local computer to listen to port 3000 for requests
// Once connection is established, connects to port and MongoDB
async function startServer() {
    try {
        await connectToServer();
        app.use("/ALD_database", ALD_database);
        app.use("/users", USER_database); // Mount userroutes at /users

        app.listen(PORT, () => {
            console.log(`Backend server is running on port: `);
            console.log(PORT);
        });
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}
startServer();