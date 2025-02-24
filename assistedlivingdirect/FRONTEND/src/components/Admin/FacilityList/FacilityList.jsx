import React from 'react';

const FacilityList = ({ facilities, searchTerm, setSearchTerm, handleEdit, handleDelete, getFullImageUrl }) => {
    const filteredFacilities = facilities.filter(facility => 
      facility.Licensee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.county?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.City?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    return (
      <div className="facility-list-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search facilities by name, county, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}  // ✅ This now correctly updates the state
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
    );
};  

export default FacilityList;