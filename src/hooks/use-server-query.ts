"use client";

import { useCallback, useMemo, useState } from "react";
import type { ColumnFiltersState, SortingState, PaginationState } from "@tanstack/react-table";
import { DataTableQueryBuilder, buildQueryFromTableState } from "../query/QueryBuilder";
import type { UseServerQueryOptions, ServerQueryParams, DataTableStatistics, ServerQueryResponse } from "../types";

/**
 * Hook for building server-side queries from table state
 * Provides a standardized way to convert TanStack Table state to API query parameters
 */
export function useServerQuery<TData = any>({
  searchableColumns = [],
  defaultPageSize = 50,
  enableQueryBuilder = true,
  queryBuilderOptions = {},
  enableStatistics = false,
}: UseServerQueryOptions<TData> = {}) {
  // Simple statistics state
  const [statistics, setStatistics] = useState<DataTableStatistics | null>(null);

  /**
   * Build query parameters from table state using QueryBuilder
   */
  const buildQuery = useCallback(
    (
      columnFilters: ColumnFiltersState,
      sorting: SortingState,
      globalFilter?: string,
      pagination?: PaginationState
    ): URLSearchParams => {
      if (!enableQueryBuilder) {
        // Fallback to simple query building
        return buildSimpleQuery(columnFilters, sorting, globalFilter, pagination);
      }

      return buildQueryFromTableState(
        columnFilters,
        sorting,
        globalFilter,
        searchableColumns,
        pagination,
        queryBuilderOptions
      );
    },
    [enableQueryBuilder, searchableColumns, queryBuilderOptions]
  );

  /**
   * Create a QueryBuilder instance from table state
   */
  const createQueryBuilder = useCallback(
    (
      columnFilters: ColumnFiltersState,
      sorting: SortingState,
      globalFilter?: string,
      pagination?: PaginationState
    ): DataTableQueryBuilder<TData> => {
      return DataTableQueryBuilder.fromTableState(
        columnFilters,
        sorting,
        globalFilter,
        searchableColumns,
        pagination,
        queryBuilderOptions
      );
    },
    [searchableColumns, queryBuilderOptions]
  );

  /**
   * Generate server query parameters for onQueryChange callback
   */
  const createServerQueryParams = useCallback(
    (
      columnFilters: ColumnFiltersState,
      sorting: SortingState,
      globalFilter?: string,
      pagination?: PaginationState,
      resetPagination = false
    ): ServerQueryParams<TData> => {
      const queryBuilder = createQueryBuilder(columnFilters, sorting, globalFilter, pagination);

      return {
        queryBuilder,
        resetPagination,
      };
    },
    [createQueryBuilder]
  );

  /**
   * Memoized default pagination
   */
  const defaultPagination = useMemo(
    () => ({
      pageIndex: 0,
      pageSize: defaultPageSize,
    }),
    [defaultPageSize]
  );

  /**
   * Process server response and extract statistics
   */
  const processServerResponse = useCallback(
    (response: ServerQueryResponse<TData>): ServerQueryResponse<TData> => {
      if (enableStatistics) {
        if (response.statistics) {
          setStatistics(response.statistics);
        }
      }
      return response;
    },
    [enableStatistics]
  );

  return {
    buildQuery,
    createQueryBuilder,
    createServerQueryParams,
    defaultPagination,
    // Statistics methods
    processServerResponse,
    statistics,
  };
}

/**
 * Simple query builder fallback for backward compatibility
 */
function buildSimpleQuery(
  columnFilters: ColumnFiltersState,
  sorting: SortingState,
  globalFilter?: string,
  pagination?: PaginationState
): URLSearchParams {
  const params = new URLSearchParams();

  // Add pagination
  if (pagination) {
    params.set("page", (pagination.pageIndex + 1).toString());
    params.set("limit", pagination.pageSize.toString());
  }

  // Add sorting
  if (sorting.length > 0) {
    const primarySort = sorting[0];
    params.set("sortBy", primarySort.id);
    params.set("sortOrder", primarySort.desc ? "desc" : "asc");
  }

  // Add global search
  if (globalFilter) {
    params.set("search", globalFilter);
  }

  // Add column filters
  columnFilters.forEach(filter => {
    if (filter.value !== undefined && filter.value !== null && filter.value !== "") {
      if (Array.isArray(filter.value) && filter.value.length > 0) {
        // Multi-select filters
        filter.value.forEach((val: any) => {
          params.append(filter.id, val.toString());
        });
      } else {
        // Single value filters
        params.set(filter.id, filter.value.toString());
      }
    }
  });

  return params;
}

/**
 * Helper hook for server-side data fetching with QueryBuilder integration
 */
export function useServerDataFetch<TData = any>(
  fetchFn: (queryParams: URLSearchParams) => Promise<ServerQueryResponse<TData>>,
  options: UseServerQueryOptions<TData> = {}
) {
  const { buildQuery, processServerResponse, statistics } = useServerQuery<TData>(options);

  /**
   * Fetch data using the provided fetch function and table state
   */
  const fetchData = useCallback(
    async (
      columnFilters: ColumnFiltersState,
      sorting: SortingState,
      globalFilter?: string,
      pagination?: PaginationState
    ) => {
      const queryParams = buildQuery(columnFilters, sorting, globalFilter, pagination);
      const response = await fetchFn(queryParams);
      return processServerResponse(response);
    },
    [buildQuery, fetchFn, processServerResponse]
  );

  return {
    fetchData,
    buildQuery,
    statistics,
  };
}

/**
 * Type-safe query parameter extractor for API routes
 */
export function extractQueryParams(searchParams: URLSearchParams): {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  searchColumns?: string[];
  searchOperator?: string;
  additionalSorts?: Array<{ column: string; direction: "asc" | "desc" }>;
  filters: Record<string, any>;
} {
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const sortBy = searchParams.get("sortBy") || undefined;
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || undefined;
  const search = searchParams.get("search") || undefined;
  const searchColumns = searchParams.get("searchColumns")?.split(",") || undefined;
  const searchOperator = searchParams.get("searchOperator") || undefined;

  // Parse additional sorts
  const additionalSortsParam = searchParams.get("additionalSorts");
  const additionalSorts = additionalSortsParam
    ? additionalSortsParam.split(",").map(sort => {
        const [column, direction] = sort.split(":");
        return { column, direction: direction as "asc" | "desc" };
      })
    : undefined;

  // Extract filters (any parameter that's not a reserved keyword)
  const reservedParams = new Set([
    "page",
    "limit",
    "sortBy",
    "sortOrder",
    "search",
    "searchColumns",
    "searchOperator",
    "additionalSorts",
    "cursor",
  ]);

  const filters: Record<string, any> = {};
  for (const [key, value] of searchParams.entries()) {
    if (!reservedParams.has(key) && !key.endsWith("_op") && !key.endsWith("_logic") && !key.endsWith("_group")) {
      // Handle array values (multiple parameters with same key)
      const existingValue = filters[key];
      if (existingValue) {
        if (Array.isArray(existingValue)) {
          existingValue.push(value);
        } else {
          filters[key] = [existingValue, value];
        }
      } else {
        filters[key] = value;
      }
    }
  }

  return {
    page,
    limit,
    sortBy,
    sortOrder,
    search,
    searchColumns,
    searchOperator,
    additionalSorts,
    filters,
  };
}
