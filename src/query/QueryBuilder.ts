import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { FilterOperator } from "./FilterOperators";

export interface FilterCondition<TData = any> {
  id: string;
  column: keyof TData;
  operator: FilterOperator;
  value: any;
  secondValue?: any; // For BETWEEN operations
  logicalOperator?: "AND" | "OR";
  group?: string;
}

export interface SortCondition<TData = any> {
  column: keyof TData;
  direction: "asc" | "desc";
}

export interface PaginationOptions {
  page: number;
  size: number;
  cursor?: string; // For cursor-based pagination
}

export interface SearchOptions<TData = any> {
  columns: (keyof TData)[];
  term: string;
  operator?: FilterOperator.CONTAINS | FilterOperator.STARTS_WITH | FilterOperator.EQUALS;
}

export interface QueryBuilderOptions {
  /**
   * Whether to include empty/null values in query parameters
   * @default false
   */
  includeEmptyValues?: boolean;

  /**
   * Prefix for query parameters
   * @default ""
   */
  parameterPrefix?: string;

  /**
   * Whether to encode values for URL safety
   * @default true
   */
  encodeValues?: boolean;
}

/**
 * A fluent query builder for constructing server-side data table queries
 */
export class DataTableQueryBuilder<TData = any> {
  private filters: FilterCondition<TData>[] = [];
  private sorts: SortCondition<TData>[] = [];
  private paginationOptions?: PaginationOptions;
  private searchOptions?: SearchOptions<TData>;
  private options: Required<QueryBuilderOptions>;

  constructor(options: QueryBuilderOptions = {}) {
    this.options = {
      includeEmptyValues: false,
      parameterPrefix: "",
      encodeValues: true,
      ...options,
    };
  }

  /**
   * Add a filter condition
   */
  filter(
    column: keyof TData,
    operator: FilterOperator,
    value: any,
    secondValue?: any,
    logicalOperator: "AND" | "OR" = "AND",
    group?: string
  ): this {
    this.filters.push({
      id: `${String(column)}_${operator}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      column,
      operator,
      value,
      secondValue,
      logicalOperator,
      group,
    });
    return this;
  }

  /**
   * Add multiple filters from TanStack Table ColumnFiltersState
   */
  filtersFromTable(columnFilters: ColumnFiltersState): this {
    columnFilters.forEach(filter => {
      const column = filter.id as keyof TData;

      // Handle date filter values from DataTableDateFilter
      if (filter.value && typeof filter.value === "object" && "operator" in filter.value) {
        const dateFilter = filter.value as {
          operator: FilterOperator;
          date?: Date | string;
          endDate?: Date | string;
        };

        if (dateFilter.date) {
          // Ensure date is a Date object or convert from string
          const startDate = dateFilter.date instanceof Date ? dateFilter.date : new Date(dateFilter.date);

          const endDate = dateFilter.endDate
            ? dateFilter.endDate instanceof Date
              ? dateFilter.endDate
              : new Date(dateFilter.endDate)
            : undefined;

          // Only proceed if we have valid dates
          if (!isNaN(startDate.getTime())) {
            this.filter(
              column,
              dateFilter.operator,
              startDate.toISOString(),
              endDate && !isNaN(endDate.getTime()) ? endDate.toISOString() : undefined
            );
          }
        }
      } else if (Array.isArray(filter.value) && filter.value.length > 0) {
        // Multi-select filters use IN operator
        this.filter(column, FilterOperator.IN, filter.value);
      } else if (filter.value !== undefined && filter.value !== null && filter.value !== "") {
        // Single value filters default to CONTAINS for strings, EQUALS for others
        const operator = typeof filter.value === "string" ? FilterOperator.CONTAINS : FilterOperator.EQUALS;
        this.filter(column, operator, filter.value);
      }
    });
    return this;
  }

  /**
   * Add a sort condition
   */
  sort(column: keyof TData, direction: "asc" | "desc"): this {
    // Remove existing sort for this column
    this.sorts = this.sorts.filter(s => s.column !== column);
    this.sorts.push({ column, direction });
    return this;
  }

  /**
   * Add multiple sorts from TanStack Table SortingState
   */
  sortsFromTable(sorting: SortingState): this {
    this.sorts = []; // Clear existing sorts
    sorting.forEach(sort => {
      this.sort(sort.id as keyof TData, sort.desc ? "desc" : "asc");
    });
    return this;
  }

  /**
   * Set pagination options
   */
  paginate(page: number, size: number, cursor?: string): this {
    this.paginationOptions = { page, size, cursor };
    return this;
  }

  /**
   * Add global search across multiple columns
   */
  search(
    columns: (keyof TData)[],
    term: string,
    operator: FilterOperator.CONTAINS | FilterOperator.STARTS_WITH | FilterOperator.EQUALS = FilterOperator.CONTAINS
  ): this {
    if (term.trim()) {
      this.searchOptions = { columns, term: term.trim(), operator };
    }
    return this;
  }

  /**
   * Clear all filters
   */
  clearFilters(): this {
    this.filters = [];
    return this;
  }

  /**
   * Clear all sorts
   */
  clearSorts(): this {
    this.sorts = [];
    return this;
  }

  /**
   * Clear pagination
   */
  clearPagination(): this {
    this.paginationOptions = undefined;
    return this;
  }

  /**
   * Clear search
   */
  clearSearch(): this {
    this.searchOptions = undefined;
    return this;
  }

  /**
   * Reset all query parameters
   */
  reset(): this {
    return this.clearFilters().clearSorts().clearPagination().clearSearch();
  }

  /**
   * Build URLSearchParams for API requests
   */
  build(): URLSearchParams {
    const params = new URLSearchParams();
    const prefix = this.options.parameterPrefix;

    // Add pagination
    if (this.paginationOptions) {
      params.set(`${prefix}page`, this.paginationOptions.page.toString());
      params.set(`${prefix}limit`, this.paginationOptions.size.toString());
      if (this.paginationOptions.cursor) {
        params.set(`${prefix}cursor`, this.paginationOptions.cursor);
      }
    }

    // Add sorting
    if (this.sorts.length > 0) {
      const primarySort = this.sorts[0];
      params.set(`${prefix}sortBy`, String(primarySort.column));
      params.set(`${prefix}sortOrder`, primarySort.direction);

      // Support multiple sorts if needed
      if (this.sorts.length > 1) {
        const additionalSorts = this.sorts
          .slice(1)
          .map(s => `${String(s.column)}:${s.direction}`)
          .join(",");
        params.set(`${prefix}additionalSorts`, additionalSorts);
      }
    }

    // Add global search
    if (this.searchOptions) {
      params.set(`${prefix}search`, this.searchOptions.term);
      params.set(`${prefix}searchColumns`, this.searchOptions.columns.map(String).join(","));
      if (this.searchOptions.operator && this.searchOptions.operator !== FilterOperator.CONTAINS) {
        params.set(`${prefix}searchOperator`, this.searchOptions.operator);
      }
    }

    // Add filters
    this.filters.forEach(filter => {
      const paramName = `${prefix}${String(filter.column)}`;
      const value = this.encodeValue(filter.value);

      if (this.shouldIncludeValue(filter.value)) {
        switch (filter.operator) {
          case FilterOperator.IN:
          case FilterOperator.NOT_IN:
            // Handle array values
            if (Array.isArray(filter.value)) {
              filter.value.forEach((val: any) => {
                if (this.shouldIncludeValue(val)) {
                  params.append(paramName, this.encodeValue(val));
                }
              });
            }
            // Add operator info for non-default operators
            if (filter.operator !== FilterOperator.IN) {
              params.set(`${paramName}_op`, filter.operator);
            }
            break;

          case FilterOperator.BETWEEN:
          case FilterOperator.NOT_BETWEEN:
          case FilterOperator.DATE_BETWEEN:
            // Handle range values and date ranges
            if (this.shouldIncludeValue(filter.value)) {
              params.set(`${paramName}_min`, this.encodeValue(filter.value));
            }
            if (filter.secondValue && this.shouldIncludeValue(filter.secondValue)) {
              params.set(`${paramName}_max`, this.encodeValue(filter.secondValue));
            }
            params.set(`${paramName}_op`, filter.operator);
            break;

          case FilterOperator.DATE_EQUALS:
          case FilterOperator.DATE_BEFORE:
          case FilterOperator.DATE_AFTER:
            // Handle date-specific operators
            params.set(paramName, value);
            params.set(`${paramName}_op`, filter.operator);
            break;

          case FilterOperator.EQUALS:
          case FilterOperator.CONTAINS:
            // Default operators - no need to specify operator
            params.set(paramName, value);
            break;

          default:
            // All other operators
            params.set(paramName, value);
            params.set(`${paramName}_op`, filter.operator);
            break;
        }

        // Add logical operator if not default AND
        if (filter.logicalOperator && filter.logicalOperator !== "AND") {
          params.set(`${paramName}_logic`, filter.logicalOperator);
        }

        // Add group if specified
        if (filter.group) {
          params.set(`${paramName}_group`, filter.group);
        }
      }
    });

    return params;
  }

  /**
   * Build a structured query object (alternative to URLSearchParams)
   */
  buildQuery(): {
    filters: FilterCondition<TData>[];
    sorts: SortCondition<TData>[];
    pagination?: PaginationOptions;
    search?: SearchOptions<TData>;
  } {
    return {
      filters: [...this.filters],
      sorts: [...this.sorts],
      pagination: this.paginationOptions ? { ...this.paginationOptions } : undefined,
      search: this.searchOptions ? { ...this.searchOptions } : undefined,
    };
  }

  /**
   * Create a query builder from TanStack Table state
   */
  static fromTableState<TData>(
    columnFilters: ColumnFiltersState,
    sorting: SortingState,
    globalFilter?: string,
    searchColumns?: (keyof TData)[],
    pagination?: { pageIndex: number; pageSize: number },
    options?: QueryBuilderOptions
  ): DataTableQueryBuilder<TData> {
    const builder = new DataTableQueryBuilder<TData>(options);

    // Add filters
    builder.filtersFromTable(columnFilters);

    // Add sorting
    builder.sortsFromTable(sorting);

    // Add global search
    if (globalFilter && searchColumns) {
      builder.search(searchColumns, globalFilter);
    }

    // Add pagination
    if (pagination) {
      builder.paginate(pagination.pageIndex + 1, pagination.pageSize); // Convert 0-based to 1-based
    }

    return builder;
  }

  private shouldIncludeValue(value: any): boolean {
    if (this.options.includeEmptyValues) {
      return true;
    }
    return value !== undefined && value !== null && value !== "";
  }

  private encodeValue(value: any): string {
    if (value === null || value === undefined) {
      return "";
    }

    // Handle Date objects by converting to ISO string
    if (value instanceof Date) {
      const isoString = value.toISOString();
      // Don't encode ISO date strings - they're safe and the browser will handle encoding
      return isoString;
    }

    // Handle objects with date property (date filter format)
    if (typeof value === "object" && value.date instanceof Date) {
      const isoString = value.date.toISOString();
      // Don't encode ISO date strings - they're safe and the browser will handle encoding
      return isoString;
    }

    const stringValue = String(value);

    // Check if this looks like an ISO date string and don't encode it
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(value)) {
      // This is already an ISO date string, don't encode it
      return stringValue;
    }

    return this.options.encodeValues ? encodeURIComponent(stringValue) : stringValue;
  }
}

/**
 * Create a new query builder instance
 */
export function createQueryBuilder<TData = any>(options?: QueryBuilderOptions): DataTableQueryBuilder<TData> {
  return new DataTableQueryBuilder<TData>(options);
}

/**
 * Helper function to quickly build query params from table state
 */
export function buildQueryFromTableState<TData>(
  columnFilters: ColumnFiltersState,
  sorting: SortingState,
  globalFilter?: string,
  searchColumns?: (keyof TData)[],
  pagination?: { pageIndex: number; pageSize: number },
  options?: QueryBuilderOptions
): URLSearchParams {
  return DataTableQueryBuilder.fromTableState(
    columnFilters,
    sorting,
    globalFilter,
    searchColumns,
    pagination,
    options
  ).build();
}
