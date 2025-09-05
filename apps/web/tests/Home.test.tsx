import { render, screen } from "@testing-library/react";
import Home from "../app/page";

describe("Home page", () => {
    it("renders the main elements", () => {
        render(<Home />);

        // Check for the 'Get started by editing' text
        expect(screen.getByText(/Get started by editing/i)).toBeInTheDocument();

        // Check for 'Save and see your changes instantly.'
        expect(
            screen.getByText(/Save and see your changes instantly/i)
        ).toBeInTheDocument();

        // Check for the 'Deploy now' link
        expect(
            screen.getByRole("link", { name: /Deploy now/i })
        ).toBeInTheDocument();
    });
});
