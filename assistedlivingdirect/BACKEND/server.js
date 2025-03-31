const { connectToServer } = require('./mongo-connect');
const express = require('express');
const cors = require('cors');
const ALD_database = require("./routes/facilityroutes");
const USER_database = require("./routes/userroutes");
const REVIEW_database = require("./routes/reviewroutes");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

async function startServer() {
    try {
        await connectToServer();

       
        app.use("/ALD_database", ALD_database);
        app.use("/users", USER_database);
        app.use("/reviews", REVIEW_database);

        app.listen(PORT, () => {
            console.log(`Backend server is running on port: ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}

startServer();
