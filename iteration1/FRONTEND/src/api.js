import axios from "axios";

const URL = "http://localhost:3000/facilities";

// Frontend API functions for retrieving data from backend routes

// Retrieve all facilities
export async function getFacilities() {
    try {
        const response = await axios.get(URL);
        return response.status === 200 ? response.data : null;
    } catch (error) {
        console.error("Error fetching facilities:", error);
        return null;
    }
}

// Retrieve a specific facility by ID
export async function getFacilityById(id) {
    try {
        const response = await axios.get(`${URL}/${id}`);
        return response.status === 200 ? response.data : null;
    } catch (error) {
        console.error("Error fetching facility:", error);
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
        return response.status === 201 ? response.data : null;
    } catch (error) {
        console.error("Error creating facility:", error);
        return null;
    }
}

// Update facility information
export async function updateFacility(id, facilityData) {
    try {
        const response = await axios.put(`${URL}/${id}`, facilityData);
        return response.status === 200 ? response.data : null;
    } catch (error) {
        console.error("Error updating facility:", error);
        return null;
    }
}

// Delete a facility
export const deleteFacility = async (facilityId) => {
    try {
        const response = await axios.delete(`${URL}/${facilityId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting facility:", error);
        return null;
    }
};
