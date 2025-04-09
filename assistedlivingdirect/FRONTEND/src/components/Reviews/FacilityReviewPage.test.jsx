import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FacilityReviewPage from "./FacilityReviewPage";
import { useAuth } from "../../context/AuthContext";
import * as api from "../../api";

// Mock AuthContext
jest.mock("../../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// Mock API functions
jest.mock("../../api", () => ({
  getFacilities: jest.fn(),
  getReviewsByFacilityId: jest.fn(),
  submitReview: jest.fn(),
}));

const mockFacilities = [
  {
    _id: "1",
    Licensee: "Sunrise Home",
    City: "Brooklyn",
    "Street Address": "123 Maple St",
  },
  {
    _id: "2",
    Licensee: "Twilight Lodge",
    City: "Queens",
    "Street Address": "456 Elm St",
  },
];

const mockReviews = [
  {
    username: "jane_doe",
    rating: 5,
    comment: "Great care!",
    timestamp: new Date().toISOString(),
  },
];

describe("FacilityReviewPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the facility list", async () => {
    useAuth.mockReturnValue({ user: null });
    api.getFacilities.mockResolvedValue(mockFacilities);

    render(<FacilityReviewPage />);

    expect(await screen.findByText("Sunrise Home")).toBeInTheDocument();
    expect(screen.getByText("Twilight Lodge")).toBeInTheDocument();
  });

  test("filters facilities based on search input", async () => {
    useAuth.mockReturnValue({ user: null });
    api.getFacilities.mockResolvedValue(mockFacilities);

    render(<FacilityReviewPage />);

    const search = screen.getByPlaceholderText("Search facilities...");
    fireEvent.change(search, { target: { value: "Twilight" } });

    await waitFor(() => {
      expect(screen.queryByText("Sunrise Home")).not.toBeInTheDocument();
      expect(screen.getByText("Twilight Lodge")).toBeInTheDocument();
    });
  });

  test("displays review form for logged-in user", async () => {
    useAuth.mockReturnValue({
      user: { email: "test@example.com", username: "tester" },
    });

    api.getFacilities.mockResolvedValue(mockFacilities);
    api.getReviewsByFacilityId.mockResolvedValue(mockReviews);

    render(<FacilityReviewPage />);

    const reviewButtons = await screen.findAllByText("View Reviews");
    fireEvent.click(reviewButtons[0]); // or [1], depending on which you want


    expect(await screen.findByText("Reviews for Sunrise Home")).toBeInTheDocument();
    expect(screen.getByLabelText("Rating:")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Write your review...")).toBeInTheDocument();
  });

  test("hides review form for guest users", async () => {
    useAuth.mockReturnValue({ user: null });
    api.getFacilities.mockResolvedValue(mockFacilities);
    api.getReviewsByFacilityId.mockResolvedValue([]);

    render(<FacilityReviewPage />);

    const reviewButtons = await screen.findAllByText("View Reviews");
    fireEvent.click(reviewButtons[0]); // or [1], depending on which you want


    expect(await screen.findByText("Reviews for Sunrise Home")).toBeInTheDocument();
    expect(screen.queryByLabelText("Rating:")).not.toBeInTheDocument();
    expect(screen.getByText("Please log in to leave a review.")).toBeInTheDocument();
  });

  test("submits a new review", async () => {
    useAuth.mockReturnValue({
      user: { email: "test@example.com", username: "tester" },
    });

    api.getFacilities.mockResolvedValue(mockFacilities);
    api.getReviewsByFacilityId.mockResolvedValueOnce([]).mockResolvedValueOnce(mockReviews);
    api.submitReview.mockResolvedValue({});

    render(<FacilityReviewPage />);

    const reviewButtons = await screen.findAllByText("View Reviews");
    fireEvent.click(reviewButtons[0]); // or [1], depending on which you want


    fireEvent.change(screen.getByLabelText("Rating:"), {
      target: { value: "4" },
    });

    fireEvent.change(screen.getByPlaceholderText("Write your review..."), {
      target: { value: "Good place" },
    });

    fireEvent.click(reviewButtons[0]); // or [1], depending on which you want


    await waitFor(() => {
      expect(api.submitReview).toHaveBeenCalledWith(
        expect.objectContaining({
          facilityId: "1",
          username: "tester",
          comment: "Good place",
          rating: 4,
        })
      );
    });
  });
});
