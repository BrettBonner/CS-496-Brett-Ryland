import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Navbar from "./Navbar";

describe("Navbar Component", () => {
    test("renders logo and links", () => {
        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        // Assert that the logo is displayed
        const logo = screen.getByAltText(/Assisted Living Direct/i);
        expect(logo).toBeInTheDocument();

        // Assert that the navigation links are displayed
        const links = screen.getAllByRole("link");
        expect(links.length).toBe(4);
    });
});
