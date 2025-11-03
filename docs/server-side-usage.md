# Server-Side Table Usage

Complete guide to using `@b87/tanstack-tw-table` for server-side data tables with API-driven filtering, sorting, and pagination.

## Table of Contents

- [Overview](#overview)
- [When to Use Server-Side Tables](#when-to-use-server-side-tables)
- [Basic Setup](#basic-setup)
- [API Integration](#api-integration)
- [State Injection Pattern](#state-injection-pattern)
- [Query Building](#query-building)
- [Server Response Format](#server-response-format)
- [Features](#features)
  - [Server-Side Filtering](#server-side-filtering)
  - [Server-Side Sorting](#server-side-sorting)
  - [Server-Side Pagination](#server-side-pagination)
  - [Global Search](#global-search)
- [Statistics and Aggregations](#statistics-and-aggregations)
- [Error Handling](#error-handling)
- [Loading States](#loading-states)
- [Advanced Patterns](#advanced-patterns)
- [TypeScript](#typescript)
- [Best Practices](#best-practices)
- [Complete Example](#complete-example)

## Overview

Server-side tables delegate data operations to your backend API. Instead of loading all data upfront, the table requests only the data needed for the current page, with filters and sorting applied on the server.

**Key Benefits:**

- **Handle large datasets** (millions of rows)
- **Reduce initial load time** (only fetch current page)
- **Lower memory usage** (data stays on server)
- **Real-time data** (fresh data on every request)
- **Server-side search** (complex queries, database indexes)

## When to Use Server-Side Tables

Use server-side tables when:

- **Dataset > 10,000 rows** - Too large to load client-side
- **Data changes frequently** - Need fresh data on each page
- **Complex filtering** - Requires database queries (joins, aggregations)
- **Search across relationships** - e.g., "find users with orders > $1000"
- **Performance matters** - Initial page load must be fast
- **Limited bandwidth** - Mobile users, slow connections

## Basic Setup

### 1. Simple Server-Side Table

```tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import type { ColumnDef, ColumnFiltersState, SortingState, PaginationState } from "@tanstack/react-table";
import { useDataTable, DataTableCore } from "@b87/tanstack-tw-table";
import { extractSearchableColumns, extractFilterableColumns } from "@b87/tanstack-tw-table";

interface User {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
}

export default function ServerSideTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data from server
  const fetchData = useCallback(async (tableState: {
    columnFilters?: ColumnFiltersState;
    sorting?: SortingState;
    globalFilter?: string;
    pagination?: PaginationState;
  }) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users?${buildQueryString(tableState)}`);
      const result = await response.json();

      setUsers(result.data);
      setPageCount(result.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const columns: ColumnDef<User>[] = [
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
    },
  ];

  const { table } = useDataTable({
    data: users,
    columns,
    pageCount,
    tableId: "server-side-table",
    manualPagination: true,  // Server handles pagination
    manualSorting: true,     // Server handles sorting
    manualFiltering: true,   // Server handles filtering
    onSortingChange: async ({ sorting, state, resetPagination }) => {
      await fetchData({
        ...state,
        sorting,
        pagination: resetPagination
          ? { pageIndex: 0, pageSize: state.pagination.pageSize }
          : state.pagination,
      });
    },
    onFilterChange: async ({ columnFilters, globalFilter, state }) => {
      await fetchData({
        ...state,
        columnFilters,
        globalFilter,
        pagination: { pageIndex: 0, pageSize: state.pagination.pageSize },
      });
    },
    onPaginationChange: async ({ pagination, state }) => {
      await fetchData({ ...state, pagination });
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
  }, [fetchData]);

  return (
    <DataTableCore
      table={table}
      columns={columns}
      searchableColumns={extractSearchableColumns(columns)}
      filterableColumns={extractFilterableColumns(columns)}
      isLoading={isLoading}
    />
  );
}

function buildQueryString(state: any): string {
  const params = new URLSearchParams();
  // Build query params from state
  // Implementation shown in Query Building section
  return params.toString();
}
```

**Key Points:**

- Set `manualPagination`, `manualSorting`, `manualFiltering` to `true`
- Implement `onSortingChange`, `onFilterChange`, `onPaginationChange` callbacks
- Fetch data in callbacks and initial useEffect
- Update `pageCount` from server response

## API Integration

### API Endpoint Structure

Your API should accept query parameters and return paginated data:

```typescript
// GET /api/users?page=0&pageSize=10&sort=name:asc&filter=status:active&search=john

interface APIResponse<T> {
  data: T[];
  pagination: {
    page: number;           // Current page (0-indexed or 1-indexed, your choice)
    pageSize?: number;      // Items per page (alternative to `limit`)
    limit?: number;         // Items per page (alternative to `pageSize`)
    total?: number;         // Total items (alternative to `totalItems`)
    totalItems?: number;    // Total items (alternative to `total`)
    totalPages: number;     // Total number of pages (required)
    hasNextPage?: boolean;  // Optional: convenience flag
    hasPreviousPage?: boolean; // Optional: convenience flag
  };
  statistics?: Record<string, any>;
}
```

### Example API Route (Next.js)

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const page = parseInt(searchParams.get("page") || "0");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const sortParam = searchParams.get("sort");
  const filters = searchParams.getAll("filter");
  const search = searchParams.get("search");

  // Build database query
  const query = buildDatabaseQuery({ page, pageSize, sortParam, filters, search });

  // Execute query
  const [data, total] = await Promise.all([
    db.users.findMany(query),
    db.users.count({ where: query.where }),
  ]);

  return NextResponse.json({
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}
```

## State Injection Pattern

The library uses a **state injection pattern** where all callbacks receive the complete table state. This eliminates the need to manually track state or call `table.getState()`.

### Callback Signatures

All server-side callbacks receive:

1. **Primary data** - The value that changed (e.g., `sorting`, `pagination`)
2. **Complete state** - Entire table state snapshot
3. **Additional context** - Helper flags (e.g., `resetPagination`)

### onSortingChange

```typescript
onSortingChange: async ({ sorting, state, resetPagination }) => {
  // sorting: SortingState - New sorting value
  // state: DataTableState - Complete table state
  // resetPagination: boolean - Should reset to page 0?

  await fetchData({
    ...state,
    sorting, // Override with new sorting
    pagination: resetPagination
      ? { pageIndex: 0, pageSize: state.pagination.pageSize }
      : state.pagination,
  });
}
```

**Why `resetPagination`?** When users change sorting, they typically want to see results from the beginning, not stay on page 5.

### onFilterChange

```typescript
onFilterChange: async ({ columnFilters, globalFilter, state }) => {
  // columnFilters: ColumnFiltersState - New filter values
  // globalFilter: string - New search term
  // state: DataTableState - Complete table state

  await fetchData({
    ...state,
    columnFilters,
    globalFilter,
    pagination: { pageIndex: 0, pageSize: state.pagination.pageSize }, // Reset to first page
  });
}
```

**Why reset pagination?** Filter changes typically reduce the result set, so staying on the current page might show no results.

### onPaginationChange

```typescript
onPaginationChange: async ({ pagination, state }) => {
  // pagination: PaginationState - New page/pageSize
  // state: DataTableState - Complete table state

  await fetchData({
    ...state,
    pagination, // Override with new pagination
  });
}
```

### Complete State Object

The `state` parameter contains:

```typescript
interface DataTableState {
  columnFilters: ColumnFiltersState;  // Active column filters
  sorting: SortingState;              // Active sorting
  pagination: PaginationState;        // Current page and page size
  globalFilter: string;               // Search term
}
```

## Query Building

Use the built-in `QueryBuilder` for type-safe query construction.

### Using useServerQuery Hook

```typescript
import { useServerQuery } from "@b87/tanstack-tw-table";

const { buildQuery, processServerResponse, statistics } = useServerQuery<User>({
  searchableColumns: ["name", "email"],
  defaultPageSize: 10,
  enableQueryBuilder: true,
  enableStatistics: true,
});

const fetchData = useCallback(async (tableState) => {
  const queryParams = buildQuery(
    tableState.columnFilters || [],
    tableState.sorting || [],
    tableState.globalFilter,
    tableState.pagination
  );

  const response = await fetch(`/api/users?${queryParams.toString()}`);
  const result = await response.json();

  processServerResponse(result); // Extracts statistics

  setUsers(result.data);
  setPageCount(result.pagination.totalPages);
}, [buildQuery, processServerResponse]);
```

### Manual Query Building

```typescript
import { DataTableQueryBuilder, FilterOperator } from "@b87/tanstack-tw-table";

function buildQueryParams(state: DataTableState): URLSearchParams {
  const builder = DataTableQueryBuilder.create<User>();

  // Add filters
  state.columnFilters.forEach(filter => {
    if (Array.isArray(filter.value)) {
      builder.filter(filter.id as keyof User, FilterOperator.IN, filter.value);
    } else {
      builder.filter(filter.id as keyof User, FilterOperator.EQUALS, filter.value);
    }
  });

  // Add sorting
  state.sorting.forEach(sort => {
    builder.sort(sort.id as keyof User, sort.desc ? "desc" : "asc");
  });

  // Add pagination
  builder.paginate(state.pagination.pageIndex, state.pagination.pageSize);

  // Add global search
  if (state.globalFilter) {
    builder.search(state.globalFilter, ["name", "email"]);
  }

  return builder.build();
}
```

### Filter Operators

The library supports 20+ filter operators:

```typescript
import { FilterOperator } from "@b87/tanstack-tw-table";

// Equality
FilterOperator.EQUALS           // field = value
FilterOperator.NOT_EQUALS       // field != value
FilterOperator.IN               // field IN (values)
FilterOperator.NOT_IN           // field NOT IN (values)

// Comparison
FilterOperator.GREATER_THAN     // field > value
FilterOperator.GREATER_THAN_OR_EQUAL  // field >= value
FilterOperator.LESS_THAN        // field < value
FilterOperator.LESS_THAN_OR_EQUAL     // field <= value

// String
FilterOperator.CONTAINS         // field LIKE %value%
FilterOperator.STARTS_WITH      // field LIKE value%
FilterOperator.ENDS_WITH        // field LIKE %value
FilterOperator.NOT_CONTAINS     // field NOT LIKE %value%

// Date
FilterOperator.DATE_EQUALS      // DATE(field) = value
FilterOperator.DATE_BEFORE      // DATE(field) < value
FilterOperator.DATE_AFTER       // DATE(field) > value
FilterOperator.DATE_BETWEEN     // DATE(field) BETWEEN start AND end

// Null checks
FilterOperator.IS_NULL          // field IS NULL
FilterOperator.IS_NOT_NULL      // field IS NOT NULL

// Boolean
FilterOperator.IS_TRUE          // field = true
FilterOperator.IS_FALSE         // field = false
```

## Server Response Format

Your API should return data in this format:

```typescript
interface ServerResponse<T> {
  data: T[];
  pagination: {
    page: number;           // Current page (0-indexed or 1-indexed, your choice)
    pageSize?: number;      // Items per page (alternative to `limit`)
    limit?: number;         // Items per page (alternative to `pageSize`)
    total?: number;         // Total items (alternative to `totalItems`)
    totalItems?: number;    // Total items (alternative to `total`)
    totalPages: number;     // Total number of pages (required)
    hasNextPage?: boolean;  // Optional: convenience flag
    hasPreviousPage?: boolean; // Optional: convenience flag
  };
  statistics?: {
    // Optional aggregate data
    total: number;
    filtered: number;
    // Custom statistics
    [key: string]: any;
  };
}
```

### Example Response

```json
{
  "data": [
    { "id": "1", "name": "John Doe", "email": "john@example.com", "status": "active" },
    { "id": "2", "name": "Jane Smith", "email": "jane@example.com", "status": "active" }
  ],
  "pagination": {
    "page": 0,
    "pageSize": 10,
    "total": 156,
    "totalPages": 16
  },
  "statistics": {
    "total": 156,
    "filtered": 42,
    "activeUsers": 38,
    "inactiveUsers": 4
  }
}
```

## Features

### Server-Side Filtering

Filters are applied on the server using database queries.

```typescript
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "status",
    header: "Status",
    meta: {
      filterable: {
        options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ],
        defaultOperator: FilterOperator.IN, // Optional
      },
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
  },
];
```

**API receives:**

```http
GET /api/users?filter=status:active&filter=role:admin
```

### Server-Side Sorting

Sorting is applied via database ORDER BY clauses.

```typescript
onSortingChange: async ({ sorting, state, resetPagination }) => {
  // sorting = [{ id: "name", desc: false }]

  await fetchData({
    ...state,
    sorting,
    pagination: resetPagination
      ? { pageIndex: 0, pageSize: state.pagination.pageSize }
      : state.pagination,
  });
}
```

**API receives:**

```http
GET /api/users?sort=name:asc
```

### Server-Side Pagination

Only request the current page from the server.

```typescript
onPaginationChange: async ({ pagination, state }) => {
  // pagination = { pageIndex: 2, pageSize: 20 }

  await fetchData({
    ...state,
    pagination,
  });
}
```

**API receives:**

```http
GET /api/users?page=2&pageSize=20
```

### Global Search

Search across multiple columns on the server.

```typescript
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    meta: { searchable: true }, // Include in search
  },
  {
    accessorKey: "email",
    header: "Email",
    meta: { searchable: true }, // Include in search
  },
];

onFilterChange: async ({ columnFilters, globalFilter, state }) => {
  // globalFilter = "john"

  await fetchData({
    ...state,
    columnFilters,
    globalFilter,
    pagination: { pageIndex: 0, pageSize: state.pagination.pageSize },
  });
}
```

**API receives:**

```http
GET /api/users?search=john
```

**Server implementation:**

```sql
WHERE (name LIKE '%john%' OR email LIKE '%john%')
```

## Statistics and Aggregations

Display aggregate data alongside your table.

### Client-Side

```typescript
import { useServerQuery } from "@b87/tanstack-tw-table";

const { buildQuery, processServerResponse, statistics } = useServerQuery<User>({
  searchableColumns: ["name", "email"],
  enableStatistics: true,
});

const fetchData = useCallback(async (tableState) => {
  const queryParams = buildQuery(/* ... */);
  const response = await fetch(`/api/users?${queryParams.toString()}`);
  const result = await response.json();

  processServerResponse(result); // Extracts statistics

  setUsers(result.data);
  setPageCount(result.pagination.totalPages);
}, [buildQuery, processServerResponse]);

// Display statistics
{statistics && (
  <div className="grid grid-cols-4 gap-4">
    <StatCard label="Total Users" value={statistics.total} />
    <StatCard label="Active Users" value={statistics.activeUsers} />
    <StatCard label="Inactive Users" value={statistics.inactiveUsers} />
    <StatCard label="Filtered Results" value={statistics.filtered} />
  </div>
)}
```

### Server-Side

```typescript
// app/api/users/route.ts
export async function GET(request: NextRequest) {
  // ... build query ...

  const [data, total, activeCount, inactiveCount] = await Promise.all([
    db.users.findMany(query),
    db.users.count({ where: query.where }),
    db.users.count({ where: { ...query.where, status: "active" } }),
    db.users.count({ where: { ...query.where, status: "inactive" } }),
  ]);

  return NextResponse.json({
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
    statistics: {
      total,
      filtered: total,
      activeUsers: activeCount,
      inactiveUsers: inactiveCount,
    },
  });
}
```

## Error Handling

Handle errors gracefully with loading states and error messages.

### Error State

```typescript
const [error, setError] = useState<string | null>(null);

const fetchData = useCallback(async (tableState) => {
  setIsLoading(true);
  setError(null);

  try {
    const response = await fetch(`/api/users?${buildQuery(tableState)}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    const result = await response.json();
    setUsers(result.data);
    setPageCount(result.pagination.totalPages);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An error occurred";
    setError(errorMessage);
    console.error("Failed to fetch users:", err);
  } finally {
    setIsLoading(false);
  }
}, []);
```

### Display Errors

```typescript
<DataTableCore
  table={table}
  columns={columns}
  searchableColumns={extractSearchableColumns(columns)}
  filterableColumns={extractFilterableColumns(columns)}
  isLoading={isLoading}
  sortError={error}
  onClearSortError={() => setError(null)}
/>
```

### Retry Logic

```typescript
const fetchDataWithRetry = useCallback(async (tableState, retries = 3) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      await fetchData(tableState);
      return;
    } catch (err) {
      if (attempt === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
}, [fetchData]);
```

## Loading States

Provide feedback during data fetches.

### Basic Loading

```typescript
const [isLoading, setIsLoading] = useState(false);

<DataTableCore
  table={table}
  columns={columns}
  isLoading={isLoading}
  // ... other props
/>
```

### Skeleton Loading

```typescript
{isLoading ? (
  <TableSkeleton rows={10} />
) : (
  <DataTableCore table={table} columns={columns} />
)}
```

### Optimistic Updates

```typescript
const [optimisticUsers, setOptimisticUsers] = useState<User[]>([]);

const fetchData = useCallback(async (tableState) => {
  // Show previous data while loading
  setIsLoading(true);

  try {
    const response = await fetch(/* ... */);
    const result = await response.json();

    setUsers(result.data);
    setOptimisticUsers(result.data);
  } finally {
    setIsLoading(false);
  }
}, []);

<DataTableCore
  table={table}
  data={isLoading ? optimisticUsers : users}
  // ...
/>
```

## Advanced Patterns

### Debounced Search

Prevent excessive API calls during typing:

```typescript
import { useMemo } from "react";
import debounce from "lodash/debounce";

const debouncedFetch = useMemo(
  () => debounce((tableState) => fetchData(tableState), 500),
  [fetchData]
);

onFilterChange: async ({ columnFilters, globalFilter, state }) => {
  debouncedFetch({
    ...state,
    columnFilters,
    globalFilter,
    pagination: { pageIndex: 0, pageSize: state.pagination.pageSize },
  });
}
```

### Caching with React Query

```typescript
import { useQuery, useQueryClient } from "@tanstack/react-query";

function useUsers(tableState: DataTableState) {
  return useQuery({
    queryKey: ["users", tableState],
    queryFn: () => fetchUsers(tableState),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

const { data, isLoading, error } = useUsers(tableState);
```

### Infinite Scroll

```typescript
import { useInfiniteQuery } from "@tanstack/react-query";

const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ["users"],
  queryFn: ({ pageParam = 0 }) => fetchUsers({ page: pageParam }),
  getNextPageParam: (lastPage) => lastPage.nextPage,
});
```

### URL Sync (Disabled for Server-Side)

Server-side tables should **disable** URL sync since they manage query params through the API:

```typescript
const { table } = useDataTable({
  data: users,
  columns,
  pageCount,
  tableId: "server-side-table",
  router,
  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,
  urlSync: false, // Disable for server-side tables
  // ...
});
```

**Why?** Server-side tables already encode state in API query parameters. URL sync would create duplicate/conflicting parameters.

## TypeScript

### Type-Safe Query Building

```typescript
import { DataTableQueryBuilder, FilterOperator } from "@b87/tanstack-tw-table";

interface User {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  createdAt: Date;
}

const query = DataTableQueryBuilder.create<User>()
  .filter("status", FilterOperator.EQUALS, "active") //  Type-safe
  .filter("name", FilterOperator.CONTAINS, "john")    //  Type-safe
  // .filter("invalid", FilterOperator.EQUALS, "x")   // L TypeScript error
  .sort("createdAt", "desc")                          //  Type-safe
  .paginate(0, 10)
  .build();
```

### Typed API Responses

```typescript
interface APIResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  statistics?: Record<string, number>;
}

async function fetchUsers(state: DataTableState): Promise<APIResponse<User>> {
  const response = await fetch(`/api/users?${buildQuery(state)}`);
  return response.json();
}
```

### Generic Fetch Function

```typescript
async function fetchTableData<T>(
  endpoint: string,
  state: DataTableState
): Promise<APIResponse<T>> {
  const queryParams = buildQueryParams(state);
  const response = await fetch(`${endpoint}?${queryParams.toString()}`);

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

// Usage
const result = await fetchTableData<User>("/api/users", tableState);
```

## Best Practices

### 1. Always Set Manual Modes

```typescript
manualPagination: true,  // Required for server-side
manualSorting: true,     // Required for server-side
manualFiltering: true,   // Required for server-side
```

Without these, the table will try to filter/sort/paginate client-side.

### 2. Reset Pagination on Filter/Sort Changes

```typescript
onFilterChange: async ({ columnFilters, globalFilter, state }) => {
  await fetchData({
    ...state,
    columnFilters,
    globalFilter,
    pagination: { pageIndex: 0, pageSize: state.pagination.pageSize }, // Reset!
  });
}
```

Users expect to see results from page 1 when they change filters.

### 3. Use State Injection Pattern

```typescript
//  Good - Use injected state
onSortingChange: async ({ sorting, state }) => {
  await fetchData({ ...state, sorting });
}

// L Bad - Manually access state
onSortingChange: async ({ sorting }) => {
  const state = table.getState(); // Don't do this
  await fetchData({ sorting, ...state });
}
```

The state injection pattern prevents stale closures and race conditions.

### 4. Handle Loading and Errors

```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

try {
  setIsLoading(true);
  setError(null);
  // ... fetch data
} catch (err) {
  setError(err.message);
} finally {
  setIsLoading(false);
}
```

Always provide user feedback during async operations.

### 5. Debounce Search Input

```typescript
const debouncedFetch = useMemo(
  () => debounce(fetchData, 500),
  [fetchData]
);
```

Prevent hammering your API while users type.

### 6. Use QueryBuilder for Complex Queries

```typescript
import { DataTableQueryBuilder, FilterOperator } from "@b87/tanstack-tw-table";

const query = DataTableQueryBuilder.create<User>()
  .filter("status", FilterOperator.IN, ["active", "pending"])
  .filter("createdAt", FilterOperator.DATE_AFTER, "2024-01-01")
  .sort("name", "asc")
  .paginate(0, 50)
  .build();
```

More maintainable than manual string concatenation.

### 7. Return Correct Page Count

```typescript
const totalPages = Math.ceil(total / pageSize);
setPageCount(totalPages); // Must match server calculation
```

Incorrect page count causes pagination bugs.

### 8. Disable URL Sync

```typescript
urlSync: false, // Always disable for server-side tables
```

Server-side tables manage state via API params, not URL.

## Complete Example

Putting it all together:

```typescript
"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import type { ColumnDef, ColumnFiltersState, SortingState, PaginationState } from "@tanstack/react-table";
import { DataTableCore, useDataTable, useServerQuery } from "@b87/tanstack-tw-table";
import { extractSearchableColumns, extractFilterableColumns } from "@b87/tanstack-tw-table";
import { createNextRouter } from "@b87/tanstack-tw-table/routing";

interface User {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  role: string;
  createdAt: string;
}

export default function ServerSideTable() {
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
        cell: ({ row }) => (
          <span className="capitalize">{row.original.role}</span>
        ),
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

  const { table } = useDataTable({
    data: users,
    columns,
    pageCount,
    tableId: "server-side-example",
    router,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    urlSync: false, // Disable for server-side tables
    onSortingChange: async ({ sorting, state, resetPagination }) => {
      await fetchData({
        ...state,
        sorting,
        pagination: resetPagination
          ? { pageIndex: 0, pageSize: state.pagination.pageSize }
          : state.pagination,
      });
    },
    onFilterChange: async ({ columnFilters, globalFilter, state }) => {
      await fetchData({
        ...state,
        columnFilters,
        globalFilter,
        pagination: { pageIndex: 0, pageSize: state.pagination.pageSize },
      });
    },
    onPaginationChange: async ({ pagination, state }) => {
      await fetchData({ ...state, pagination });
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
    <div className="space-y-4">
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

      {/* Data Table */}
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
```

## Troubleshooting

### Data Doesn't Update

**Problem:** Table doesn't refetch when filters/sorting change.

**Solution:** Ensure callbacks are async and actually call fetchData:

```typescript
onFilterChange: async ({ columnFilters, globalFilter, state }) => {
  await fetchData({ ...state, columnFilters, globalFilter }); // Must call fetchData!
}
```

### Pagination is Wrong

**Problem:** Page count doesn't match data.

**Solution:** Ensure `pageCount` matches server calculation:

```typescript
const totalPages = Math.ceil(total / pageSize);
setPageCount(totalPages); // Must match!
```

### Filters Don't Work

**Problem:** Applying filters doesn't filter data.

**Solution:** Ensure `manualFiltering: true` and implement `onFilterChange`:

```typescript
manualFiltering: true, // Required!
onFilterChange: async ({ columnFilters, globalFilter, state }) => {
  await fetchData({ ...state, columnFilters, globalFilter });
}
```

### Infinite Re-renders

**Problem:** Component continuously refetches.

**Solution:** Wrap fetchData in `useCallback`:

```typescript
const fetchData = useCallback(async (tableState) => {
  // ... fetch logic
}, [buildQuery, processServerResponse]); // Stable dependencies
```

## Next Steps

- [Client-Side Usage](./client-side-usage.md) - Learn about client-side tables
- [Setup Guide](../SETUP.md) - Installation and configuration
- [API Reference](../README.md) - Complete API documentation
- [Query Builder](../src/query/QueryBuilder.ts) - Advanced query building
