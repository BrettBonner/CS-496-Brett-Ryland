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
export async function createFacility(facilityData, imageFile) {
    // Append the image file
    const formData = new FormData();
    formData.append('image', imageFile);

    Object.keys(facilityData).forEach(key => {
        // Append other facility data
        formData.append(key, facilityData[key]);
    });

    try {
        const response = await axios.post(URL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;

    } catch (error) {
        console.error("Error creating facility:", error.message);
        return null;
    }
}

// Update facility information
export async function updateFacility(id, facilityData) {
    try {
        const response = await axios.put(`${URL}/${id}`, facilityData);
        return response.data;

    } catch (error) {
        console.error("Error updating facility:", error.message);
        return null;
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
