import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import Account from './Account.jsx';
import { BrowserRouter } from 'react-router-dom';
import * as api from '../../api';

// Mock useAuth
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock API functions
jest.mock('../../api', () => ({
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  changePassword: jest.fn(),
  getSavedFacilities: jest.fn(),
  getFacilityByIdWithUpdate: jest.fn(),
  removeSavedFacility: jest.fn(),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockUser = { username: 'testuser', email: 'test@example.com' };
const mockFacilities = [
  { _id: '1', Licensee: 'Facility 1', 'Street Address': '123 Main St', 'Number of Beds': 10 },
  { _id: '2', Licensee: 'Facility 2', 'Street Address': '456 Oak St', 'Number of Beds': 15 },
];

describe('Account Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useAuth } = require('../../context/AuthContext');
    useAuth.mockReturnValue({
      user: mockUser,
      logout: jest.fn(),
      setUser: jest.fn(),
    });
    api.getSavedFacilities.mockResolvedValue(mockFacilities);
    api.getFacilityByIdWithUpdate.mockResolvedValue(mockFacilities[0]);
    api.updateUser.mockResolvedValue({ ...mockUser, username: 'newuser' });
    api.changePassword.mockResolvedValue({});
    api.deleteUser.mockResolvedValue({});
    api.removeSavedFacility.mockResolvedValue({});
    jest.useFakeTimers(); // For setInterval testing
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders login prompt when no user is logged in', () => {
    const { useAuth } = require('../../context/AuthContext');
    useAuth.mockReturnValue({ user: null, logout: jest.fn(), setUser: jest.fn() });
    render(
      <BrowserRouter>
        <Account />
      </BrowserRouter>
    );
    expect(screen.getByText('Please log in to view your account.')).toBeInTheDocument();
  });

  test('renders account details when user is logged in', async () => {
    render(
      <BrowserRouter>
        <Account />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Your Account')).toBeInTheDocument();
      expect(screen.getByText('Username: testuser')).toBeInTheDocument();
      expect(screen.getByText('Email: test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Edit Account')).toBeInTheDocument();
      expect(screen.getByText('Change Password')).toBeInTheDocument();
      expect(screen.getByText('Log Out')).toBeInTheDocument();
    });
  });

  test('handles edit mode and updates user', async () => {
    render(
      <BrowserRouter>
        <Account />
      </BrowserRouter>
    );
    await waitFor(() => {
      fireEvent.click(screen.getByText('Edit Account'));
    });
    expect(screen.getByLabelText('Username')).toHaveValue('testuser');
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'newuser' } });
    await act(async () => {
      fireEvent.click(screen.getByText('Save Changes'));
    });
    await waitFor(() => {
      expect(api.updateUser).toHaveBeenCalledWith('testuser', 'newuser', 'test@example.com');
      expect(screen.getByText('Account updated successfully!')).toBeInTheDocument();
    });
  });

  test('cancels edit mode', async () => {
    render(
      <BrowserRouter>
        <Account />
      </BrowserRouter>
    );
    await waitFor(() => {
      fireEvent.click(screen.getByText('Edit Account'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Cancel'));
    });
    expect(screen.getByText('Username: testuser')).toBeInTheDocument();
  });

  test('handles password change', async () => {
    render(
      <BrowserRouter>
        <Account />
      </BrowserRouter>
    );
    await waitFor(() => {
      fireEvent.click(screen.getByText('Change Password'));
    });
    fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'oldpass' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'newpass' } });
    await act(async () => {
      fireEvent.click(screen.getByText('Update Password'));
    });
    await waitFor(() => {
      expect(api.changePassword).toHaveBeenCalledWith('testuser', 'oldpass', 'newpass');
      expect(screen.getByText('Password changed successfully!')).toBeInTheDocument();
    });
  });

  test('shows error on empty password fields', async () => {
    render(
      <BrowserRouter>
        <Account />
      </BrowserRouter>
    );
    await waitFor(() => {
      fireEvent.click(screen.getByText('Change Password'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Update Password'));
    });
    expect(screen.getByText('Please fill in both current and new password fields')).toBeInTheDocument();
  });

  test('handles logout', async () => {
    const { useAuth } = require('../../context/AuthContext');
    const mockLogout = jest.fn();
    useAuth.mockReturnValue({ user: mockUser, logout: mockLogout, setUser: jest.fn() });
    render(
      <BrowserRouter>
        <Account />
      </BrowserRouter>
    );
    await waitFor(() => {
      fireEvent.click(screen.getByText('Log Out'));
    });
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('handles delete account with password', async () => {
    render(
      <BrowserRouter>
        <Account />
      </BrowserRouter>
    );
    await waitFor(() => {
      fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pass' } });
      fireEvent.click(screen.getByText('Delete Account'));
    });
    expect(api.deleteUser).toHaveBeenCalledWith('testuser', 'pass');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('shows error on delete without password', async () => {
    render(
      <BrowserRouter>
        <Account />
      </BrowserRouter>
    );
    await waitFor(() => {
      fireEvent.click(screen.getByText('Delete Account'));
    });
    expect(screen.getByText('Please enter your password to delete your account')).toBeInTheDocument();
  });

  test('displays and removes saved facilities', async () => {
    render(
      <BrowserRouter>
        <Account />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Saved Facilities')).toBeInTheDocument();
      expect(screen.getByText('Facility 1 - 123 Main St')).toBeInTheDocument();
      fireEvent.click(screen.getAllByText('Remove')[0]);
    });
    expect(api.removeSavedFacility).toHaveBeenCalledWith('testuser', '1');
  });

  test('handles bed count changes with notifications', async () => {
    api.getFacilityByIdWithUpdate.mockResolvedValueOnce({ ...mockFacilities[0], 'Number of Beds': 12 });
    render(
      <BrowserRouter>
        <Account />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Saved Facilities')).toBeInTheDocument();
    });
    jest.advanceTimersByTime(30000); // Trigger interval
    await waitFor(() => {
      expect(screen.getByText(/Facility 1 has changed beds from 10 to 12/)).toBeInTheDocument();
      fireEvent.click(screen.getAllByText('×')[0]); // Dismiss notification
      expect(screen.queryByText(/Facility 1 has changed beds from 10 to 12/)).not.toBeInTheDocument();
    });
  });

  test('handles API errors', async () => {
    api.updateUser.mockRejectedValue({ response: { data: { error: 'Update failed' } } });
    render(
      <BrowserRouter>
        <Account />
      </BrowserRouter>
    );
    await waitFor(() => {
      fireEvent.click(screen.getByText('Edit Account'));
      fireEvent.click(screen.getByText('Save Changes'));
    });
    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });
});