# Client-Side Table Usage

Complete guide to using `@b87/tanstack-tw-table` for client-side data tables with filtering, sorting, pagination, and URL synchronization.

## Table of Contents

- [Overview](#overview)
- [Basic Setup](#basic-setup)
- [Column Configuration](#column-configuration)
- [Features](#features)
  - [Filtering](#filtering)
  - [Sorting](#sorting)
  - [Pagination](#pagination)
  - [Global Search](#global-search)
  - [Column Visibility](#column-visibility)
  - [Row Selection](#row-selection)
- [URL Synchronization](#url-synchronization)
- [View Management](#view-management)
- [Advanced Usage](#advanced-usage)
- [TypeScript](#typescript)
- [Best Practices](#best-practices)

## Overview

Client-side tables are ideal for:

- **Small to medium datasets** (up to ~10,000 rows)
- **Static data** that doesn't require server requests
- **Fast interactions** with instant filtering and sorting
- **Offline-first applications**

All data operations (filtering, sorting, pagination) happen in the browser using TanStack Table's built-in algorithms.

## Basic Setup

### 1. Simple Example

The simplest way to use a client-side table:

```tsx
"use client";

import { DataTable } from "@b87/tanstack-tw-table";
import type { ColumnDef } from "@tanstack/react-table";

interface User {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
];

export function UsersTable() {
  const users: User[] = [
    { id: "1", name: "John Doe", email: "john@example.com", status: "active" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", status: "inactive" },
  ];

  return (
    <DataTable
      data={users}
      columns={columns}
      pageCount={1}
      tableId="users-table"
      server={{
        mode: "client", // IMPORTANT: Enable client-side operations
      }}
    />
  );
}
```

**Key Point:** You **must** set `server.mode: "client"` to enable client-side filtering, sorting, and pagination. Without this, the table expects server-side handlers.

## Column Configuration

Columns are defined using TanStack Table's `ColumnDef` type with additional metadata for enhanced features.

### Basic Column

```tsx
{
  accessorKey: "name",
  header: "Name",
}
```

### Searchable Column

Make columns searchable via the global search input:

```tsx
{
  accessorKey: "name",
  header: "Name",
  meta: {
    searchable: true, // Enables global search on this column
  },
}
```

### Filterable Column

Add dropdown filters for specific values:

```tsx
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
}
```

### Custom Cell Rendering

```tsx
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
}
```

### Date Column

```tsx
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
}
```

### Sortable Column

All columns are sortable by default. To disable sorting:

```tsx
{
  accessorKey: "actions",
  header: "Actions",
  enableSorting: false, // Disable sorting for this column
}
```

## Features

### Filtering

#### Faceted Filters (Dropdown)

Faceted filters provide dropdown menus with predefined options:

```tsx
const columns: ColumnDef<User>[] = [
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

**Features:**

- Multi-select capability
- Shows count of matching items
- Clears individual filters
- Auto-extracts unique values if no options provided

#### Accessing Filter State

```tsx
import { useDataTable } from "@b87/tanstack-tw-table";

const { table } = useDataTable({
  data: users,
  columns,
  pageCount: 1,
  tableId: "users-table",
  manualPagination: false,
  manualSorting: false,
  manualFiltering: false,
});

// Get current filters
const filters = table.getState().columnFilters;
console.log(filters); // [{ id: "status", value: ["active"] }]
```

### Sorting

Click column headers to sort. Click again to reverse, click a third time to clear.

```tsx
// All columns are sortable by default
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name", // Click to sort
  },
];

// Disable multi-column sorting (enabled by default in useDataTable)
const table = useReactTable({
  // ...
  enableMultiSort: false, // Already set in useDataTable
  enableSortingRemoval: true, // Already set in useDataTable
});
```

**Behavior:**

- Single-column sorting (multi-sort is disabled)
- Three-state sorting: ascending → descending → unsorted
- Visual indicators (arrows) show sort direction

### Pagination

Client-side pagination splits data into pages in the browser.

```tsx
<DataTable
  data={users}
  columns={columns}
  pageCount={Math.ceil(users.length / 10)} // Calculate based on data length
  tableId="users-table"
  server={{
    mode: "client",
  }}
  defaultView={{
    pagination: {
      pageIndex: 0,
      pageSize: 10, // Default page size
    },
  }}
/>
```

**Features:**

- Page size selector (10, 20, 30, 40, 50)
- Page navigation (first, previous, next, last)
- Current page indicator
- Total pages display

#### Custom Default Page Size

```tsx
defaultView={{
  pagination: {
    pageIndex: 0,
    pageSize: 25, // Show 25 items per page
  },
}}
```

### Global Search

Global search filters across all columns marked as `searchable`.

```tsx
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    meta: { searchable: true }, // Include in global search
  },
  {
    accessorKey: "email",
    header: "Email",
    meta: { searchable: true }, // Include in global search
  },
  {
    accessorKey: "id",
    header: "ID",
    // Not searchable - omit from global search
  },
];
```

The search input appears in the toolbar and filters data in real-time.

### Column Visibility

Users can show/hide columns using the column visibility dropdown.

```tsx
<DataTable
  data={users}
  columns={columns}
  pageCount={1}
  tableId="users-table"
  server={{ mode: "client" }}
  defaultView={{
    columnVisibility: {
      id: false, // Hide ID column by default
      email: true, // Show email column
    },
  }}
/>
```

**Features:**

- Toggle individual columns
- "Reset" button to show all columns
- Persists with View Management

### Row Selection

Enable row selection with checkboxes:

```tsx
<DataTable
  data={users}
  columns={columns}
  pageCount={1}
  tableId="users-table"
  server={{ mode: "client" }}
  features={{
    rowSelection: true, // Enable row selection
  }}
/>
```

#### Accessing Selected Rows

```tsx
import { useDataTable } from "@b87/tanstack-tw-table";

const { table } = useDataTable({
  data: users,
  columns,
  pageCount: 1,
  tableId: "users-table",
  manualPagination: false,
  manualSorting: false,
  manualFiltering: false,
  enableRowSelection: true,
});

// Get selected row IDs
const selectedRows = table.getState().rowSelection;
console.log(selectedRows); // { "0": true, "2": true }

// Get selected row data
const selectedData = table.getSelectedRowModel().rows.map(row => row.original);
console.log(selectedData); // [{ id: "1", name: "John Doe", ... }, ...]
```

## URL Synchronization

URL synchronization enables deep linking, shareable URLs, and browser history navigation.

### Enabling URL Sync

```tsx
"use client";

import { DataTable } from "@b87/tanstack-tw-table";
import { createNextRouter } from "@b87/tanstack-tw-table/routing";

export function UsersTable() {
  const router = createNextRouter(); // Create router instance

  return (
    <DataTable
      data={users}
      columns={columns}
      pageCount={1}
      tableId="users-table"
      router={router} // Pass router
      features={{
        urlSync: true, // Enable URL synchronization
      }}
      server={{
        mode: "client",
      }}
    />
  );
}
```

### URL Format

When enabled, table state is encoded in the URL:

```url
http://localhost:3000/?f=status:active&f=role:admin&s=name:asc&p=1&ps=20&q=john
```

**Parameters:**

- `f` - Filters (multiple allowed): `columnId:value` or `columnId:value1,value2`
- `s` - Sorting: `columnId:asc` or `columnId:desc`
- `p` - Page index (0-based)
- `ps` - Page size
- `q` - Global search term

### Granular Control

Enable URL sync for specific features only:

```tsx
features={{
  urlSync: {
    filters: true,    // Sync column filters
    sorting: true,    // Sync sorting state
    pagination: false, // Don't sync pagination
    search: true,     // Sync global search
  },
}}
```

### Benefits

- **Deep Linking:** Share URLs with specific filters applied
- **Browser History:** Use back/forward buttons to navigate table states
- **Bookmarks:** Save and return to specific table views
- **Persistence:** State survives page reloads

### Router Adapters

#### Next.js (App Router)

```tsx
import { createNextRouter } from "@b87/tanstack-tw-table/routing";

const router = createNextRouter();
```

#### React Router

```tsx
import { createReactRouterAdapter } from "@b87/tanstack-tw-table/routing";

const router = createReactRouterAdapter();
```

#### No Router (Memory Only)

```tsx
// Simply omit the router prop - state stays in memory only
<DataTable
  data={users}
  columns={columns}
  tableId="users-table"
  // No router prop
/>
```

## View Management

Save, load, and delete custom table views (combinations of filters, sorting, visibility, pagination).

### Enabling View Management

```tsx
<DataTable
  data={users}
  columns={columns}
  pageCount={1}
  tableId="users-table"
  router={router}
  features={{
    viewManagement: true, // Enable view management
    urlSync: true,
  }}
  server={{
    mode: "client",
  }}
/>
```

### View Management Features

- **Save Views:** Create named snapshots of table state
- **Load Views:** Restore saved configurations
- **Delete Views:** Remove unwanted views
- **Persistent Storage:** Saves to localStorage by default
- **URL Integration:** View ID is synced to URL (`?view=users-table-123`)

### Custom Storage Provider

Replace localStorage with a custom provider:

```tsx
import { optimizedStorageProvider } from "@b87/tanstack-tw-table";

<DataTable
  data={users}
  columns={columns}
  tableId="users-table"
  storageProvider={optimizedStorageProvider} // Uses compression
  features={{
    viewManagement: true,
  }}
/>
```

### Programmatic View Management

```tsx
import { useDataTable } from "@b87/tanstack-tw-table";

const { table, actions } = useDataTable({
  data: users,
  columns,
  pageCount: 1,
  tableId: "users-table",
});

// Save current state as a view
await actions.saveView({
  name: "Active Users",
  columnFilters: [{ id: "status", value: "active" }],
  sorting: [{ id: "name", desc: false }],
  columnVisibility: {},
  pagination: { pageIndex: 0, pageSize: 10 },
  globalFilter: "",
});

// Load a view
actions.loadView(savedView);

// Delete a view
await actions.deleteView(viewId);

// Get current state
const currentState = actions.getCurrentViewState();
```

## Advanced Usage

### Using `useDataTable` Hook Directly

For full control over table state and lifecycle:

```tsx
"use client";

import { useDataTable, DataTableCore } from "@b87/tanstack-tw-table";
import { extractSearchableColumns, extractFilterableColumns } from "@b87/tanstack-tw-table";

export function AdvancedUsersTable() {
  const { table, savedViews, currentViewId, actions } = useDataTable({
    data: users,
    columns,
    pageCount: 1,
    tableId: "advanced-users",
    manualPagination: false,  // Enable client-side pagination
    manualSorting: false,     // Enable client-side sorting
    manualFiltering: false,   // Enable client-side filtering
    enableRowSelection: true,
    defaultView: {
      pagination: { pageIndex: 0, pageSize: 25 },
      sorting: [{ id: "name", desc: false }],
    },
  });

  return (
    <div>
      <button onClick={() => console.log(table.getSelectedRowModel().rows)}>
        Log Selected Rows
      </button>

      <DataTableCore
        table={table}
        columns={columns}
        searchableColumns={extractSearchableColumns(columns)}
        filterableColumns={extractFilterableColumns(columns)}
      />
    </div>
  );
}
```

### Custom Toolbar

```tsx
import { DataTableToolbar } from "@b87/tanstack-tw-table";

<DataTableToolbar
  table={table}
  searchableColumns={extractSearchableColumns(columns)}
  filterableColumns={extractFilterableColumns(columns)}
/>
```

### Custom Pagination

```tsx
import { DataTablePagination } from "@b87/tanstack-tw-table";

<DataTablePagination table={table} />
```

### Auto-Extracting Column Metadata

**Recommended:** Columns are automatically detected from `column.meta` configuration. You don't need to manually extract or pass them to `DataTable`:

```tsx
// ✅ RECOMMENDED: Auto-detection via column.meta (DataTable handles this automatically)
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    meta: { searchable: true }, // Auto-detected!
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: {
      filterable: {
        options: [{ label: "Active", value: "active" }],
      },
    }, // Auto-detected!
  },
];

// Simply use DataTable - it auto-detects from column.meta
<DataTable data={users} columns={columns} tableId="users-table" />
```

**Advanced Usage:** Only extract manually if you're using `DataTableCore` directly:

```tsx
import { extractSearchableColumns, extractFilterableColumns } from "@b87/tanstack-tw-table";

const searchableColumns = extractSearchableColumns(columns);
const filterableColumns = extractFilterableColumns(columns);

<DataTableCore
  table={table}
  columns={columns}
  searchableColumns={searchableColumns}
  filterableColumns={filterableColumns}
/>
```

### Default View State

Set initial table state:

```tsx
<DataTable
  data={users}
  columns={columns}
  tableId="users-table"
  defaultView={{
    columnFilters: [{ id: "status", value: "active" }], // Pre-filter active users
    sorting: [{ id: "createdAt", desc: true }], // Sort by newest first
    columnVisibility: { id: false }, // Hide ID column
    pagination: { pageIndex: 0, pageSize: 50 }, // Show 50 per page
    globalFilter: "", // No initial search
  }}
  server={{
    mode: "client",
  }}
/>
```

## TypeScript

### Type-Safe Columns

```tsx
import type { ColumnDef } from "@tanstack/react-table";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "moderator";
  createdAt: Date;
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name", // TypeScript ensures "name" exists on User
    header: "Name",
  },
  {
    accessorKey: "email", // TypeScript validates this too
    header: "Email",
  },
];
```

### Generic Table Component

```tsx
interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
}

export function GenericTable<TData>({ data, columns }: DataTableProps<TData>) {
  return (
    <DataTable
      data={data}
      columns={columns}
      pageCount={1}
      tableId="generic-table"
      server={{ mode: "client" }}
    />
  );
}

// Usage
<GenericTable data={users} columns={userColumns} />
```

### Accessing Row Data with Types

```tsx
cell: ({ row }) => {
  const user = row.original; // Type: User
  return <span>{user.name}</span>; // Fully typed
}
```

## Best Practices

### 1. Always Set `mode: "client"`

```tsx
server={{
  mode: "client", // Required for client-side operations
}}
```

Without this, filters and sorting won't work as expected.

### 2. Use Unique `tableId`

```tsx
tableId="users-table" // Unique ID for view management and storage
```

Each table should have a unique ID to avoid conflicts in localStorage.

### 3. Mark Searchable Columns

```tsx
meta: {
  searchable: true, // Enable global search on this column
}
```

Only mark text columns as searchable (name, email, description, etc.).

### 4. Provide Filter Options

```tsx
meta: {
  filterable: {
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  },
}
```

Explicitly define options for better UX and performance.

### 5. Memoize Columns

```tsx
import { useMemo } from "react";

const columns = useMemo<ColumnDef<User>[]>(
  () => [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
  ],
  []
);
```

Prevents unnecessary re-renders.

### 6. Memoize Data (if derived)

```tsx
const data = useMemo(() => {
  return rawData.map(item => ({
    ...item,
    fullName: `${item.firstName} ${item.lastName}`,
  }));
}, [rawData]);
```

Only if you're transforming data. For static data, memoization isn't necessary.

### 7. Use URL Sync for Shareable States

```tsx
features={{
  urlSync: true, // Enable when users need to share filtered views
}}
```

Great for dashboards, reports, and collaborative filtering.

### 8. Combine with View Management

```tsx
features={{
  viewManagement: true, // Let users save custom views
  urlSync: true,        // And share them via URL
}}
```

Provides the best user experience for complex filtering scenarios.

## Complete Example

Putting it all together:

```tsx
"use client";

import { useMemo } from "react";
import { DataTable } from "@b87/tanstack-tw-table";
import { createNextRouter } from "@b87/tanstack-tw-table/routing";
import type { ColumnDef } from "@tanstack/react-table";

interface User {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  role: "admin" | "user" | "moderator";
  createdAt: string;
}

export function UsersTable() {
  const router = createNextRouter();

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

  const data: User[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      status: "active",
      role: "admin",
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      status: "active",
      role: "user",
      createdAt: "2024-02-20",
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob@example.com",
      status: "inactive",
      role: "moderator",
      createdAt: "2024-03-10",
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      pageCount={1}
      tableId="users-table"
      router={router}
      features={{
        viewManagement: true,
        rowSelection: true,
        urlSync: true,
      }}
      server={{
        mode: "client",
      }}
      defaultView={{
        pagination: { pageIndex: 0, pageSize: 10 },
        sorting: [{ id: "createdAt", desc: true }],
      }}
    />
  );
}
```

## Troubleshooting

### Filters Don't Work

**Problem:** Filter dropdowns appear but clicking them doesn't filter the data.

**Solution:** Ensure you've set `server.mode: "client"`:

```tsx
server={{
  mode: "client", // Required!
}}
```

### Search Doesn't Find Anything

**Problem:** Global search doesn't return results.

**Solution:** Mark columns as searchable:

```tsx
{
  accessorKey: "name",
  header: "Name",
  meta: { searchable: true }, // Add this!
}
```

### URL Not Updating

**Problem:** URL sync is enabled but URL doesn't change.

**Solution:** Ensure you're passing a router instance:

```tsx
const router = createNextRouter(); // Create router

<DataTable
  router={router} // Pass it here
  features={{ urlSync: true }}
/>
```

### State Resets on Reload

**Problem:** Table state is lost when page reloads.

**Solution:** Enable URL sync or use view management:

```tsx
features={{
  urlSync: true, // State persists via URL
  // OR
  viewManagement: true, // Save state to localStorage
}}
```

## Next Steps

- [Server-Side Usage](./server-side-usage.md) - Learn about server-side tables
- [Setup Guide](../SETUP.md) - Installation and configuration
- [API Reference](../README.md) - Complete API documentation
