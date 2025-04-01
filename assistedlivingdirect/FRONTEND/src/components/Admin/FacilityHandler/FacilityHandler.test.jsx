import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import FacilityHandler from './FacilityHandler';

describe('FacilityHandler Component', () => {
  // Mock props
  const mockProps = {
    formData: {
      Licensee: '',
      county: '',
      'Street Address': '',
      City: '',
      'Zip Code': '',
      'Name of Contact Person': '',
      'Business Phone Number': '',
      'Business Email': '',
      'Number of Beds': '',
      'Level of Care': 'Level 1',
      'SALS certified': 'no'
    },
    formErrors: {},
    handleInputChange: jest.fn(),
    imagePreview: null,
    setImageFile: jest.fn(),
    setImagePreview: jest.fn(),
    handleSubmit: jest.fn(e => e.preventDefault()),
    resetForm: jest.fn(),
    setView: jest.fn(),
    loading: false,
    view: 'add'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form with all fields for adding new facility', () => {
    render(<FacilityHandler {...mockProps} />);
    
    // Check heading
    expect(screen.getByText('Add New Facility')).toBeInTheDocument();
    
    // Check all form fields are present
    expect(screen.getByLabelText('Facility Name*')).toBeInTheDocument();
    expect(screen.getByLabelText('County*')).toBeInTheDocument();
    expect(screen.getByLabelText('Street Address*')).toBeInTheDocument();
    expect(screen.getByLabelText('City*')).toBeInTheDocument();
    expect(screen.getByLabelText('Zip Code*')).toBeInTheDocument();
    expect(screen.getByLabelText('Contact Person*')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone Number*')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Number of Beds*')).toBeInTheDocument();
    expect(screen.getByLabelText('Level of Care*')).toBeInTheDocument();
    expect(screen.getByLabelText('SALS Certified')).toBeInTheDocument();
    expect(screen.getByLabelText('Facility Image')).toBeInTheDocument();
    
    // Check buttons
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Create Facility')).toBeInTheDocument();
  });

  test('renders form with Edit heading when view is edit', () => {
    render(<FacilityHandler {...mockProps} view="edit" />);
    expect(screen.getByText('Edit Facility')).toBeInTheDocument();
    expect(screen.getByText('Update Facility')).toBeInTheDocument();
  });

  test('displays form data correctly when provided', () => {
    const filledFormData = {
      Licensee: 'Test Facility',
      county: 'Test County',
      'Street Address': '123 Test St',
      City: 'Test City',
      'Zip Code': '12345',
      'Name of Contact Person': 'Test Person',
      'Business Phone Number': '(123) 456-7890',
      'Business Email': 'test@example.com',
      'Number of Beds': '10',
      'Level of Care': 'Level 2',
      'SALS certified': 'yes'
    };
    
    render(<FacilityHandler {...mockProps} formData={filledFormData} />);
    
    expect(screen.getByLabelText('Facility Name*')).toHaveValue('Test Facility');
    expect(screen.getByLabelText('County*')).toHaveValue('Test County');
    expect(screen.getByLabelText('Street Address*')).toHaveValue('123 Test St');
    expect(screen.getByLabelText('City*')).toHaveValue('Test City');
    expect(screen.getByLabelText('Zip Code*')).toHaveValue(12345);
    expect(screen.getByLabelText('Contact Person*')).toHaveValue('Test Person');
    expect(screen.getByLabelText('Phone Number*')).toHaveValue('(123) 456-7890');
    expect(screen.getByLabelText('Email Address')).toHaveValue('test@example.com');
    expect(screen.getByLabelText('Number of Beds*')).toHaveValue(10);
    expect(screen.getByLabelText('Level of Care*')).toHaveValue('Level 2');
    expect(screen.getByLabelText('SALS Certified')).toHaveValue('yes');
  });

  test('displays validation errors when present', () => {
    const formErrors = {
      Licensee: 'Licensee is required',
      county: 'County is required',
      'Street Address': 'Street Address is required',
      City: 'City is required',
      'Zip Code': 'Zip Code is required',
      'Name of Contact Person': 'Contact Person is required',
      'Business Phone Number': 'Phone Number is required',
      'Business Email': 'Invalid email format',
      'Number of Beds': 'Number of Beds is required'
    };
    
    render(<FacilityHandler {...mockProps} formErrors={formErrors} />);
    
    expect(screen.getByText('Licensee is required')).toBeInTheDocument();
    expect(screen.getByText('County is required')).toBeInTheDocument();
    expect(screen.getByText('Street Address is required')).toBeInTheDocument();
    expect(screen.getByText('City is required')).toBeInTheDocument();
    expect(screen.getByText('Zip Code is required')).toBeInTheDocument();
    expect(screen.getByText('Contact Person is required')).toBeInTheDocument();
    expect(screen.getByText('Phone Number is required')).toBeInTheDocument();
    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    expect(screen.getByText('Number of Beds is required')).toBeInTheDocument();
  });

  test('applies error class to input fields with errors', () => {
    const formErrors = {
      Licensee: 'Licensee is required'
    };
    
    render(<FacilityHandler {...mockProps} formErrors={formErrors} />);
    
    const input = screen.getByLabelText('Facility Name*');
    expect(input).toHaveClass('error');
  });

  test('calls handleInputChange when input values change', () => {
    render(<FacilityHandler {...mockProps} />);
    
    const nameInput = screen.getByLabelText('Facility Name*');
    fireEvent.change(nameInput, { target: { value: 'New Facility Name' } });
    
    expect(mockProps.handleInputChange).toHaveBeenCalled();
  });

  test('calls handleSubmit when form is submitted', () => {
    render(<FacilityHandler {...mockProps} />);
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    expect(mockProps.handleSubmit).toHaveBeenCalled();
  });

  test('shows loading state when loading prop is true', () => {
    render(<FacilityHandler {...mockProps} loading={true} />);
    
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(screen.getByText('Saving...')).toBeDisabled();
  });

  test('calls resetForm and setView when cancel button is clicked', () => {
    render(<FacilityHandler {...mockProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockProps.resetForm).toHaveBeenCalled();
    expect(mockProps.setView).toHaveBeenCalledWith('list');
  });

  test('shows image preview when imagePreview is provided', () => {
    const imageUrl = 'data:image/jpeg;base64,test123';
    render(<FacilityHandler {...mockProps} imagePreview={imageUrl} />);
    
    const previewImg = screen.getByAltText('Facility preview');
    expect(previewImg).toBeInTheDocument();
    expect(previewImg).toHaveAttribute('src', imageUrl);
  });

  test('calls setImageFile and setImagePreview with null when remove image button is clicked', () => {
    const imageUrl = 'data:image/jpeg;base64,test123';
    render(<FacilityHandler {...mockProps} imagePreview={imageUrl} />);
    
    const removeButton = screen.getByText('Remove Image');
    fireEvent.click(removeButton);
    
    expect(mockProps.setImageFile).toHaveBeenCalledWith(null);
    expect(mockProps.setImagePreview).toHaveBeenCalledWith(null);
  });

  test('handles image upload and preview', async () => {
    // Mock FileReader and its methods
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      addEventListener: jest.fn(),
      result: 'data:image/jpeg;base64,mockImageData'
    };
    
    global.FileReader = jest.fn(() => mockFileReader);
    
    render(<FacilityHandler {...mockProps} />);
    
    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText('Facility Image');
    
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    
    // Get the callback function that was passed to addEventListener
    const loadCallback = mockFileReader.addEventListener.mock.calls[0][1];
    
    // Manually trigger the load event
    await act(async () => {
      loadCallback();
    });
    
    expect(mockProps.setImagePreview).toHaveBeenCalledWith('data:image/jpeg;base64,mockImageData');
    expect(mockProps.setImageFile).toHaveBeenCalledWith('data:image/jpeg;base64,mockImageData');
  });

  test('does not attempt to process image when no file is selected', () => {
    render(<FacilityHandler {...mockProps} />);
    
    const input = screen.getByLabelText('Facility Image');
    fireEvent.change(input, { target: { files: [] } });
    
    expect(mockProps.setImagePreview).not.toHaveBeenCalled();
    expect(mockProps.setImageFile).not.toHaveBeenCalled();
  });
});