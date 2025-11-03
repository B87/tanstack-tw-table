import { describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { DataTablePagination } from "../data-table-pagination";
import { renderComponent } from "./test-utils";

// Mock table with pagination methods
const mockTable = {
  options: {
    enableRowSelection: true,
  },
  getState: () => ({
    pagination: { pageIndex: 0, pageSize: 10 },
  }),
  getFilteredSelectedRowModel: () => ({
    rows: [],
  }),
  getFilteredRowModel: () => ({
    rows: Array(25).fill({}),
  }),
  getPageCount: () => 3,
  getCanPreviousPage: () => false,
  getCanNextPage: () => true,
  previousPage: vi.fn(),
  nextPage: vi.fn(),
  setPageIndex: vi.fn(),
  setPageSize: vi.fn(),
};

describe("DataTable Pagination", () => {
  describe("DataTablePagination", () => {
    it("should render pagination controls", () => {
      renderComponent(<DataTablePagination table={mockTable as any} />);

      expect(screen.getByText("Rows per page")).toBeInTheDocument();
      expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    });

    it("should show row selection count", () => {
      const { container } = renderComponent(<DataTablePagination table={mockTable as any} />);

      expect(within(container).getByText("No rows selected")).toBeInTheDocument();
    });
  });
});
