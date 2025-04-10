import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from './Home';

// Create a mock navigate function for traversing website
const mockNavigate = jest.fn();

// Mock the react-router-dom module
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Home Component', () => {
  // Create a mock for fetchFacilities prop
  const mockFetchFacilities = jest.fn();
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders all UI elements correctly', () => {
    render(<Home fetchFacilities={mockFetchFacilities} />);
    
    // Check for the logo
    const logo = screen.getByAltText('Main Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '../src/assets/MainLogo.png');
    
    // Check for the headings
    expect(screen.getByText('Find The Perfect Home For Your Loved Ones')).toBeInTheDocument();
    expect(screen.getByText('Discover All Assisted Living in Maryland')).toBeInTheDocument();
    
    // Check for the button
    const button = screen.getByRole('button', { name: /find your facilities/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('cta-button');
  });

  test('calls fetchFacilities and navigates when button is clicked', async () => {
    mockFetchFacilities.mockResolvedValueOnce();
    render(<Home fetchFacilities={mockFetchFacilities} />);
    
    const button = screen.getByRole('button', { name: /find your facilities/i });
    fireEvent.click(button);
    
    expect(mockFetchFacilities).toHaveBeenCalledTimes(1);
    
    await Promise.resolve();
    
    expect(mockNavigate).toHaveBeenCalledWith('/facilitysearch');
  });
});