import { describe, expect, it } from "vitest";
import { SortIcon } from "../sort-icon";
import { renderComponent } from "./test-utils";

describe("DataTable Components", () => {
  describe("SortIcon", () => {
    it("should render ascending arrow", () => {
      renderComponent(<SortIcon direction="asc" />);
      // Just check that it renders without error
      expect(document.querySelector("svg")).toBeInTheDocument();
    });

    it("should render descending arrow", () => {
      renderComponent(<SortIcon direction="desc" />);
      expect(document.querySelector("svg")).toBeInTheDocument();
    });

    it("should render unsorted state", () => {
      renderComponent(<SortIcon direction={false} />);
      expect(document.querySelector("svg")).toBeInTheDocument();
    });
  });
});
