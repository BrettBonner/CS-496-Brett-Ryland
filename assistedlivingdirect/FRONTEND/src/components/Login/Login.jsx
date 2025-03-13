import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Add useNavigate
import { loginUser } from "../../api"; // Adjust path
import { useAuth } from "../../context/AuthContext"; // Adjust path
import "./Login.css";

function Login() {
    const [formData, setFormData] = useState({
        identifier: "",
        password: "",
    });
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userData = await loginUser(formData.identifier, formData.password);
            login(userData); // Set user in context
            navigate("/"); // Redirect to home page
        } catch (err) {
            setError(err.response?.data?.error || "Login failed");
        }
    };

    return (
        <div className="login-container">
            <div className="logo">
                <Link to="/">
                    <img src="../src/assets/navbarlogo.jpg" alt="Assisted Living Direct" />
                </Link>
            </div>
            <h2>Login</h2>
            {error && <div className="login-error">{error}</div>}
            <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                    <label htmlFor="identifier">Username or Email</label>
                    <input
                        type="text"
                        id="identifier"
                        name="identifier"
                        value={formData.identifier}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                    />
                </div>
                <button type="submit" className="btn-login">
                    Login
                </button>
            </form>
            <p>
                Don’t have an account? <Link to="/register">Register here</Link>
            </p>
        </div>
    );
}

export default Login;