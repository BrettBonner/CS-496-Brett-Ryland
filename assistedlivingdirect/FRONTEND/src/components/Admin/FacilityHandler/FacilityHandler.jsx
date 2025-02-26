import React from 'react';

const FacilityHandler = ({ 
  formData, 
  formErrors, 
  handleInputChange, 
  handleImageChange, 
  imagePreview, 
  setImageFile, 
  setImagePreview, 
  handleSubmit, 
  resetForm, 
  setView, 
  loading, 
  view 
}) => {
  // New image handling function
  const handleImagePreview = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        // Store both the base64 string and file
        setImagePreview(reader.result);
        setImageFile(reader.result); // Now storing base64 string instead of file
      }, false);
      reader.readAsDataURL(file);
    }
  };

  return (
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
            onChange={handleImagePreview}
          />
          <p className="file-hint">Recommended JPG Only</p>
          
          {imagePreview && (
            <div className="image-preview-container">
              <img
                src={imagePreview}
                alt="Facility preview"
                className="image-preview"
                style={{ maxHeight: '200px' }}
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
  );
};

export default FacilityHandler;