import axios from "axios";

// URL which connects to database in MongoDB
const URL = "http://localhost:3000/ALD_database";

// Seperate URL for users who are logged in
const USER_URL = "http://localhost:3000/users";

const REVIEW_URL = "http://localhost:3000/reviews";

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
export async function createFacility(facilityData, imageBase64) {
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

// Registering a new user account
export async function registerUser(username, email, password) {
    try {
        const response = await axios.post(USER_URL, {
            username, // New field
            email,
            password,
        });
        return response.data;
    } catch (error) {
        console.error("Error registering user:", error.message);
        throw error;
    }
}

// Logging in a user with a registered account
export async function loginUser(identifier, password) {
    try {
        const response = await axios.post(`${USER_URL}/login`, { identifier, password });
        return response.data; // Returns { username, email }
    } catch (error) {
        console.error("Error logging in user:", error.message);
        throw error;
    }
}

// Updating user account for ability to edit
export async function updateUser(currentUsername, newUsername, newEmail) {
    try {
        console.log(`Sending PUT request to ${USER_URL}/${currentUsername}`, { newUsername, newEmail });
        const response = await axios.put(`${USER_URL}/${currentUsername}`, {
            username: newUsername,
            email: newEmail,
        });
        console.log("PUT response received:", response.status, response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating user:", error.message, error.response?.data);
        throw error.response?.data?.error || error;
    }
}

// Deleting a user's account
export async function deleteUser(username, password) {
    try {
        const response = await axios.delete(`${USER_URL}/${username}`, {
            data: { password }, // Send password in request body
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting user:", error.message);
        throw error;
    }
}

// Changing a user's password
export async function changePassword(username, currentPassword, newPassword) {
    try {
        const response = await axios.patch(`${USER_URL}/${username}/password`, {
            currentPassword,
            newPassword,
        });
        return response.data;
    } catch (error) {
        console.error("Error changing password:", error.message);
        throw error.response?.data?.error || error;
    }
}

// Save a facility
export async function saveFacility(username, facilityId) {
    try {
        const response = await axios.post(`${USER_URL}/${username}/saved-facilities`, { facilityId });
        return response.data;
    } catch (error) {
        console.error("Error saving facility:", error.message);
        throw error.response?.data?.error || error;
    }
}

// Remove a saved facility
export async function removeSavedFacility(username, facilityId) {
    try {
        const response = await axios.delete(`${USER_URL}/${username}/saved-facilities/${facilityId}`);
        return response.data;
    } catch (error) {
        console.error("Error removing facility:", error.message);
        throw error.response?.data?.error || error;
    }
}

// Get saved facilities
export async function getSavedFacilities(username) {
    try {
        const response = await axios.get(`${USER_URL}/${username}/saved-facilities`);
        return response.data;
    } catch (error) {
        console.error("Error retrieving saved facilities:", error.message);
        throw error.response?.data?.error || error;
    }
}

// Get facility by ID with update check
export async function getFacilityByIdWithUpdate(id) {
    try {
        const response = await axios.get(`${URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching facility with update:", error.message);
        throw error.response?.data?.error || error;
    }
}

export async function getReviewsByFacilityId(facilityId) {
    try {
      const response = await axios.get(`${REVIEW_URL}/${facilityId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching reviews:", error.message);
      return [];
    }
  }
  
  export async function submitReview({ facilityId, userId, username, rating, comment }) {
    try {
      const response = await axios.post(REVIEW_URL, {
        facilityId,
        userId,
        username,
        rating,
        comment,
        timestamp: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      console.error("Error submitting review:", error.message);
      throw error;
    }
  }