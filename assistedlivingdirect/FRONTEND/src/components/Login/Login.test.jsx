import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import Login from './Login.jsx';
import { BrowserRouter } from 'react-router-dom';
import * as api from '../../api';

// Mock useAuth
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock API functions
jest.mock('../../api', () => ({
  loginUser: jest.fn(),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Login Component', () => {
  const mockLogin = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup the useAuth mock
    const { useAuth } = require('../../context/AuthContext');
    useAuth.mockReturnValue({
      login: mockLogin,
    });
    
    // Setup the loginUser mock to succeed by default
    api.loginUser.mockResolvedValue({ username: 'testuser', email: 'test@example.com' });
  });
  
  test('renders login form correctly', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    // Check that all elements are rendered
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Username or Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByText('Don\'t have an account?')).toBeInTheDocument();
    expect(screen.getByText('Register here')).toBeInTheDocument();
  });
  
  test('register link navigates to register page', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const registerLink = screen.getByText('Register here');
    expect(registerLink.getAttribute('href')).toBe('/register');
  });
  
  test('handles input changes', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const identifierInput = screen.getByLabelText('Username or Email');
    const passwordInput = screen.getByLabelText('Password');
    
    fireEvent.change(identifierInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(identifierInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password123');
  });
  
  test('submits form with correct data and redirects on success', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const identifierInput = screen.getByLabelText('Username or Email');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: 'Login' });
    
    fireEvent.change(identifierInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    await act(async () => {
      fireEvent.click(loginButton);
    });
    
    await waitFor(() => {
      // Check that loginUser was called with correct arguments
      expect(api.loginUser).toHaveBeenCalledWith('testuser', 'password123');
      
      // Check that login from context was called with user data
      expect(mockLogin).toHaveBeenCalledWith({ 
        username: 'testuser', 
        email: 'test@example.com' 
      });
      
      // Check that navigation was triggered
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
  
  test('displays error message on login failure', async () => {
    // Setup the loginUser mock to fail
    api.loginUser.mockRejectedValue({ 
      response: { 
        data: { 
          error: 'Invalid credentials' 
        } 
      } 
    });
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const identifierInput = screen.getByLabelText('Username or Email');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: 'Login' });
    
    fireEvent.change(identifierInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    
    await act(async () => {
      fireEvent.click(loginButton);
    });
    
    await waitFor(() => {
      // Check that error message is displayed
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
  
  test('displays generic error when response has no error message', async () => {
    // Setup the loginUser mock to fail without specific error
    api.loginUser.mockRejectedValue({ response: {} });
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const loginButton = screen.getByRole('button', { name: 'Login' });
    
    await act(async () => {
      fireEvent.click(loginButton);
    });
    
    await waitFor(() => {
      // Check that generic error message is displayed
      expect(screen.getByText('Login failed')).toBeInTheDocument();
    });
  });
  
  test('prevents default form behavior on submit', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const form = screen.getByRole('form');
    const mockPreventDefault = jest.fn();
    
    await act(async () => {
      fireEvent.submit(form, {
        preventDefault: mockPreventDefault
      });
    });
    
    expect(mockPreventDefault).toHaveBeenCalled();
  });
  
  test('logo navigates to home page', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const logoLink = screen.getByRole('link', { name: /Assisted Living Direct/i });
    expect(logoLink.getAttribute('href')).toBe('/');
  });
});