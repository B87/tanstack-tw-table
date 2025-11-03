import { describe, expect, it } from "vitest";
import { createSearchableColumns, ColumnConfigBuilder, getColumnType } from "../column-helpers";

interface TestUser {
  id: string;
  name: string;
  age: number;
  createdAt: Date;
  tags: string[];
}

describe("column-helpers", () => {
  describe("createSearchableColumns", () => {
    it("should create searchable columns", () => {
      const columns = createSearchableColumns<TestUser>([
        { id: "name", title: "Name" },
        { id: "id", title: "ID" },
      ]);

      expect(columns).toHaveLength(2);
      expect(columns[0]).toEqual({ id: "name", title: "Name" });
    });
  });

  describe("ColumnConfigBuilder", () => {
    it("should build configuration with fluent API", () => {
      const config = new ColumnConfigBuilder<TestUser>().addSearchable("name", "Name").build();

      expect(config.searchableColumns).toHaveLength(1);
      expect(config.searchableColumns[0]).toEqual({ id: "name", title: "Name" });
    });
  });

  describe("getColumnType", () => {
    const sampleUser: TestUser = {
      id: "1",
      name: "John Doe",
      age: 30,
      createdAt: new Date(),
      tags: ["admin"],
    };

    it("should return correct types", () => {
      expect(getColumnType("name", sampleUser)).toBe("string");
      expect(getColumnType("age", sampleUser)).toBe("number");
      expect(getColumnType("createdAt", sampleUser)).toBe("date");
      expect(getColumnType("tags", sampleUser)).toBe("array");
    });
  });
});
