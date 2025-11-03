import type { DataTableView, DataTableViewStorage } from "../types";

const STORAGE_PREFIX = "data-table-views";

export class LocalStorageProvider implements DataTableViewStorage {
  private getStorageKey(tableId: string): string {
    return `${STORAGE_PREFIX}:${tableId}`;
  }

  async saveView(tableId: string, view: DataTableView): Promise<void> {
    try {
      const existingViews = await this.loadViews(tableId);
      const viewIndex = existingViews.findIndex(v => v.id === view.id);

      if (viewIndex >= 0) {
        existingViews[viewIndex] = { ...view, updatedAt: new Date() };
      } else {
        existingViews.push(view);
      }

      localStorage.setItem(this.getStorageKey(tableId), JSON.stringify(existingViews));
    } catch (error) {
      console.error("Failed to save view to localStorage:", error);
      throw new Error("Failed to save view");
    }
  }

  async loadViews(tableId: string): Promise<DataTableView[]> {
    try {
      const stored = localStorage.getItem(this.getStorageKey(tableId));
      if (!stored) return [];

      const views = JSON.parse(stored) as DataTableView[];
      return views.map(view => ({
        ...view,
        createdAt: new Date(view.createdAt),
        updatedAt: new Date(view.updatedAt),
      }));
    } catch (error) {
      console.error("Failed to load views from localStorage:", error);
      return [];
    }
  }

  async deleteView(tableId: string, viewId: string): Promise<void> {
    try {
      const existingViews = await this.loadViews(tableId);
      const filteredViews = existingViews.filter(view => view.id !== viewId);
      localStorage.setItem(this.getStorageKey(tableId), JSON.stringify(filteredViews));
    } catch (error) {
      console.error("Failed to delete view from localStorage:", error);
      throw new Error("Failed to delete view");
    }
  }

  async updateView(tableId: string, viewId: string, updates: Partial<DataTableView>): Promise<void> {
    try {
      const existingViews = await this.loadViews(tableId);
      const viewIndex = existingViews.findIndex(v => v.id === viewId);

      if (viewIndex === -1) {
        throw new Error("View not found");
      }

      existingViews[viewIndex] = {
        ...existingViews[viewIndex],
        ...updates,
        updatedAt: new Date(),
      };

      localStorage.setItem(this.getStorageKey(tableId), JSON.stringify(existingViews));
    } catch (error) {
      console.error("Failed to update view in localStorage:", error);
      throw new Error("Failed to update view");
    }
  }

  async clearAllViews(tableId: string): Promise<void> {
    try {
      localStorage.removeItem(this.getStorageKey(tableId));
    } catch (error) {
      console.error("Failed to clear views from localStorage:", error);
      throw new Error("Failed to clear views");
    }
  }
}

export const localStorageProvider = new LocalStorageProvider();
