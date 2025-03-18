import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Navbar from "./Navbar";

// Mock the useAuth hook from AuthContext
jest.mock("../../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("Navbar Component", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders logo and links when user is not logged in", () => {
    // Mock useAuth to return no user
    const { useAuth } = require("../../context/AuthContext");
    useAuth.mockReturnValue({ user: null });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Check logo
    const logo = screen.getByAltText(/Assisted Living Direct/i);
    expect(logo).toBeInTheDocument();

    // Check all navigation links
    expect(screen.getByText("Find Assisted Living")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument(); // No user, so "Login" should appear
    expect(screen.getByText("Featured Facilities ❤️")).toBeInTheDocument();

    // Check link count (4 links: Home, Find Assisted Living, Contact, Login)
    const links = screen.getAllByRole("link");
    expect(links.length).toBe(5); // Including the Featured Facilities link

    // Check the button inside Featured Facilities link
    const featuredButton = screen.getByRole("button", { name: /Featured Facilities ❤️/i });
    expect(featuredButton).toBeInTheDocument();
  });

  test("renders username link when user is logged in", () => {
    // Mock useAuth to return a logged-in user
    const { useAuth } = require("../../context/AuthContext");
    useAuth.mockReturnValue({ user: { username: "testuser" } });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Check logo
    const logo = screen.getByAltText(/Assisted Living Direct/i);
    expect(logo).toBeInTheDocument();

    // Check all navigation links
    expect(screen.getByText("Find Assisted Living")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
    expect(screen.getByText("testuser")).toBeInTheDocument(); // Username should appear
    expect(screen.queryByText("Login")).not.toBeInTheDocument(); // Login should not appear
    expect(screen.getByText("Featured Facilities ❤️")).toBeInTheDocument();

    // Check link count (4 links: Home, Find Assisted Living, Contact, Account)
    const links = screen.getAllByRole("link");
    expect(links.length).toBe(5); // Including the Featured Facilities link

    // Check the username link has the correct class
    const usernameLink = screen.getByText("testuser");
    expect(usernameLink).toHaveClass("username");

    // Check the button inside Featured Facilities link
    const featuredButton = screen.getByRole("button", { name: /Featured Facilities ❤️/i });
    expect(featuredButton).toBeInTheDocument();
  });
});