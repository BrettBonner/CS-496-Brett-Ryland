import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Adjust path
import { Link } from "react-router-dom";
import "./Account.css";

function Account() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

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
            <div className="account-details">
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
                Log Out
            </button>
        </div>
    );
}

export default Account;