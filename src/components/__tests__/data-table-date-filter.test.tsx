import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { DataTableDateFilter } from "../data-table-date-filter";
import { FilterOperator } from "../../query/FilterOperators";
import { DataTableQueryBuilder } from "../../query/QueryBuilder";

// Only mock what we absolutely need - external dependencies
vi.mock("date-fns", () => ({
  format: (date: any, formatStr: string) => {
    // Handle invalid dates gracefully
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return "Invalid Date";
    }

    // Simple mock that handles our common format patterns
    if (formatStr === "MMM dd, yyyy") {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    }
    return date.toLocaleDateString();
  },
}));

// Create a simple mock column that behaves like TanStack table column
const createMockColumn = (initialValue?: unknown) => {
  let filterValue: unknown = initialValue;
  return {
    getFilterValue: vi.fn(() => filterValue),
    setFilterValue: vi.fn((value: unknown) => {
      filterValue = value;
    }),
  };
};

describe("DataTableDateFilter - User Experience", () => {
  describe("Initial State", () => {
    it("renders a clickable filter button with title", () => {
      const mockColumn = createMockColumn();
      const { container } = render(<DataTableDateFilter column={mockColumn as any} title="Created Date" />);

      const filterButton = within(container).getByRole("button");
      expect(filterButton).toBeInTheDocument();
      expect(filterButton).toHaveTextContent("Created Date");
    });

    it("shows active filter state when date is selected", () => {
      const mockColumn = createMockColumn({
        operator: FilterOperator.DATE_AFTER,
        date: new Date("2024-01-15"),
      });

      render(<DataTableDateFilter column={mockColumn as any} title="Created Date" />);

      // Should show the filter is active with formatted date
      expect(screen.getByText(/Created Date:/)).toBeInTheDocument();
      expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
    });

    it("handles missing or undefined column gracefully", () => {
      const { container } = render(<DataTableDateFilter column={undefined} title="Created Date" />);

      expect(within(container).getByRole("button")).toBeInTheDocument();
    });
  });

  describe("Date Range Display", () => {
    it("shows date range for BETWEEN operator", () => {
      const mockColumn = createMockColumn({
        operator: FilterOperator.DATE_BETWEEN,
        date: new Date("2024-01-15"),
        endDate: new Date("2024-01-20"),
      });

      render(<DataTableDateFilter column={mockColumn as any} title="Created Date" />);

      // Should show both dates in range format
      expect(screen.getByText(/Jan 15, 2024 - Jan 20, 2024/)).toBeInTheDocument();
    });
  });

  describe("Filter Clearing", () => {
    it("allows clearing active filters", () => {
      const mockColumn = createMockColumn({
        operator: FilterOperator.DATE_AFTER,
        date: new Date("2024-01-15"),
      });

      const { container } = render(<DataTableDateFilter column={mockColumn as any} title="Created Date" />);

      // Find and click the clear button (X icon)
      const clearButton = within(container).getByRole("button", { name: /clear filter/i });
      fireEvent.click(clearButton);

      // Should clear the filter value
      expect(mockColumn.setFilterValue).toHaveBeenCalledWith(undefined);
    });

    it("supports keyboard clearing with Enter key", () => {
      const mockColumn = createMockColumn({
        operator: FilterOperator.DATE_AFTER,
        date: new Date("2024-01-15"),
      });

      const { container } = render(<DataTableDateFilter column={mockColumn as any} title="Created Date" />);

      const clearButton = within(container).getByRole("button", { name: /clear filter/i });
      fireEvent.focus(clearButton);
      fireEvent.keyDown(clearButton, { key: "Enter" });
      expect(mockColumn.setFilterValue).toHaveBeenCalledWith(undefined);
    });
  });

  describe("Integration with QueryBuilder", () => {
    it("creates filter values that QueryBuilder can process", () => {
      const mockColumn = createMockColumn();

      // Simulate a date filter being set
      const dateFilterValue = {
        operator: FilterOperator.DATE_AFTER,
        date: new Date("2024-01-15"),
      };

      // Create column filters as they would come from the table
      const columnFilters = [
        {
          id: "createdAt",
          value: dateFilterValue,
        },
      ];

      // Test that QueryBuilder can handle this format
      const queryBuilder = new DataTableQueryBuilder();
      queryBuilder.filtersFromTable(columnFilters);
      const params = queryBuilder.build();

      // Verify the query parameters are generated correctly
      expect(params.get("createdAt")).toBe("2024-01-15T00:00:00.000Z");
      expect(params.get("createdAt_op")).toBe("date_after");
    });

    it("handles date range filters correctly", () => {
      const dateRangeFilter = {
        operator: FilterOperator.DATE_BETWEEN,
        date: new Date("2024-01-15"),
        endDate: new Date("2024-01-20"),
      };

      const columnFilters = [
        {
          id: "createdAt",
          value: dateRangeFilter,
        },
      ];

      const queryBuilder = new DataTableQueryBuilder();
      queryBuilder.filtersFromTable(columnFilters);
      const params = queryBuilder.build();

      // Should create min/max parameters for date ranges
      expect(params.get("createdAt_min")).toBe("2024-01-15T00:00:00.000Z");
      expect(params.get("createdAt_max")).toBe("2024-01-20T00:00:00.000Z");
      expect(params.get("createdAt_op")).toBe("date_between");
    });
  });

  describe("Custom Configuration", () => {
    it("accepts custom operators list", () => {
      const customOperators = [FilterOperator.DATE_EQUALS, FilterOperator.DATE_BEFORE];
      const mockColumn = createMockColumn();

      expect(() => {
        render(<DataTableDateFilter column={mockColumn as any} title="Created Date" operators={customOperators} />);
      }).not.toThrow();
    });

    it("accepts custom default operator", () => {
      const mockColumn = createMockColumn();

      expect(() => {
        render(
          <DataTableDateFilter
            column={mockColumn as any}
            title="Created Date"
            defaultOperator={FilterOperator.DATE_BEFORE}
          />
        );
      }).not.toThrow();
    });
  });

  describe("Error Handling", () => {
    it("handles invalid filter values gracefully", () => {
      const mockColumn = createMockColumn("invalid-filter-value");

      const { container } = render(<DataTableDateFilter column={mockColumn as any} title="Created Date" />);

      expect(within(container).getByRole("button")).toBeInTheDocument();
    });

    it("handles malformed date objects", () => {
      const mockColumn = createMockColumn({
        operator: FilterOperator.DATE_AFTER,
        date: "not-a-date", // This is an invalid date
      });

      const { container } = render(<DataTableDateFilter column={mockColumn as any} title="Created Date" />);

      // Should render without throwing and show the main filter button
      expect(within(container).getByRole("button", { name: /created date/i })).toBeInTheDocument();
    });
  });
});
