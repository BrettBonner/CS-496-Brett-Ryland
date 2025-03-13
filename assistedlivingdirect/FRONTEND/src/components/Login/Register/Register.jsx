import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../../api";
import { Link } from "react-router-dom";
import "./Register.css";

function Register() {
    const [formData, setFormData] = useState({
        username: "", // New field
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (formErrors[name]) {
            setFormErrors({ ...formErrors, [name]: null });
        }
    };

    // Validate form
    const validateForm = () => {
        const errors = {};
        if (!formData.username) {
            errors.username = "Username is required";
        } else if (formData.username.length < 3) {
            errors.username = "Username must be at least 3 characters";
        }
        if (!formData.email) {
            errors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = "Please enter a valid email address";
        }
        if (!formData.password) {
            errors.password = "Password is required";
        } else if (formData.password.length < 6) {
            errors.password = "Password must be at least 6 characters";
        }
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setError(null);
        try {
            await registerUser(formData.username, formData.email, formData.password); // Include username
            alert("Registration successful! Please log in.");
            navigate("/login");
        } catch (err) {
            setError("Error registering user: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            {error && <div className="register-error">{error}</div>}
            <form onSubmit={handleSubmit} className="register-form">
                <div className="form-group">
                    <label htmlFor="username">Username*</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className={formErrors.username ? "error" : ""}
                    />
                    {formErrors.username && <span className="error-message">{formErrors.username}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email*</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={formErrors.email ? "error" : ""}
                    />
                    {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password*</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={formErrors.password ? "error" : ""}
                    />
                    {formErrors.password && <span className="error-message">{formErrors.password}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password*</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={formErrors.confirmPassword ? "error" : ""}
                    />
                    {formErrors.confirmPassword && (
                        <span className="error-message">{formErrors.confirmPassword}</span>
                    )}
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn-register" disabled={loading}>
                        {loading ? "Registering..." : "Register"}
                    </button>
                    <Link to="/login" className="back-to-login">
                        Back to Login
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default Register;