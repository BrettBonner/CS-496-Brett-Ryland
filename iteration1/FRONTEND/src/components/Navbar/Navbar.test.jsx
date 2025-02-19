import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navbar from "./Navbar";

describe("Navbar Component", () => {
    test("renders logo and links", () => {
        render(<Navbar />);

        // Assert that the logo is displayed
        const logo = screen.getByAltText(/Assisted Living Direct/i);
        expect(logo).toBeInTheDocument();

        // Assert that the navigation links are displayed
        const links = screen.getAllByRole("link");
        expect(links.length).toBe(2);
        expect(links[0]).toHaveTextContent("Find Assisted Living");
        expect(links[1]).toHaveTextContent("Contact");
    });

    test("handles button click in Featured Facilities section", () => {
        render(<Navbar />);

        const featuredButton = screen.getByRole("button", { name: /Featured Facilities ❤️/i });
        expect(featuredButton).toBeInTheDocument();

        // Simulate a button click
        userEvent.click(featuredButton);

        // Add your assertion for what should happen on click (if any action is defined)
    });
});
