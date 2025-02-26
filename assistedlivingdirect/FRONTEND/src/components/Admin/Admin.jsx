import React, { useState, useEffect } from "react";
import { getFacilities, getFacilityById, updateFacility, deleteFacility } from "../../api";
import FacilityList from "./FacilityList/FacilityList";
import FacilityHandler from "./FacilityHandler/FacilityHandler";
import "./Admin.css";

const Admin = () => {
    // States for handling facilities
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [view, setView] = useState("list");
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Form state and validation logic
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

    // Load facilities on mounting from component
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

    // Function to get the full image URL from MongoDB
    const getFullImageUrl = (facilityData) => {
        if (!facilityData?.imageURL) return null;
        return facilityData.imageURL.startsWith("http")
        ? facilityData.imageURL
        : `http://localhost:3000${facilityData.imageURL}`;
    };

    // Handle changes to input form when creating a new facility
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
        // Gathers the target facility's information and saves it in file
        const file = e.target.files[0];

        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            
            // Used to read the base64 in the URL and converting it
            reader.readAsDataURL(file);

        } else {
            // No image has been made for the facility
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

    // Handle form submission and creation of a new facility
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        try {
            const updatedData = { ...formData };
            if (imageFile === null) {
                // Explicitly removes image by setting image URL in database to null
                updatedData.imageURL = null;
            }
    
            if (view === "add") {
                await FacilityHandler(updatedData, imageFile);
            } else if (view === "edit" && selectedFacility) {
                await updateFacility(selectedFacility._id, updatedData, imageFile);
            }
    
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

    // Handling updating an existing facility in the database
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
                
                if (facility.imageURL) {
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
    // Used when creating a new facility
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

    // Render loading state
    if (loading && view === "list") {
        return <div className="admin-loading">Loading facilities...</div>;
    }
    
    return (
        <div className="admin-facility-manager">
        <h1>Admin Facility Management</h1>
          
        {error && <div className="admin-error">{error}</div>}
          
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
          
        {view === "list" && (
            <FacilityList
                facilities={facilities}
                searchTerm={searchTerm}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                getFullImageUrl={getFullImageUrl}
                setSearchTerm={setSearchTerm}
            />
        )}
          
        {(view === "add" || view === "edit") && (
            <FacilityHandler
                formData={formData}
                formErrors={formErrors}
                handleInputChange={handleInputChange}
                handleImageChange={handleImageChange}
                imagePreview={imagePreview}
                setImageFile={setImageFile}
                setImagePreview={setImagePreview}
                handleSubmit={handleSubmit}
                resetForm={resetForm}
                setView={setView}
                loading={loading}
                view={view}
            />
            )}
        </div>
    );
};

export default Admin;