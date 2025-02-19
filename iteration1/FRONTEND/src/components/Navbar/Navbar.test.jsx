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
});
