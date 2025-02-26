import axios from "axios";

// URL which connects to database in MongoDB
const URL = "http://localhost:3000/ALD_database";

// Frontend API functions for retrieving data from backend routes via URL

// Retrieve all facilities
export async function getFacilities() {
    try {
        const response = await axios.get(URL);
        return response.data;

    } catch (error) {
        console.error("Error fetching facilities:", error.message);
        return null;
    }
}

// Retrieve a specific facility by ID
export async function getFacilityById(id) {
    try {
        const response = await axios.get(`${URL}/${id}`);
        return response.data;

    } catch (error) {
        console.error("Error fetching facility:", error.message);
        return null;
    }
}

// Create a new facility
export async function FacilityHandler(facilityData, imageBase64) {
    try {
        const response = await axios.post(URL, {
            ...facilityData,
            imageURL: imageBase64 // Send base64 string directly
        });
        return response.data;

    } catch (error) {
        console.error("Error creating facility:", error.message);
        throw error;
    }
}

// Update facility with base64 image
export async function updateFacility(id, facilityData, imageBase64) {
    try {
        const updateData = {
            ...facilityData
        };
        if (imageBase64) {
            updateData.imageURL = imageBase64;
        }

        const response = await axios.put(`${URL}/${id}`, updateData);
        return response.data;

    } catch (error) {
        console.error("Error updating facility:", error.message);
        throw error;
    }
}

// Delete a facility
export const deleteFacility = async (id) => {
    try {
        const response = await axios.delete(`${URL}/${id}`);
        return response.data;

    } catch (error) {
        console.error("Error deleting facility:", error.message);
        return null;
    }
};