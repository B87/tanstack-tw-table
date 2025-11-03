"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { ColumnDef, ColumnFiltersState, SortingState, PaginationState } from "@tanstack/react-table";
import { DataTableCore, extractSearchableColumns, extractFilterableColumns } from "@b87/tanstack-tw-table";
import { useDataTable, useServerQuery } from "@b87/tanstack-tw-table";
import { createNextRouter } from "@b87/tanstack-tw-table/routing";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  role: string;
  createdAt: string;
}

export default function ServerSidePage() {
  const router = createNextRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Server query configuration
  const { buildQuery, processServerResponse, statistics } = useServerQuery<User>({
    searchableColumns: ["name", "email"],
    defaultPageSize: 10,
    enableQueryBuilder: true,
    enableStatistics: true,
  });

  // Fetch data from server
  const fetchData = useCallback(
    async (tableState: {
      columnFilters?: ColumnFiltersState;
      sorting?: SortingState;
      globalFilter?: string;
      pagination?: PaginationState;
    }) => {
      setIsLoading(true);
      setError(null);

      try {
        const queryParams = buildQuery(
          tableState.columnFilters || [],
          tableState.sorting || [],
          tableState.globalFilter,
          tableState.pagination
        );

        const response = await fetch(`/api/users?${queryParams.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const result = await response.json();

        // Process response and extract statistics
        processServerResponse(result);

        setUsers(result.data);
        setPageCount(result.pagination?.totalPages || 1);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        console.error("Failed to fetch users:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [buildQuery, processServerResponse]
  );

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        meta: { searchable: true },
      },
      {
        accessorKey: "email",
        header: "Email",
        meta: { searchable: true },
      },
      {
        accessorKey: "status",
        header: "Status",
        meta: {
          filterable: {
            options: [
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ],
          },
        },
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          );
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        meta: {
          filterable: {
            options: [
              { label: "Admin", value: "admin" },
              { label: "User", value: "user" },
              { label: "Moderator", value: "moderator" },
            ],
          },
        },
        cell: ({ row }) => {
          const role = row.original.role;
          return <span className="capitalize">{role}</span>;
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        },
      },
    ],
    []
  );

  // Use the advanced DataTableCore with useDataTable hook for full control
  const { table } = useDataTable({
    data: users,
    columns,
    pageCount,
    tableId: "server-side-example",
    router,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    // NOTE: URL sync is disabled for server-side tables as they manage their own query params
    urlSync: false,
    onSortingChange: async ({ sorting, state, resetPagination }) => {
      // state includes all current table state
      await fetchData({
        ...state,
        sorting, // Override with new sorting
        pagination: resetPagination ? { pageIndex: 0, pageSize: state.pagination.pageSize } : state.pagination,
      });
    },
    onFilterChange: async ({ columnFilters, globalFilter, state }) => {
      // state includes all current table state
      await fetchData({
        ...state,
        columnFilters, // Override with new filters
        globalFilter,  // Override with new search term
        pagination: { pageIndex: 0, pageSize: state.pagination.pageSize }, // Reset to first page
      });
    },
    onPaginationChange: async ({ pagination, state }) => {
      // state includes all current table state
      await fetchData({
        ...state,
        pagination, // Override with new pagination
      });
    },
  });

  // Initial data fetch
  useEffect(() => {
    fetchData({
      columnFilters: [],
      sorting: [],
      globalFilter: "",
      pagination: { pageIndex: 0, pageSize: 10 },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold">Server-Side Table Example</h1>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            ← View Client-Side Example
          </Link>
        </div>
        <p className="text-gray-600 mb-4">
          This example demonstrates server-side pagination, filtering, and sorting with real-time statistics.
        </p>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border p-4">
              <div className="text-sm font-medium text-gray-600">Total Users</div>
              <div className="text-2xl font-bold">{statistics.total}</div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="text-sm font-medium text-gray-600">Active Users</div>
              <div className="text-2xl font-bold text-green-600">
                {statistics.activeUsers || 0}
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="text-sm font-medium text-gray-600">Inactive Users</div>
              <div className="text-2xl font-bold text-gray-600">
                {statistics.inactiveUsers || 0}
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="text-sm font-medium text-gray-600">Filtered Results</div>
              <div className="text-2xl font-bold text-blue-600">{statistics.filtered}</div>
            </div>
          </div>
        )}
      </div>

      <DataTableCore
        table={table}
        columns={columns}
        searchableColumns={extractSearchableColumns(columns)}
        filterableColumns={extractFilterableColumns(columns)}
        isLoading={isLoading}
        sortError={error}
        onClearSortError={() => setError(null)}
      />
    </div>
  );
}
