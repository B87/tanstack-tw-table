import type { DataTableView, DataTableViewStorage } from "../types";

const STORAGE_PREFIX = "data-table-views";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
const DEBOUNCE_DELAY = 300; // 300ms debounce

interface CacheEntry {
  data: DataTableView[];
  timestamp: number;
}

interface PendingOperation {
  timeout: NodeJS.Timeout;
  promise: Promise<void>;
  resolve: () => void;
  reject: (error: Error) => void;
}

export class OptimizedStorageProvider implements DataTableViewStorage {
  private cache = new Map<string, CacheEntry>();
  private pendingSaves = new Map<string, PendingOperation>();

  private getStorageKey(tableId: string): string {
    return `${STORAGE_PREFIX}:${tableId}`;
  }

  private isValidCache(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < CACHE_DURATION;
  }

  private async readFromStorage(key: string): Promise<DataTableView[]> {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return [];

      const views = JSON.parse(stored) as DataTableView[];
      return views.map(view => ({
        ...view,
        createdAt: new Date(view.createdAt),
        updatedAt: new Date(view.updatedAt),
      }));
    } catch (error) {
      console.error("Failed to read from localStorage:", error);
      return [];
    }
  }

  private async writeToStorage(key: string, views: DataTableView[]): Promise<void> {
    try {
      // Compress large objects by removing unnecessary whitespace
      const serialized = JSON.stringify(views);
      localStorage.setItem(key, serialized);

      // Update cache
      this.cache.set(key, {
        data: views,
        timestamp: Date.now(),
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        // Try to clear old cache entries and retry
        this.clearExpiredCache();
        try {
          localStorage.setItem(key, JSON.stringify(views));
          this.cache.set(key, {
            data: views,
            timestamp: Date.now(),
          });
        } catch (retryError) {
          throw new Error("Storage quota exceeded. Unable to save view.");
        }
      } else {
        throw new Error("Failed to save view to storage");
      }
    }
  }

  private clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }

  private debouncedSave(tableId: string, views: DataTableView[]): Promise<void> {
    const key = this.getStorageKey(tableId);

    // Cancel pending save if exists
    if (this.pendingSaves.has(key)) {
      const pending = this.pendingSaves.get(key)!;
      clearTimeout(pending.timeout);
      pending.resolve(); // Resolve the previous promise
      this.pendingSaves.delete(key);
    }

    // Create new debounced save
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(async () => {
        this.pendingSaves.delete(key);
        try {
          await this.writeToStorage(key, views);
          resolve();
        } catch (error) {
          reject(error as Error);
        }
      }, DEBOUNCE_DELAY);

      this.pendingSaves.set(key, {
        timeout,
        promise: Promise.resolve(),
        resolve,
        reject,
      });
    });
  }

  async saveView(tableId: string, view: DataTableView): Promise<void> {
    try {
      const existingViews = await this.loadViews(tableId);
      const viewIndex = existingViews.findIndex(v => v.id === view.id);

      const updatedViews = [...existingViews];
      if (viewIndex >= 0) {
        updatedViews[viewIndex] = { ...view, updatedAt: new Date() };
      } else {
        updatedViews.push(view);
      }

      await this.debouncedSave(tableId, updatedViews);
    } catch (error) {
      console.error("Failed to save view:", error);
      throw error instanceof Error ? error : new Error("Failed to save view");
    }
  }

  async loadViews(tableId: string): Promise<DataTableView[]> {
    const key = this.getStorageKey(tableId);

    // Check cache first
    const cached = this.cache.get(key);
    if (cached && this.isValidCache(cached)) {
      return [...cached.data]; // Return a copy to prevent mutations
    }

    // Load from storage
    try {
      const views = await this.readFromStorage(key);

      // Update cache
      this.cache.set(key, {
        data: views,
        timestamp: Date.now(),
      });

      return views;
    } catch (error) {
      console.error("Failed to load views:", error);
      return [];
    }
  }

  async deleteView(tableId: string, viewId: string): Promise<void> {
    try {
      const existingViews = await this.loadViews(tableId);
      const filteredViews = existingViews.filter(view => view.id !== viewId);
      await this.debouncedSave(tableId, filteredViews);
    } catch (error) {
      console.error("Failed to delete view:", error);
      throw error instanceof Error ? error : new Error("Failed to delete view");
    }
  }

  async updateView(tableId: string, viewId: string, updates: Partial<DataTableView>): Promise<void> {
    try {
      const existingViews = await this.loadViews(tableId);
      const viewIndex = existingViews.findIndex(v => v.id === viewId);

      if (viewIndex === -1) {
        throw new Error("View not found");
      }

      const updatedViews = [...existingViews];
      updatedViews[viewIndex] = {
        ...existingViews[viewIndex],
        ...updates,
        updatedAt: new Date(),
      };

      await this.debouncedSave(tableId, updatedViews);
    } catch (error) {
      console.error("Failed to update view:", error);
      throw error instanceof Error ? error : new Error("Failed to update view");
    }
  }

  async clearAllViews(tableId: string): Promise<void> {
    try {
      const key = this.getStorageKey(tableId);
      localStorage.removeItem(key);
      this.cache.delete(key);

      // Cancel any pending saves
      if (this.pendingSaves.has(key)) {
        const pending = this.pendingSaves.get(key)!;
        clearTimeout(pending.timeout);
        pending.resolve();
        this.pendingSaves.delete(key);
      }
    } catch (error) {
      console.error("Failed to clear views:", error);
      throw new Error("Failed to clear views");
    }
  }

  // Utility method to get cache statistics
  getCacheStats(): {
    size: number;
    entries: Array<{ key: string; age: number; size: number }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      size: JSON.stringify(entry.data).length,
    }));

    return {
      size: this.cache.size,
      entries,
    };
  }

  // Utility method to preload views for better UX
  async preloadViews(tableIds: string[]): Promise<void> {
    const promises = tableIds.map(tableId =>
      this.loadViews(tableId).catch(error => {
        console.warn(`Failed to preload views for table ${tableId}:`, error);
      })
    );

    await Promise.allSettled(promises);
  }
}

export const optimizedStorageProvider = new OptimizedStorageProvider();
