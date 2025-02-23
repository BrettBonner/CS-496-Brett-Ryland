import React, { useState, useEffect } from "react";
import { getFacilities, getFacilityById, createFacility, updateFacility, deleteFacility } from "../../api";
import "./Admin.css";

const Admin = () => {
    // States for facility management
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [view, setView] = useState("list"); // "list", "add", "edit", "view"
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Format for creating a new faciltiy
    const [formData, setFormData] = useState({
        county: "",
        Licensee: "",
        "Street Address": "",
        City: "",
        "Zip Code": "",
        "Name of Contact Person": "",
        "Business Phone Number": "",
        "Business Email": "",
        "Number of Beds": "",
        "Level of Care": "Level 1",
        "SALS certified": "no"
    });
    const [formErrors, setFormErrors] = useState({});

    // Load facilities on component mount
    useEffect(() => {
        loadFacilities();
    }, []);

    // Function to load all facilities
    const loadFacilities = async () => {
        setLoading(true);
        try {
            const data = await getFacilities();
            setFacilities(data);

        } catch (error) {
            setError("Error loading facilities: " + error.message);

        } finally {
            setLoading(false);
        }
    };

    // Function to get the full image URL
    const getFullImageUrl = (facilityData) => {
        if (!facilityData?.imageUrl) return null;
        return facilityData.imageUrl.startsWith("http")
        ? facilityData.imageUrl
        : `http://localhost:3000${facilityData.imageUrl}`;
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const {name, value, type} = e.target;
        let processedValue = value;
        
        // Handle number inputs
        if (type === "number") {
            processedValue = value === "" ? "" : parseInt(value, 10);
        }
        
        setFormData({
            ...formData,
            [name]: processedValue
        });
        
        // Clear the error for this field if it exists
        if (formErrors[name]) {
        setFormErrors({
            ...formErrors,
            [name]: null
        });
        }
    };

    // Handle image file change
    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);

        } else {
            setImageFile(null);
            setImagePreview(null);
        }
    };

    // Validating all inputs for creating a new facility
    const validateForm = () => {
        const errors = {};
        
        // Checking that each field input is filled out
        ["county", "Licensee", "Street Address", "City", "Zip Code", 
        "Name of Contact Person", "Business Phone Number", "Number of Beds"].forEach(field => {
        if (!formData[field]) {
            errors[field] = `${field} is required`;
        }
        });
        
        // Email validation
        if (formData["Business Email"] && !/\S+@\S+\.\S+/.test(formData["Business Email"])) {
            errors["Business Email"] = "Please enter a valid email address";
        }
        
        // Phone number validation
        if (formData["Business Phone Number"] && !/^\(\d{3}\) \d{3}-\d{4}$/.test(formData["Business Phone Number"])) {
            errors["Business Phone Number"] = "Phone should be in format (XXX) XXX-XXXX";
        }
        
        // Zip code validation
        if (formData["Zip Code"] && (formData["Zip Code"] < 10000 || formData["Zip Code"] > 99999)) {
            errors["Zip Code"] = "Please enter a valid 5-digit zip code";
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle facility creation
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        try {
            if (view === "add") {
                await createFacility(formData, imageFile); // Pass the image file
            } else if (view === "edit" && selectedFacility) {
                await updateFacility(selectedFacility._id, formData, imageFile);
            }
            
            // Reset form and return to admin list-view
            resetForm();
            loadFacilities();
            setView("list");

        } catch (error) {
            setError("Error saving facility: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle deleting a facility
    const handleDelete = async (facilityId) => {
        if (!window.confirm("Are you sure you want to delete this facility? This action cannot be undone.")) {
            return;
        }
        
        setLoading(true);
        try {
            await deleteFacility(facilityId);
            loadFacilities();

        } catch (error) {
            setError("Error deleting facility: " + error.message);

        } finally {
            setLoading(false);
        }
    };

    // Handling editing an existing facility in the database
    const handleEdit = async (facilityId) => {
        setLoading(true);
        try {
            const facility = await getFacilityById(facilityId);
            if (facility) {
                setSelectedFacility(facility);
                setFormData({
                    county: facility.county || "",
                    Licensee: facility.Licensee || "",
                    "Street Address": facility["Street Address"] || "",
                    City: facility.City || "",
                    "Zip Code": facility["Zip Code"] || "",
                    "Name of Contact Person": facility["Name of Contact Person"] || "",
                    "Business Phone Number": facility["Business Phone Number"] || "",
                    "Business Email": facility["Business Email"] || "",
                    "Number of Beds": facility["Number of Beds"] || "",
                    "Level of Care": facility["Level of Care"] || "Level 1",
                    "SALS certified": facility["SALS certified"] || "no"
                });
                
                if (facility.imageUrl) {
                    setImagePreview(getFullImageUrl(facility));
                }
                
                setView("edit");
            } else {
                setError("Facility not found");
            }

        } catch (error) {
            setError("Error loading facility: " + error.message);

        } finally {
            setLoading(false);
        }
    };

    // Reset form to default state
    const resetForm = () => {
        setFormData({
            county: "",
            Licensee: "",
            "Street Address": "",
            City: "",
            "Zip Code": "",
            "Name of Contact Person": "",
            "Business Phone Number": "",
            "Business Email": "",
            "Number of Beds": "",
            "Level of Care": "Level 1",
            "SALS certified": "no"
        });
        
        setImageFile(null);
        setImagePreview(null);
        setFormErrors({});
        setSelectedFacility(null);
    };

    // Filter facilities based on search term
    const filteredFacilities = facilities.filter(facility => 
        facility.Licensee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.county?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.City?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Render loading state
    if (loading && view === "list") {
        return <div className="admin-loading">Loading facilities...</div>;
    }

    return (
        <div className="admin-facility-manager">
        <h1>Admin Facility Management</h1>
        
        {/* Error message display */}
        {error && <div className="admin-error">{error}</div>}
        
        {/* View controls */}
        <div className="admin-controls">
            {view === "list" ? (
            <button 
                onClick={() => {
                resetForm();
                setView("add");
                }}
                className="btn-add"
            >
                Add New Facility
            </button>
            ) : (
            <button 
                onClick={() => {
                resetForm();
                setView("list");
                }}
                className="btn-back"
            >
                Back to List
            </button>
            )}
        </div>
        
        {/* Facility List View */}
        {view === "list" && (
            <div className="facility-list-container">
            <div className="search-container">
                <input
                type="text"
                placeholder="Search facilities by name, county, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                />
            </div>
            
            <table className="facility-table">
                <thead>
                <tr>
                    <th>Image</th>
                    <th>Facility Name</th>
                    <th>County</th>
                    <th>City</th>
                    <th>Beds</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {filteredFacilities.length === 0 ? (
                    <tr>
                    <td colSpan="6" className="no-facilities">
                        No facilities found. {searchTerm && "Try adjusting your search terms."}
                    </td>
                    </tr>
                ) : (
                    filteredFacilities.map(facility => (
                    <tr key={facility._id}>
                        <td className="facility-image-cell">
                        {facility.imageUrl ? (
                            <img
                            src={getFullImageUrl(facility)}
                            alt={facility.Licensee}
                            className="facility-thumbnail"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/placeholder-image.png";
                            }}
                            />
                        ) : (
                            <div className="no-image-placeholder">No Image</div>
                        )}
                        </td>
                        <td>{facility.Licensee}</td>
                        <td>{facility.county}</td>
                        <td>{facility.City}</td>
                        <td>{facility["Number of Beds"]}</td>
                        <td className="actions-cell">
                        <button
                            onClick={() => handleEdit(facility._id)}
                            className="btn-edit"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDelete(facility._id)}
                            className="btn-delete"
                        >
                            Delete
                        </button>
                        </td>
                    </tr>
                    ))
                )}
                </tbody>
            </table>
            </div>
        )}
        
        {/* Add/Edit Facility Form */}
        {(view === "add" || view === "edit") && (
            <div className="facility-form-container">
            <h2>{view === "add" ? "Add New Facility" : "Edit Facility"}</h2>
            
            <form onSubmit={handleSubmit} className="facility-form">
                <div className="form-row">
                <div className="form-group">
                    <label htmlFor="Licensee">Facility Name*</label>
                    <input
                    type="text"
                    id="Licensee"
                    name="Licensee"
                    value={formData.Licensee}
                    onChange={handleInputChange}
                    className={formErrors.Licensee ? "error" : ""}
                    />
                    {formErrors.Licensee && <span className="error-message">{formErrors.Licensee}</span>}
                </div>
                
                <div className="form-group">
                    <label htmlFor="county">County*</label>
                    <input
                    type="text"
                    id="county"
                    name="county"
                    value={formData.county}
                    onChange={handleInputChange}
                    className={formErrors.county ? "error" : ""}
                    />
                    {formErrors.county && <span className="error-message">{formErrors.county}</span>}
                </div>
                </div>
                
                <div className="form-row">
                <div className="form-group">
                    <label htmlFor="Street Address">Street Address*</label>
                    <input
                    type="text"
                    id="Street Address"
                    name="Street Address"
                    value={formData["Street Address"]}
                    onChange={handleInputChange}
                    className={formErrors["Street Address"] ? "error" : ""}
                    />
                    {formErrors["Street Address"] && <span className="error-message">{formErrors["Street Address"]}</span>}
                </div>
                
                <div className="form-group">
                    <label htmlFor="City">City*</label>
                    <input
                    type="text"
                    id="City"
                    name="City"
                    value={formData.City}
                    onChange={handleInputChange}
                    className={formErrors.City ? "error" : ""}
                    />
                    {formErrors.City && <span className="error-message">{formErrors.City}</span>}
                </div>
                
                <div className="form-group">
                    <label htmlFor="Zip Code">Zip Code*</label>
                    <input
                    type="number"
                    id="Zip Code"
                    name="Zip Code"
                    value={formData["Zip Code"]}
                    onChange={handleInputChange}
                    className={formErrors["Zip Code"] ? "error" : ""}
                    />
                    {formErrors["Zip Code"] && <span className="error-message">{formErrors["Zip Code"]}</span>}
                </div>
                </div>
                
                <div className="form-row">
                <div className="form-group">
                    <label htmlFor="Name of Contact Person">Contact Person*</label>
                    <input
                    type="text"
                    id="Name of Contact Person"
                    name="Name of Contact Person"
                    value={formData["Name of Contact Person"]}
                    onChange={handleInputChange}
                    className={formErrors["Name of Contact Person"] ? "error" : ""}
                    />
                    {formErrors["Name of Contact Person"] && <span className="error-message">{formErrors["Name of Contact Person"]}</span>}
                </div>
                
                <div className="form-group">
                    <label htmlFor="Business Phone Number">Phone Number*</label>
                    <input
                    type="text"
                    id="Business Phone Number"
                    name="Business Phone Number"
                    placeholder="(XXX) XXX-XXXX"
                    value={formData["Business Phone Number"]}
                    onChange={handleInputChange}
                    className={formErrors["Business Phone Number"] ? "error" : ""}
                    />
                    {formErrors["Business Phone Number"] && <span className="error-message">{formErrors["Business Phone Number"]}</span>}
                </div>
                
                <div className="form-group">
                    <label htmlFor="Business Email">Email Address</label>
                    <input
                    type="email"
                    id="Business Email"
                    name="Business Email"
                    value={formData["Business Email"]}
                    onChange={handleInputChange}
                    className={formErrors["Business Email"] ? "error" : ""}
                    />
                    {formErrors["Business Email"] && <span className="error-message">{formErrors["Business Email"]}</span>}
                </div>
                </div>
                
                <div className="form-row">
                <div className="form-group">
                    <label htmlFor="Number of Beds">Number of Beds*</label>
                    <input
                    type="number"
                    id="Number of Beds"
                    name="Number of Beds"
                    value={formData["Number of Beds"]}
                    onChange={handleInputChange}
                    className={formErrors["Number of Beds"] ? "error" : ""}
                    />
                    {formErrors["Number of Beds"] && <span className="error-message">{formErrors["Number of Beds"]}</span>}
                </div>
                
                <div className="form-group">
                    <label htmlFor="Level of Care">Level of Care*</label>
                    <select
                    id="Level of Care"
                    name="Level of Care"
                    value={formData["Level of Care"]}
                    onChange={handleInputChange}
                    >
                    <option value="Level 1">Level 1</option>
                    <option value="Level 2">Level 2</option>
                    <option value="Level 3">Level 3</option>
                    </select>
                </div>
                
                <div className="form-group">
                    <label htmlFor="SALS certified">SALS Certified</label>
                    <select
                    id="SALS certified"
                    name="SALS certified"
                    value={formData["SALS certified"]}
                    onChange={handleInputChange}
                    >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                    </select>
                </div>
                </div>
                
                <div className="form-row image-upload-section">
                <div className="form-group">
                    <label htmlFor="facility-image">Facility Image</label>
                    <input
                    type="file"
                    id="facility-image"
                    accept="image/*"
                    onChange={handleImageChange}
                    />
                    <p className="file-hint">Recommended size: 800x600px, Max: 5MB, JPG or PNG</p>
                    
                    {imagePreview && (
                    <div className="image-preview-container">
                        <img
                        src={imagePreview}
                        alt="Facility preview"
                        className="image-preview"
                        />
                        <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                        }}
                        >
                        Remove Image
                        </button>
                    </div>
                    )}
                </div>
                </div>
                
                <div className="form-actions">
                <button
                    type="button"
                    onClick={() => {
                    resetForm();
                    setView("list");
                    }}
                    className="btn-cancel"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn-save"
                    disabled={loading}
                >
                    {loading ? "Saving..." : view === "add" ? "Create Facility" : "Update Facility"}
                </button>
                </div>
            </form>
            </div>
        )}
        </div>
    );
};

export default Admin;