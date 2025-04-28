import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { updateUser, deleteUser, changePassword, getSavedFacilities, getFacilityByIdWithUpdate, removeSavedFacility } from "../../api";
import "./Account.css";

function Account() {
    const { user, logout, setUser } = useAuth();
    const navigate = useNavigate();
    const [editMode, setEditMode] = useState(false);
    const [passwordChangeMode, setPasswordChangeMode] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || "",
        email: user?.email || "",
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
    });
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [savedFacilities, setSavedFacilities] = useState([]);
    const [previousBeds, setPreviousBeds] = useState({}); // Track previous bed counts
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        let intervalId;
        const fetchSavedFacilities = async () => {
            if (user) {
                try {
                    console.log("Polling saved facilities at:", new Date().toLocaleTimeString());
                    const facilities = await getSavedFacilities(user.username);
                    console.log("Fetched saved facilities:", facilities);

                    // Check for changes by comparing against previousBeds state
                    await checkForBedChanges(facilities);

                    // Update savedFacilities after checking for changes
                    setSavedFacilities(facilities);
                } catch (err) {
                    console.error("Failed to fetch saved facilities:", err);
                }
            }
        };
        
        fetchSavedFacilities();
        intervalId = setInterval(fetchSavedFacilities, 30000);
        return () => clearInterval(intervalId);
    }, [user?.username]);

    const checkForBedChanges = async (facilities) => {
        // Store current bed counts for all facilities in this cycle
        const currentBedCounts = {};

        // First, fetch the latest data for each facility and store the current bed counts
        for (const facility of facilities) {
            try {
                const updatedFacility = await getFacilityByIdWithUpdate(facility._id);
                const currentBedsCount = Number(updatedFacility["Number of Beds"]) || 0;
                currentBedCounts[facility._id] = currentBedsCount;
            } catch (err) {
                console.error("Error fetching facility update:", err);
                currentBedCounts[facility._id] = Number(facility["Number of Beds"]) || 0; // Fallback to saved value
            }
        }

        // Now compare with previousBeds and generate notifications
        for (const facility of facilities) {
            const currentBedsCount = currentBedCounts[facility._id];
            const previousBedsCount = previousBeds[facility._id] !== undefined 
                ? previousBeds[facility._id] 
                : Number(facility["Number of Beds"]) || 0;

            console.log(`Comparing facility ${facility.Licensee}: Previous beds=${previousBedsCount}, Current beds=${currentBedsCount}`);

            // Create notification if beds have changed
            if (previousBedsCount !== currentBedsCount) {
                const newNotification = {
                    id: Date.now(), // Unique ID for each notification
                    message: `Facility ${facility.Licensee || "Unnamed"} has changed beds from ${previousBedsCount} to ${currentBedsCount}`,
                    timestamp: new Date(),
                };

                setNotifications(prev => {
                    const isDuplicate = prev.some(n => n.message === newNotification.message);
                    if (!isDuplicate) {
                        console.log("New notification added:", newNotification);
                        return [newNotification, ...prev].slice(0, 10);
                    }
                    return prev;
                });
            }
        }

        // Update previousBeds with the current values for the next cycle
        setPreviousBeds(currentBedCounts);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm({ ...passwordForm, [name]: value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            const updatedUser = await updateUser(user.username, formData.username, formData.email);
            setUser(updatedUser);
            setEditMode(false);
            setSuccess("Account updated successfully!");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to update account");
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        if (!passwordForm.currentPassword || !passwordForm.newPassword) {
            setError("Please fill in both current and new password fields");
            return;
        }
        try {
            await changePassword(user.username, passwordForm.currentPassword, passwordForm.newPassword);
            setPasswordChangeMode(false);
            setPasswordForm({ currentPassword: "", newPassword: "" });
            setSuccess("Password changed successfully!");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to change password");
        }
    };

    const handleDelete = async () => {
        if (!password) {
            setError("Please enter your password to delete your account");
            return;
        }
        setError(null);
        setSuccess(null);
        try {
            await deleteUser(user.username, password);
            logout();
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to delete account");
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const dismissNotification = (notificationId) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
    };

    if (!user) {
        return <div>Please log in to view your account.</div>;
    }

    return (
        <div className="account-container">
            <h2 className="account-page-title">Your Account</h2>
            {error && <div className="account-error">{error}</div>}
            {success && <div className="account-success">{success}</div>}
            
            <div className="account-layout">
                {/* Left Column - Account Information */}
                <div className="account-left-column">
                    <div className="account-section">
                        <h3>Account Information</h3>
                        {!editMode ? (
                            <>
                                <div className="account-details">
                                    <p><strong>Username:</strong> {user.username}</p>
                                    <p><strong>Email:</strong> {user.email}</p>
                                </div>
                                <div className="account-buttons">
                                    <button className="edit-btn" onClick={() => setEditMode(true)}>
                                        Edit Account
                                    </button>
                                    <button className="change-password-btn" onClick={() => setPasswordChangeMode(true)}>
                                        Change Password
                                    </button>
                                    <button className="logout-btn" onClick={handleLogout}>
                                        Log Out
                                    </button>
                                </div>
                            </>
                        ) : (
                            <form onSubmit={handleUpdate} className="account-form">
                                <div className="form-group">
                                    <label htmlFor="username">Username</label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="save-btn">
                                        Save Changes
                                    </button>
                                    <button type="button" className="cancel-btn" onClick={() => setEditMode(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {passwordChangeMode && (
                        <div className="account-section">
                            <h3>Change Password</h3>
                            <form onSubmit={handleChangePassword} className="password-form">
                                <div className="form-group">
                                    <label htmlFor="currentPassword">Current Password</label>
                                    <input
                                        type="password"
                                        id="currentPassword"
                                        name="currentPassword"
                                        value={passwordForm.currentPassword}
                                        onChange={handlePasswordInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="newPassword">New Password</label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        name="newPassword"
                                        value={passwordForm.newPassword}
                                        onChange={handlePasswordInputChange}
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="save-btn">
                                        Update Password
                                    </button>
                                    <button type="button" className="cancel-btn" onClick={() => setPasswordChangeMode(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="account-section">
                        <h3>Delete Account</h3>
                        <div className="delete-section">
                            <p>Enter your password to permanently delete your account:</p>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="password-input"
                            />
                            <button className="delete-btn" onClick={handleDelete}>
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column - Notifications and Saved Facilities */}
                <div className="account-right-column">
                    <div className="account-section">
                        <h3>Notifications</h3>
                        <div className="notification-container">
                            {notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <div key={notif.id} className="notification">
                                        <span className="notification-message">
                                            {notif.message} ({notif.timestamp.toLocaleTimeString()})
                                        </span>
                                        <button 
                                            className="dismiss-notification" 
                                            onClick={() => dismissNotification(notif.id)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="notification">
                                    No new notifications
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="account-section">
                        <h3>Saved Facilities</h3>
                        {savedFacilities.length === 0 ? (
                            <p>No saved facilities yet.</p>
                        ) : (
                            <ul className="saved-facilities-list">
                                {savedFacilities.map((facility) => (
                                    <li key={facility._id}>
                                        {facility.Licensee || "No Name"} - {facility["Street Address"] || "No Address"}
                                        <button
                                            className="remove-btn"
                                            onClick={() => {
                                                removeSavedFacility(user.username, facility._id).then(() => {
                                                    setSavedFacilities(savedFacilities.filter(f => f._id !== facility._id));
                                                });
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Account;