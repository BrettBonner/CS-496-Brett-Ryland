import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from './Register';
import { registerUser } from '../../../api';

// Mock the api module
jest.mock('../../../api', () => ({
  registerUser: jest.fn(),
}));

// Mock window.alert
window.alert = jest.fn();

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderRegisterComponent = () => {
  return render(
    <BrowserRouter>
      <Register />
    </BrowserRouter>
  );
};

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders register form correctly', () => {
    renderRegisterComponent();
    
    expect(screen.getByLabelText(/username\*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email\*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password\*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password\*/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByText(/back to login/i)).toBeInTheDocument();
  });

  test('handles input changes', () => {
    renderRegisterComponent();
    
    const usernameInput = screen.getByLabelText(/username\*/i);
    const emailInput = screen.getByLabelText(/email\*/i);
    const passwordInput = screen.getByLabelText(/^password\*/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password\*/i);
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    expect(usernameInput.value).toBe('testuser');
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
    expect(confirmPasswordInput.value).toBe('password123');
  });

  test('validates form fields - empty fields', () => {
    renderRegisterComponent();
    
    const registerButton = screen.getByRole('button', { name: /register/i });
    
    fireEvent.click(registerButton);
    
    expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  test('validates form fields - invalid data', () => {
    renderRegisterComponent();
    
    const usernameInput = screen.getByLabelText(/username\*/i);
    const emailInput = screen.getByLabelText(/email\*/i);
    const passwordInput = screen.getByLabelText(/^password\*/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password\*/i);
    const registerButton = screen.getByRole('button', { name: /register/i });
    
    fireEvent.change(usernameInput, { target: { value: 'te' } }); // Too short
    fireEvent.change(emailInput, { target: { value: 'invalidemail' } }); // Invalid format
    fireEvent.change(passwordInput, { target: { value: 'pass' } }); // Too short
    fireEvent.change(confirmPasswordInput, { target: { value: 'password' } }); // Doesn't match
    
    fireEvent.click(registerButton);
    
    expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  test('clears errors when input is changed', () => {
    renderRegisterComponent();
    
    const usernameInput = screen.getByLabelText(/username\*/i);
    const registerButton = screen.getByRole('button', { name: /register/i });
    
    // Trigger validation error
    fireEvent.click(registerButton);
    expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    
    // Change input to clear error
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    
    // Error should be cleared
    expect(screen.queryByText(/username is required/i)).not.toBeInTheDocument();
  });

  test('submits form with valid data and redirects on success', async () => {
    registerUser.mockResolvedValueOnce({});
    
    renderRegisterComponent();
    
    const usernameInput = screen.getByLabelText(/username\*/i);
    const emailInput = screen.getByLabelText(/email\*/i);
    const passwordInput = screen.getByLabelText(/^password\*/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password\*/i);
    const registerButton = screen.getByRole('button', { name: /register/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    fireEvent.click(registerButton);
    
    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith('testuser', 'test@example.com', 'password123');
      expect(window.alert).toHaveBeenCalledWith('Registration successful! Please log in.');
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('displays error message on registration failure', async () => {
    const errorMessage = 'Username already exists';
    registerUser.mockRejectedValueOnce({ message: errorMessage });
    
    renderRegisterComponent();
    
    const usernameInput = screen.getByLabelText(/username\*/i);
    const emailInput = screen.getByLabelText(/email\*/i);
    const passwordInput = screen.getByLabelText(/^password\*/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password\*/i);
    const registerButton = screen.getByRole('button', { name: /register/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    fireEvent.click(registerButton);
    
    await waitFor(() => {
      expect(screen.getByText(/error registering user: username already exists/i)).toBeInTheDocument();
    });
  });

  test('shows loading state during form submission', async () => {
    // Make the API call take some time
    registerUser.mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve({}), 100)));
    
    renderRegisterComponent();
    
    const usernameInput = screen.getByLabelText(/username\*/i);
    const emailInput = screen.getByLabelText(/email\*/i);
    const passwordInput = screen.getByLabelText(/^password\*/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password\*/i);
    const registerButton = screen.getByRole('button', { name: /register/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    fireEvent.click(registerButton);
    
    // Button should show loading state
    expect(screen.getByText(/registering\.\.\./i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(registerUser).toHaveBeenCalled();
    });
  });

  test('navigates to login page when "Back to Login" is clicked', () => {
    renderRegisterComponent();
    
    const loginLink = screen.getByText(/back to login/i);
    fireEvent.click(loginLink);
    
    // Since we're using BrowserRouter in our test, we can check the link attributes
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });
});