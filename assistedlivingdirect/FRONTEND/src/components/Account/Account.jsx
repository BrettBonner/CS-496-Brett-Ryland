import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Adjust path
import { Link } from "react-router-dom";
import { updateUser, deleteUser, changePassword } from "../../api"; // Add changePassword
import "./Account.css";

function Account() {
    const { user, logout, setUser } = useAuth();
    const navigate = useNavigate();
    const [editMode, setEditMode] = useState(false);
    const [passwordChangeMode, setPasswordChangeMode] = useState(false); // New state for password change mode
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

    if (!user) {
        return <div>Please log in to view your account.</div>;
    }

    return (
        <div className="account-container">
            <div className="logo">
                <Link to="/">
                    <img src="../src/assets/navbarlogo.jpg" alt="Assisted Living Direct" />
                </Link>
            </div>
            <h2>Your Account</h2>
            {error && <div className="account-error">{error}</div>}
            {success && <div className="account-success">{success}</div>}
            {!editMode ? (
                <div className="account-details">
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
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
            {passwordChangeMode && (
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
            )}
            <div className="delete-section">
                <h3>Delete Account</h3>
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
    );
}

export default Account;