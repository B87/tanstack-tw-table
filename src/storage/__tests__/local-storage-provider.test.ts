import { beforeEach, describe, expect, it, vi } from "vitest";
import { LocalStorageProvider } from "../local-storage-provider";
import type { DataTableView } from "../../types";

// Mock localStorage
const mockLocalStorage: Storage & { store: Record<string, string> } = {
  store: {} as Record<string, string>,
  getItem: vi.fn(function (this: typeof mockLocalStorage, key: string) {
    return this.store[key] || null;
  }),
  setItem: vi.fn(function (this: typeof mockLocalStorage, key: string, value: string) {
    this.store[key] = value;
  }),
  removeItem: vi.fn(function (this: typeof mockLocalStorage, key: string) {
    delete this.store[key];
  }),
  clear: vi.fn(function (this: typeof mockLocalStorage) {
    this.store = {};
  }),
  length: 0,
  key: vi.fn(() => null),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

describe("LocalStorageProvider", () => {
  let provider: LocalStorageProvider;
  const tableId = "test-table";

  const mockView: DataTableView = {
    id: "view-1",
    name: "Test View",
    columnFilters: [],
    sorting: [],
    columnVisibility: {},
    pagination: { pageIndex: 0, pageSize: 10 },
    globalFilter: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    provider = new LocalStorageProvider();
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  describe("saveView", () => {
    it("should save view to localStorage", async () => {
      await provider.saveView(tableId, mockView);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "data-table-views:test-table",
        expect.stringContaining(mockView.name)
      );
    });
  });

  describe("loadViews", () => {
    it("should return empty array when no views exist", async () => {
      const views = await provider.loadViews(tableId);
      expect(views).toEqual([]);
    });

    it("should load views from localStorage", async () => {
      await provider.saveView(tableId, mockView);
      const views = await provider.loadViews(tableId);

      expect(views).toHaveLength(1);
      expect(views[0].name).toBe(mockView.name);
    });
  });

  describe("deleteView", () => {
    it("should remove view from localStorage", async () => {
      await provider.saveView(tableId, mockView);
      await provider.deleteView(tableId, mockView.id);

      const views = await provider.loadViews(tableId);
      expect(views).toHaveLength(0);
    });
  });
});
