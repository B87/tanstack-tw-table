"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { DataTableSearchableColumn, DataTableFilterableColumn } from "../types";
import type { FilterOperator } from "../query/FilterOperators";

/**
 * Type-safe helper functions for creating column configurations
 * Eliminates the need for 'as keyof T' type assertions
 */

/**
 * Create searchable columns with full type safety
 */
export function createSearchableColumns<TData>(
  columns: Array<{
    id: keyof TData;
    title: string;
  }>
): DataTableSearchableColumn<TData>[] {
  return columns.map(({ id, title }) => ({
    id,
    title,
  }));
}

/**
 * Create filterable columns with full type safety
 */
export function createFilterableColumns<TData>(
  columns: Array<{
    id: keyof TData;
    title: string;
    type?: "string" | "number" | "date" | "boolean" | "array";
    operators?: FilterOperator[];
    defaultOperator?: FilterOperator;
    options: Array<{
      label: string;
      value: string;
      icon?: React.ComponentType<{ className?: string }>;
      withCount?: boolean;
    }>;
  }>
): DataTableFilterableColumn<TData>[] {
  return columns.map(({ id, title, type, operators, defaultOperator, options }) => ({
    id,
    title,
    type,
    operators,
    defaultOperator,
    options,
  }));
}

/**
 * Type-safe column configuration builder with fluent API
 */
export class ColumnConfigBuilder<TData> {
  private searchableColumns: DataTableSearchableColumn<TData>[] = [];
  private filterableColumns: DataTableFilterableColumn<TData>[] = [];

  /**
   * Add a searchable column
   */
  addSearchable(id: keyof TData, title: string): this {
    this.searchableColumns.push({ id, title });
    return this;
  }

  /**
   * Add multiple searchable columns
   */
  addSearchableColumns(columns: Array<{ id: keyof TData; title: string }>): this {
    this.searchableColumns.push(...createSearchableColumns(columns));
    return this;
  }

  /**
   * Add a filterable column
   */
  addFilterable(config: {
    id: keyof TData;
    title: string;
    type?: "string" | "number" | "date" | "boolean" | "array";
    operators?: FilterOperator[];
    defaultOperator?: FilterOperator;
    options: Array<{
      label: string;
      value: string;
      icon?: React.ComponentType<{ className?: string }>;
      withCount?: boolean;
    }>;
  }): this {
    this.filterableColumns.push({
      id: config.id,
      title: config.title,
      type: config.type,
      operators: config.operators,
      defaultOperator: config.defaultOperator,
      options: config.options,
    });
    return this;
  }

  /**
   * Build the final configuration
   */
  build() {
    return {
      searchableColumns: this.searchableColumns,
      filterableColumns: this.filterableColumns,
    };
  }
}

/**
 * Create a column configuration builder
 */
export function createColumnConfig<TData>(): ColumnConfigBuilder<TData> {
  return new ColumnConfigBuilder<TData>();
}

/**
 * Utility type to extract keys that are of a specific type
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Type-safe helper to get string keys only
 */
export type StringKeys<T> = KeysOfType<T, string>;

/**
 * Type-safe helper to get number keys only
 */
export type NumberKeys<T> = KeysOfType<T, number>;

/**
 * Type-safe helper to get date keys only
 */
export type DateKeys<T> = KeysOfType<T, Date>;

/**
 * Create searchable columns with type constraints
 */
export function createStringSearchableColumns<TData>(
  columns: Array<{
    id: StringKeys<TData>;
    title: string;
  }>
): DataTableSearchableColumn<TData>[] {
  return columns.map(({ id, title }) => ({
    id: id as keyof TData, // Safe assertion since StringKeys ensures it's valid
    title,
  }));
}

/**
 * Validate column exists on type (development helper)
 */
export function validateColumn<TData extends Record<string, any>>(column: keyof TData, sampleData: TData): boolean {
  return column in sampleData;
}

/**
 * Get column type at runtime (development helper)
 */
export function getColumnType<TData extends Record<string, any>>(column: keyof TData, sampleData: TData): string {
  const value = sampleData[column] as unknown;
  if (Array.isArray(value)) return "array";
  if (value instanceof Date) return "date";
  return typeof value;
}

/**
 * Extract searchable columns from column definitions using metadata
 * This enables the new pattern: column.meta.searchable instead of separate arrays
 */
export function extractSearchableColumns<TData>(
  columns: ColumnDef<TData, any>[]
): DataTableSearchableColumn<TData>[] {
  const results: DataTableSearchableColumn<TData>[] = [];

  for (const col of columns) {
    // Check if column has searchable metadata
    const meta = col.meta as { searchable?: boolean | { weight?: number } } | undefined;
    if (meta?.searchable === undefined || meta.searchable === false) {
      continue;
    }

    // Extract accessorKey safely
    const accessorKey = "accessorKey" in col && typeof col.accessorKey === "string" ? col.accessorKey : undefined;
    if (!accessorKey) {
      console.warn(
        "@b87/tanstack-tw-table: Column with searchable meta must have string accessorKey",
        col
      );
      continue;
    }

    // Get title from header
    let title: string;
    if (typeof col.header === "string") {
      title = col.header;
    } else if (col.header && typeof col.header === "function") {
      // For function headers, try to extract a meaningful name
      title = accessorKey.charAt(0).toUpperCase() + accessorKey.slice(1);
    } else {
      title = accessorKey;
    }

    results.push({
      id: accessorKey as keyof TData,
      title,
    });
  }

  return results;
}

/**
 * Extract filterable columns from column definitions using metadata
 * This enables the new pattern: column.meta.filterable instead of separate arrays
 */
export function extractFilterableColumns<TData>(
  columns: ColumnDef<TData, any>[]
): DataTableFilterableColumn<TData>[] {
  const results: DataTableFilterableColumn<TData>[] = [];

  for (const col of columns) {
    // Check if column has filterable metadata
    const meta = col.meta as {
      filterable?: {
        options: Array<{
          label: string;
          value: string;
          icon?: React.ComponentType<{ className?: string }>;
          withCount?: boolean;
        }>;
        type?: "string" | "number" | "date" | "boolean" | "array";
        operators?: FilterOperator[];
        defaultOperator?: FilterOperator;
      };
    } | undefined;

    if (!meta?.filterable || !meta.filterable.options || meta.filterable.options.length === 0) {
      continue;
    }

    // Extract accessorKey safely
    const accessorKey = "accessorKey" in col && typeof col.accessorKey === "string" ? col.accessorKey : undefined;
    if (!accessorKey) {
      console.warn(
        "@b87/tanstack-tw-table: Column with filterable meta must have string accessorKey",
        col
      );
      continue;
    }

    // Get title from header
    let title: string;
    if (typeof col.header === "string") {
      title = col.header;
    } else if (col.header && typeof col.header === "function") {
      // For function headers, try to extract a meaningful name
      title = accessorKey.charAt(0).toUpperCase() + accessorKey.slice(1);
    } else {
      title = accessorKey;
    }

    const filterableConfig = meta.filterable;

    results.push({
      id: accessorKey as keyof TData,
      title,
      type: filterableConfig.type,
      options: filterableConfig.options,
      operators: filterableConfig.operators,
      defaultOperator: filterableConfig.defaultOperator,
    });
  }

  return results;
}
