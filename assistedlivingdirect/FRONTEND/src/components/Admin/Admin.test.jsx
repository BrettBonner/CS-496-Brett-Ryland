import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react'; // Updated to use react instead of react-dom/test-utils
import Admin from './Admin.jsx';
import * as api from '../../api';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../../api', () => ({
  getFacilities: jest.fn(),
  getFacilityById: jest.fn(),
  createFacility: jest.fn(),
  updateFacility: jest.fn(),
  deleteFacility: jest.fn(),
}));

const mockFacilities = [
  {
    _id: '1',
    Licensee: 'Facility 1',
    'Street Address': '123 Main St',
    City: 'Baltimore',
    county: 'Baltimore County',
    'Zip Code': '21201',
    'Name of Contact Person': 'John Doe',
    'Business Phone Number': '(410) 555-1234',
    'Business Email': 'john@example.com',
    'Number of Beds': 10,
    'Level of Care': 'Level 1',
    'SALS certified': 'no',
    imageURL: '/images/facility1.jpg',
  },
  {
    _id: '2',
    Licensee: 'Facility 2',
    'Street Address': '456 Oak St',
    City: 'Towson',
    county: 'Baltimore County',
    'Zip Code': '21204',
    'Name of Contact Person': 'Jane Smith',
    'Business Phone Number': '(410) 555-5678',
    'Business Email': 'jane@example.com',
    'Number of Beds': 15,
    'Level of Care': 'Level 2',
    'SALS certified': 'yes',
    imageURL: '/images/facility2.jpg',
  },
];

describe('Admin Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.getFacilities.mockResolvedValue(mockFacilities);
    api.getFacilityById.mockResolvedValue(mockFacilities[0]);
    api.createFacility.mockResolvedValue({});
    api.updateFacility.mockResolvedValue({});
    api.deleteFacility.mockResolvedValue({});
  });

  test('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );
    expect(screen.getByText('Loading facilities...')).toBeInTheDocument();
  });

  test('renders facility list after loading', async () => {
    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Admin Facility Management')).toBeInTheDocument();
      expect(screen.getByText('Add New Facility')).toBeInTheDocument();
      expect(screen.getByText('Facility 1')).toBeInTheDocument();
      expect(screen.getByText('Facility 2')).toBeInTheDocument();
    });
  });

  test('switches to add facility view when "Add New Facility" is clicked', async () => {
    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );
    await waitFor(() => {
      fireEvent.click(screen.getByText('Add New Facility'));
    });
    expect(screen.getByText('Back to List')).toBeInTheDocument();
    expect(screen.getByLabelText('Facility Name*')).toBeInTheDocument();
  });

  test('handles form submission for creating a new facility', async () => {
    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );
    await waitFor(() => {
      fireEvent.click(screen.getByText('Add New Facility'));
    });

    // Fill out form
    fireEvent.change(screen.getByLabelText('Facility Name*'), { target: { value: 'New Facility' } });
    fireEvent.change(screen.getByLabelText('Street Address*'), { target: { value: '789 Pine St' } });
    fireEvent.change(screen.getByLabelText('City*'), { target: { value: 'Baltimore' } });
    fireEvent.change(screen.getByLabelText('County*'), { target: { value: 'Baltimore County' } });
    fireEvent.change(screen.getByLabelText('Zip Code*'), { target: { value: '21205' } });
    fireEvent.change(screen.getByLabelText('Contact Person*'), { target: { value: 'Bob Jones' } });
    fireEvent.change(screen.getByLabelText('Phone Number*'), { target: { value: '(410) 555-9012' } });
    fireEvent.change(screen.getByLabelText('Number of Beds*'), { target: { value: '20' } });

    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByText('Create Facility'));
    });

    await waitFor(() => {
      expect(api.createFacility).toHaveBeenCalledWith(
        {
          Licensee: 'New Facility',
          'Street Address': '789 Pine St',
          City: 'Baltimore',
          county: 'Baltimore County',
          'Zip Code': '21205',
          'Name of Contact Person': 'Bob Jones',
          'Business Phone Number': '(410) 555-9012',
          'Business Email': '',
          'Number of Beds': 20,
          'Level of Care': 'Level 1',
          'SALS certified': 'no',
          imageURL: null,
        },
        null
      );
      expect(screen.getByText('Add New Facility')).toBeInTheDocument();
    });
  });

  test('handles form validation errors', async () => {
    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );
    await waitFor(() => {
      fireEvent.click(screen.getByText('Add New Facility'));
    });

    // Submit empty form to trigger validation errors
    await act(async () => {
      fireEvent.click(screen.getByText('Create Facility'));
    });

    await waitFor(() => {
      expect(screen.getByText('Licensee is required')).toBeInTheDocument();
      expect(screen.getByText('Street Address is required')).toBeInTheDocument();
      expect(api.createFacility).not.toHaveBeenCalled();
    });
  });

  test('handles image upload', async () => {
    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );
    await waitFor(() => {
      fireEvent.click(screen.getByText('Add New Facility'));
    });

    const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText('Facility Image');
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    // Fill required fields and submit
    fireEvent.change(screen.getByLabelText('Facility Name*'), { target: { value: 'New Facility' } });
    fireEvent.change(screen.getByLabelText('Street Address*'), { target: { value: '789 Pine St' } });
    fireEvent.change(screen.getByLabelText('City*'), { target: { value: 'Baltimore' } });
    fireEvent.change(screen.getByLabelText('County*'), { target: { value: 'Baltimore County' } });
    fireEvent.change(screen.getByLabelText('Zip Code*'), { target: { value: '21205' } });
    fireEvent.change(screen.getByLabelText('Contact Person*'), { target: { value: 'Bob Jones' } });
    fireEvent.change(screen.getByLabelText('Phone Number*'), { target: { value: '(410) 555-9012' } });
    fireEvent.change(screen.getByLabelText('Number of Beds*'), { target: { value: '20' } });

    await act(async () => {
      fireEvent.click(screen.getByText('Create Facility'));
    });

    await waitFor(() => {
      expect(api.createFacility).toHaveBeenCalledWith(expect.any(Object), file);
    });
  });

  test('handles edit facility flow', async () => {
    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Facility 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText('Edit')[0]);

    await waitFor(() => {
      expect(screen.getByLabelText('Facility Name*')).toHaveValue('Facility 1');
      expect(screen.getByLabelText('Street Address*')).toHaveValue('123 Main St');
      expect(api.getFacilityById).toHaveBeenCalledWith('1');
    });

    fireEvent.change(screen.getByLabelText('Number of Beds*'), { target: { value: '12' } });
    await act(async () => {
      fireEvent.click(screen.getByText('Update Facility'));
    });

    await waitFor(() => {
      expect(api.updateFacility).toHaveBeenCalledWith('1', expect.any(Object), null);
    });
  });

  test('handles delete facility with confirmation', async () => {
    window.confirm = jest.fn(() => true);
    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Facility 1')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getAllByText('Delete')[0]);
    });

    await waitFor(() => {
      expect(api.deleteFacility).toHaveBeenCalledWith('1');
    });
  });

  test('handles delete cancellation', async () => {
    window.confirm = jest.fn(() => false);
    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );
    await waitFor(() => {
      fireEvent.click(screen.getAllByText('Delete')[0]);
    });

    await waitFor(() => {
      expect(api.deleteFacility).not.toHaveBeenCalled();
    });
  });

  test('displays error when API fails', async () => {
    api.getFacilities.mockRejectedValue(new Error('API Error'));
    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Error loading facilities: API Error')).toBeInTheDocument();
    });
  });

  test('handles facility not found in edit', async () => {
    api.getFacilityById.mockResolvedValue(null);
    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );
    await waitFor(() => {
      fireEvent.click(screen.getAllByText('Edit')[0]);
    });

    await waitFor(() => {
      expect(screen.getByText('Facility not found')).toBeInTheDocument();
    });
  });

  test('handles search term update', async () => {
    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search facilities by name, county, or city...');
      fireEvent.change(searchInput, { target: { value: 'Baltimore' } });
      expect(searchInput).toHaveValue('Baltimore');
    });
  });

  test('handles cancel button in add view', async () => {
    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );
    await waitFor(() => {
      fireEvent.click(screen.getByText('Add New Facility'));
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Cancel'));
    });

    await waitFor(() => {
      expect(screen.getByText('Add New Facility')).toBeInTheDocument();
    });
  });
});