import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react'; // Import act for wrapping state updates within file
import Facility from './Facility.jsx';
import axios from 'axios';

jest.mock('axios');
jest.mock('@react-google-maps/api', () => ({
  GoogleMap: ({ children, onLoad }) => {
    onLoad && onLoad({});
    return <div data-testid="mock-google-map">{children}</div>;
  },
  LoadScript: ({ children }) => <div>{children}</div>,
  Marker: ({ onClick, position }) => (
    <div data-testid={`marker-${position.lat}-${position.lng}`} onClick={onClick} />
  ),
}));

const mockFacilities = [
  {
    Licensee: 'Facility 1',
    'Street Address': '123 Main St',
    City: 'Baltimore',
    county: 'Baltimore County',
    'Zip Code': '21201',
  },
  {
    Licensee: 'Facility 2',
    'Street Address': '456 Oak St',
    City: 'Towson',
    county: 'Baltimore County',
    'Zip Code': '21204',
  },
];

describe('Facility Component', () => {
  beforeAll(() => {
    global.import = { meta: { env: { VITE_GOOGLE_MAPS_API_KEY: 'mock-api-key' } } };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    axios.get
      .mockResolvedValueOnce({
        data: { results: [{ geometry: { location: { lat: 39.2904, lng: -76.6122 } } }] },
      })
      .mockResolvedValueOnce({
        data: { results: [{ geometry: { location: { lat: 39.3000, lng: -76.6200 } } }] },
      });
  });

  test('renders facility list and search bar', () => {
    render(<Facility facilities={mockFacilities} />);
    expect(screen.getByPlaceholderText('Enter Zip, County, or City...')).toBeInTheDocument();
    expect(screen.getByText('Facility 1')).toBeInTheDocument();
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('Facility 2')).toBeInTheDocument();
    expect(screen.getByText('456 Oak St')).toBeInTheDocument();
    expect(screen.getByText('2 locations found')).toBeInTheDocument();
  });

  test('filters facilities based on search query', async () => {
    render(<Facility facilities={mockFacilities} />);
    fireEvent.change(screen.getByPlaceholderText('Enter Zip, County, or City...'), {
      target: { value: 'Towson' },
    });
    await waitFor(() => {
      expect(screen.getByText('Facility 2')).toBeInTheDocument();
      expect(screen.queryByText('Facility 1')).not.toBeInTheDocument();
      expect(screen.getByText('1 locations found')).toBeInTheDocument();
    });
  });

  test('loads more facilities when "Load More" is clicked', async () => {
    const largeFacilityList = Array.from({ length: 60 }, (_, i) => ({
      Licensee: `Facility ${i + 1}`,
      'Street Address': `${i + 1} Test St`,
      City: 'Baltimore',
      county: 'Baltimore County',
      'Zip Code': `2120${i % 10}`,
    }));
    render(<Facility facilities={largeFacilityList} />);
    expect(screen.getAllByText(/Facility \d+/).length).toBe(50);
    expect(screen.getByText('60 locations found')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Load More Facilities'));
    await waitFor(() => {
      expect(screen.getAllByText(/Facility \d+/).length).toBe(60);
      expect(screen.queryByText('Load More Facilities')).not.toBeInTheDocument();
    });
  });

  test('fetches and displays markers on the map', async () => {
    render(<Facility facilities={mockFacilities} />);
    await act(async () => {
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          'https://maps.googleapis.com/maps/api/geocode/json?address=123%20Main%20St%2C%20Baltimore%2C%20Baltimore%20County&key=mock-api-key',
          expect.anything()
        );
        expect(axios.get).toHaveBeenCalledWith(
          'https://maps.googleapis.com/maps/api/geocode/json?address=456%20Oak%20St%2C%20Towson%2C%20Baltimore%20County&key=mock-api-key',
          expect.anything()
        );
        expect(screen.getByTestId('marker-39.2904--76.6122')).toBeInTheDocument();
        expect(screen.getByTestId('marker-39.3000--76.6200')).toBeInTheDocument();
      });
    });
  });

  test('selects facility and updates map center on marker click', async () => {
    render(<Facility facilities={mockFacilities} />);
    await act(async () => {
      await waitFor(() => {
        expect(screen.getByTestId('marker-39.2904--76.6122')).toBeInTheDocument();
        expect(screen.getByTestId('marker-39.3000--76.6200')).toBeInTheDocument();
      });
    });
    fireEvent.click(screen.getByTestId('marker-39.2904--76.6122'));
    await waitFor(() => {
      expect(screen.getByText('Facility 1').closest('.facility-card')).toHaveClass('selected');
    });
  });

  test('handles API error gracefully', async () => {
    jest.clearAllMocks();
    axios.get.mockRejectedValue(new Error('API Error'));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<Facility facilities={mockFacilities} />);
    await act(async () => {
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching coordinates:', expect.any(Error));
        expect(screen.getByText('Facility 1')).toBeInTheDocument();
      });
    });
    consoleErrorSpy.mockRestore();
  });
});