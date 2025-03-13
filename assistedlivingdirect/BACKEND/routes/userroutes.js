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

// Update user details
userroutes.put("/:username", async (request, response) => {
    try {
        const db = getDB();
        const { username } = request.params;
        const { username: newUsername, email: newEmail } = request.body;

        // Validate input
        if (!newUsername || !newEmail) {
            return response.status(400).json({ error: "Username and email are required" });
        }

        const user = await db.collection(dbCollection).findOne({ username });
        if (!user) {
            return response.status(404).json({ error: "User not found" });
        }

        // Check for conflicts with new username/email (excluding the current user)
        const conflict = await db.collection(dbCollection).findOne({
            $or: [{ username: newUsername }, { email: newEmail }],
            username: { $ne: username },
        });
        if (conflict) {
            if (conflict.username === newUsername) {
                return response.status(400).json({ error: "Username already in use" });
            }
            if (conflict.email === newEmail) {
                return response.status(400).json({ error: "Email already in use" });
            }
        }

        // Perform the update
        const updateResult = await db.collection(dbCollection).updateOne(
            { username },
            { $set: { username: newUsername, email: newEmail } }
        );

        if (updateResult.matchedCount === 0) {
            return response.status(404).json({ error: "User not found" });
        }

        if (updateResult.modifiedCount === 0) {
            return response.status(400).json({ error: "No changes made" });
        }

        // Get the updated user
        const updatedUser = await db.collection(dbCollection).findOne({ username: newUsername });
    
    } catch (error) {
        console.error("Error updating user: ", error.stack);
        response.status(500).json({ error: "Failed to update user", details: error.message });
    }
});

// Delete user account
userroutes.delete("/:username", async (request, response) => {
    try {
        const db = getDB();
        const { username } = request.params;
        const { password } = request.body;

        const user = await db.collection(dbCollection).findOne({ username });
        if (!user) {
            return response.status(404).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return response.status(401).json({ error: "Incorrect password" });
        }

        await db.collection(dbCollection).deleteOne({ username });
        response.json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error("Error deleting user: ", error.message);
        response.status(500).json({ error: "Failed to delete user" });
    }
});

// Change user password
userroutes.patch("/:username/password", async (request, response) => {
    try {
        const db = getDB();
        const { username } = request.params;
        const { currentPassword, newPassword } = request.body;

        // Validate input
        if (!currentPassword || !newPassword) {
            return response.status(400).json({ error: "Current and new password are required" });
        }

        // Check if user exists
        const user = await db.collection(dbCollection).findOne({ username });
        if (!user) {
            return response.status(404).json({ error: "User not found" });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return response.status(401).json({ error: "Incorrect current password" });
        }

        // Validate new password (e.g., minimum length)
        if (newPassword.length < 6) {
            return response.status(400).json({ error: "New password must be at least 6 characters" });
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update the password
        const updateResult = await db.collection(dbCollection).updateOne(
            { username },
            { $set: { password: hashedNewPassword } }
        );

        if (updateResult.matchedCount === 0) {
            return response.status(404).json({ error: "User not found" });
        }

        if (updateResult.modifiedCount === 0) {
            return response.status(400).json({ error: "No changes made to password" });
        }

        response.json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Error changing password: ", error.stack);
        response.status(500).json({ error: "Failed to change password", details: error.message });
    }
});

module.exports = userroutes;