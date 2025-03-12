const express = require("express");
const userroutes = express.Router();
const { ObjectId } = require("mongodb");
const { getDB } = require("../mongo-connect"); // Updated to getDB
const bcrypt = require("bcrypt");

const dbCollection = "Users";
const saltRounds = 10;

// Register a new user
userroutes.post("/", async (request, response) => {
    try {
        const db = getDB();
        const { username, email, password } = request.body;

        const existingUser = await db.collection(dbCollection).findOne({
            $or: [{ username }, { email }],
        });
        if (existingUser) {
            if (existingUser.username === username) {
                return response.status(400).json({ error: "Username already in use" });
            }
            if (existingUser.email === email) {
                return response.status(400).json({ error: "Email already in use" });
            }
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const userData = {
            username,
            email,
            password: hashedPassword,
            createdAt: new Date(),
        };
        const insertedUser = await db.collection(dbCollection).insertOne(userData);
        response.status(201).json({ message: "User registered successfully", insertedId: insertedUser.insertedId });
    } catch (error) {
        console.error("Error registering user: ", error.message);
        response.status(500).json({ error: "Failed to register user" });
    }
});

// Login a user
userroutes.post("/login", async (request, response) => {
    try {
        const db = getDB();
        const { identifier, password } = request.body;

        const user = await db.collection(dbCollection).findOne({
            $or: [{ username: identifier }, { email: identifier }],
        });
        if (!user) {
            return response.status(401).json({ error: "Invalid username/email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return response.status(401).json({ error: "Invalid username/email or password" });
        }

        response.json({
            username: user.username,
            email: user.email,
        });
    } catch (error) {
        console.error("Error logging in user: ", error.message);
        response.status(500).json({ error: "Failed to log in" });
    }
});

module.exports = userroutes;