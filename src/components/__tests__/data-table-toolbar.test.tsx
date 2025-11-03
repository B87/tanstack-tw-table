import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { DataTableErrorBanner } from "../data-table-error-banner";
import { renderComponent } from "./test-utils";

describe("DataTable Error Components", () => {
  describe("DataTableErrorBanner", () => {
    it("should render error message", () => {
      renderComponent(<DataTableErrorBanner error="Something went wrong" />);

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("should render retry button when onRetry provided", () => {
      const mockRetry = vi.fn();

      renderComponent(<DataTableErrorBanner error="Error message" onRetry={mockRetry} />);

      expect(screen.getByText("Retry")).toBeInTheDocument();
    });

    it("should render dismiss button when onDismiss provided", () => {
      const mockDismiss = vi.fn();

      renderComponent(<DataTableErrorBanner error="Error message" onDismiss={mockDismiss} />);

      expect(screen.getByRole("button", { name: "Dismiss error" })).toBeInTheDocument();
    });
  });
});
