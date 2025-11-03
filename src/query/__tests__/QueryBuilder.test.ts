import { describe, expect, it } from "vitest";
import { DataTableQueryBuilder, createQueryBuilder } from "../QueryBuilder";
import { FilterOperator } from "../FilterOperators";

interface TestUser {
  id: string;
  name: string;
  status: string;
  createdAt: Date;
}

describe("QueryBuilder", () => {
  describe("DataTableQueryBuilder", () => {
    it("should create empty query builder", () => {
      const builder = new DataTableQueryBuilder<TestUser>();
      const params = builder.build();

      expect(params.toString()).toBe("");
    });

    it("should add filters", () => {
      const builder = new DataTableQueryBuilder<TestUser>().filter("name", FilterOperator.CONTAINS, "john");

      const params = builder.build();

      expect(params.get("name")).toBe("john");
    });

    it("should add sorting", () => {
      const builder = new DataTableQueryBuilder<TestUser>().sort("name", "desc");

      const params = builder.build();

      expect(params.get("sortBy")).toBe("name");
      expect(params.get("sortOrder")).toBe("desc");
    });

    it("should handle invalid sort directions by using TypeScript strict typing", () => {
      // TypeScript prevents invalid sort directions at compile time
      // This test documents the expected behavior
      const builder = new DataTableQueryBuilder<TestUser>().sort("name", "asc");

      const params = builder.build();

      expect(params.get("sortBy")).toBe("name");
      expect(params.get("sortOrder")).toBe("asc");
    });

    it("should handle runtime invalid sort directions gracefully", () => {
      // Test what happens if invalid direction gets through somehow (e.g., from external data)
      const builder = new DataTableQueryBuilder<TestUser>();

      // Force invalid direction through type assertion to test runtime behavior
      const invalidDirection = "invalid" as "asc" | "desc";
      builder.sort("name", invalidDirection);

      const params = builder.build();

      expect(params.get("sortBy")).toBe("name");
      expect(params.get("sortOrder")).toBe("invalid"); // Builder passes through the value as-is
    });

    it("should not add sort parameters when no sorting is specified", () => {
      const builder = new DataTableQueryBuilder<TestUser>();

      const params = builder.build();

      expect(params.get("sortBy")).toBeNull();
      expect(params.get("sortOrder")).toBeNull();
      expect(params.get("additionalSorts")).toBeNull();
    });

    it("should handle multiple sorting criteria", () => {
      const builder = new DataTableQueryBuilder<TestUser>()
        .sort("name", "asc")
        .sort("status", "desc")
        .sort("id", "asc");

      const params = builder.build();

      // Primary sort should be the first one added (name)
      expect(params.get("sortBy")).toBe("name");
      expect(params.get("sortOrder")).toBe("asc");

      // Additional sorts should contain the rest in order
      const additionalSorts = params.get("additionalSorts");
      expect(additionalSorts).toBe("status:desc,id:asc");
    });

    it("should replace existing sort when same column is sorted multiple times", () => {
      const builder = new DataTableQueryBuilder<TestUser>().sort("name", "asc").sort("name", "desc"); // Should replace the first sort

      const params = builder.build();

      expect(params.get("sortBy")).toBe("name");
      expect(params.get("sortOrder")).toBe("desc");
      expect(params.get("additionalSorts")).toBeNull(); // No additional sorts since only one column
    });

    it("should handle complex multiple sorting with replacement", () => {
      const builder = new DataTableQueryBuilder<TestUser>()
        .sort("name", "asc")
        .sort("status", "desc")
        .sort("name", "desc") // Should replace first name sort
        .sort("id", "asc");

      const params = builder.build();

      // Primary sort should be the first remaining sort (status)
      expect(params.get("sortBy")).toBe("status");
      expect(params.get("sortOrder")).toBe("desc");

      // Additional sorts should contain name (updated) and id
      const additionalSorts = params.get("additionalSorts");
      expect(additionalSorts).toBe("name:desc,id:asc");
    });

    it("should clear all sorts when clearSorts is called", () => {
      const builder = new DataTableQueryBuilder<TestUser>().sort("name", "asc").sort("status", "desc").clearSorts();

      const params = builder.build();

      expect(params.get("sortBy")).toBeNull();
      expect(params.get("sortOrder")).toBeNull();
      expect(params.get("additionalSorts")).toBeNull();
    });

    it("should handle sortsFromTable method with TanStack Table SortingState", () => {
      const sortingState = [
        { id: "name", desc: false },
        { id: "status", desc: true },
        { id: "id", desc: false },
      ];

      const builder = new DataTableQueryBuilder<TestUser>().sortsFromTable(sortingState);

      const params = builder.build();

      // Primary sort should be the first in the array (name)
      expect(params.get("sortBy")).toBe("name");
      expect(params.get("sortOrder")).toBe("asc");

      // Additional sorts should contain the rest
      const additionalSorts = params.get("additionalSorts");
      expect(additionalSorts).toBe("status:desc,id:asc");
    });

    it("should handle empty sortsFromTable", () => {
      const builder = new DataTableQueryBuilder<TestUser>()
        .sort("name", "asc") // Add initial sort
        .sortsFromTable([]); // Clear with empty array

      const params = builder.build();

      expect(params.get("sortBy")).toBeNull();
      expect(params.get("sortOrder")).toBeNull();
      expect(params.get("additionalSorts")).toBeNull();
    });

    it("should add pagination", () => {
      const builder = new DataTableQueryBuilder<TestUser>().paginate(2, 25);

      const params = builder.build();

      expect(params.get("page")).toBe("2");
      expect(params.get("limit")).toBe("25");
    });

    it("should add search", () => {
      const builder = new DataTableQueryBuilder<TestUser>().search(["name", "status"], "test");

      const params = builder.build();

      expect(params.get("search")).toBe("test");
      expect(params.get("searchColumns")).toBe("name,status");
    });
  });

  describe("Date Filtering", () => {
    it("should handle DATE_EQUALS operator", () => {
      const builder = new DataTableQueryBuilder<TestUser>().filter(
        "name",
        FilterOperator.DATE_EQUALS,
        "2024-01-15T00:00:00Z"
      );

      const params = builder.build();

      expect(params.get("name")).toBe("2024-01-15T00:00:00Z");
      expect(params.get("name_op")).toBe("date_equals");
    });

    it("should handle DATE_BEFORE operator", () => {
      const builder = new DataTableQueryBuilder<TestUser>().filter(
        "name",
        FilterOperator.DATE_BEFORE,
        "2024-01-15T00:00:00Z"
      );

      const params = builder.build();

      expect(params.get("name")).toBe("2024-01-15T00:00:00Z");
      expect(params.get("name_op")).toBe("date_before");
    });

    it("should handle DATE_AFTER operator", () => {
      const builder = new DataTableQueryBuilder<TestUser>().filter(
        "name",
        FilterOperator.DATE_AFTER,
        "2024-01-15T00:00:00Z"
      );

      const params = builder.build();

      expect(params.get("name")).toBe("2024-01-15T00:00:00Z");
      expect(params.get("name_op")).toBe("date_after");
    });

    it("should handle DATE_BETWEEN operator", () => {
      const builder = new DataTableQueryBuilder<TestUser>().filter(
        "name",
        FilterOperator.DATE_BETWEEN,
        "2024-01-15T00:00:00Z",
        "2024-01-20T00:00:00Z"
      );

      const params = builder.build();

      expect(params.get("name_min")).toBe("2024-01-15T00:00:00Z");
      expect(params.get("name_max")).toBe("2024-01-20T00:00:00Z");
      expect(params.get("name_op")).toBe("date_between");
    });

    it("should handle date filter values from DataTableDateFilter", () => {
      const columnFilters = [
        {
          id: "createdAt",
          value: {
            operator: FilterOperator.DATE_AFTER,
            date: new Date("2024-01-15"),
            endDate: undefined,
          },
        },
      ];

      const builder = new DataTableQueryBuilder<TestUser>().filtersFromTable(columnFilters);

      const params = builder.build();

      expect(params.get("createdAt")).toBe("2024-01-15T00:00:00.000Z");
      expect(params.get("createdAt_op")).toBe("date_after");
    });

    it("should handle date range filter values from DataTableDateFilter", () => {
      const columnFilters = [
        {
          id: "createdAt",
          value: {
            operator: FilterOperator.DATE_BETWEEN,
            date: new Date("2024-01-15"),
            endDate: new Date("2024-01-20"),
          },
        },
      ];

      const builder = new DataTableQueryBuilder<TestUser>().filtersFromTable(columnFilters);

      const params = builder.build();

      expect(params.get("createdAt_min")).toBe("2024-01-15T00:00:00.000Z");
      expect(params.get("createdAt_max")).toBe("2024-01-20T00:00:00.000Z");
      expect(params.get("createdAt_op")).toBe("date_between");
    });

    it("should ignore date filters without date value", () => {
      const columnFilters = [
        {
          id: "createdAt",
          value: {
            operator: FilterOperator.DATE_AFTER,
            date: undefined,
          },
        },
      ];

      const builder = new DataTableQueryBuilder<TestUser>().filtersFromTable(columnFilters);

      const params = builder.build();

      expect(params.get("createdAt")).toBeNull();
      expect(params.get("createdAt_op")).toBeNull();
    });

    it("should properly encode Date objects to avoid [object Object] in URLs", () => {
      const testDate = new Date("2024-01-15T10:30:00.000Z");

      const builder = new DataTableQueryBuilder<TestUser>().filter(
        "createdAt" as keyof TestUser,
        FilterOperator.DATE_AFTER,
        testDate
      );

      const params = builder.build();

      // Verify the date is properly converted to ISO string, not [object Object]
      // Note: Date strings are not encoded to avoid double-encoding issues
      expect(params.get("createdAt")).toBe("2024-01-15T10:30:00.000Z");
      expect(params.get("createdAt")).not.toContain("[object Object]");
      expect(params.get("createdAt")).not.toContain("%255Bobject");
    });

    it("should handle date filter values with string dates", () => {
      const columnFilters = [
        {
          id: "createdAt",
          value: {
            operator: FilterOperator.DATE_AFTER,
            date: "2024-01-15T10:30:00.000Z", // String date instead of Date object
            endDate: undefined,
          },
        },
      ];

      const builder = new DataTableQueryBuilder<TestUser>().filtersFromTable(columnFilters);
      const params = builder.build();

      // Should still work correctly with string dates (not encoded to avoid double-encoding)
      expect(params.get("createdAt")).toBe("2024-01-15T10:30:00.000Z");
      expect(params.get("createdAt_op")).toBe("date_after");
    });

    it("should handle invalid date strings gracefully", () => {
      const columnFilters = [
        {
          id: "createdAt",
          value: {
            operator: FilterOperator.DATE_AFTER,
            date: "invalid-date-string",
            endDate: undefined,
          },
        },
      ];

      const builder = new DataTableQueryBuilder<TestUser>().filtersFromTable(columnFilters);
      const params = builder.build();

      // Should not add invalid dates to the query
      expect(params.get("createdAt")).toBeNull();
      expect(params.get("createdAt_op")).toBeNull();
    });
  });

  describe("createQueryBuilder", () => {
    it("should create new QueryBuilder instance", () => {
      const builder = createQueryBuilder<TestUser>();
      expect(builder).toBeInstanceOf(DataTableQueryBuilder);
    });
  });
});
