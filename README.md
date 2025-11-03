# @b87/tanstack-tw-table

A batteries-included data table component built with TanStack React Table, featuring server-side operations, filtering, sorting, pagination, view management, and URL synchronization.

## Features

- 🔍 **Advanced Filtering** - 20+ filter operators with server-side support
- 📊 **Server-Side Operations** - Sorting, filtering, and pagination with QueryBuilder
- 💾 **View Management** - Save and load custom table configurations
- 🔗 **URL Synchronization** - Deep linking support for shareable table states
- 🔧 **Type-Safe** - Full TypeScript support with auto-detected column metadata
- 🎨 **shadcn/ui Ready** - Built with Tailwind CSS and shadcn/ui components
- 🔌 **Framework Agnostic** - Works with Next.js, React Router, or standalone

## Quick Start

### Installation

```bash
npm install @b87/tanstack-tw-table @tanstack/react-table @tanstack/react-virtual
```

Import CSS in your root stylesheet:

```css
@import "@b87/tanstack-tw-table/theme-v3.css"; /* Tailwind v3 */
/* or */
@import "@b87/tanstack-tw-table/theme.css"; /* Tailwind v4 */
```

See the [Setup Guide](./docs/setup.md) for complete configuration.

### Client-Side Example

```tsx
import { DataTable } from "@b87/tanstack-tw-table";
import { createNextRouter } from "@b87/tanstack-tw-table/routing";
import type { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    meta: { searchable: true }, // Auto-detected
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

export function UsersTable() {
  const router = createNextRouter();

  return (
    <DataTable
      data={users}
      columns={columns}
      pageCount={1}
      tableId="users-table"
      router={router}
      features={{
        viewManagement: true,
        urlSync: true,
      }}
      server={{
        mode: "client", // Client-side operations
      }}
    />
  );
}
```

### Server-Side Example

```tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import type { ColumnDef, ColumnFiltersState, SortingState, PaginationState } from "@tanstack/react-table";
import { DataTableCore, useDataTable, useServerQuery } from "@b87/tanstack-tw-table";
import { extractSearchableColumns, extractFilterableColumns } from "@b87/tanstack-tw-table";

export function ServerSideTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [pageCount, setPageCount] = useState(0);

  const { buildQuery, processServerResponse } = useServerQuery<User>({
    searchableColumns: ["name", "email"],
  });

  const fetchData = useCallback(async (tableState: {
    columnFilters?: ColumnFiltersState;
    sorting?: SortingState;
    globalFilter?: string;
    pagination?: PaginationState;
  }) => {
    const queryParams = buildQuery(
      tableState.columnFilters || [],
      tableState.sorting || [],
      tableState.globalFilter,
      tableState.pagination
    );

    const response = await fetch(`/api/users?${queryParams.toString()}`);
    const result = await response.json();

    processServerResponse(result);
    setUsers(result.data);
    setPageCount(result.pagination?.totalPages || 1);
  }, [buildQuery, processServerResponse]);

  const { table } = useDataTable({
    data: users,
    columns,
    pageCount,
    tableId: "users-server",
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    urlSync: false,
    onSortingChange: async ({ sorting, state, resetPagination }) => {
      await fetchData({
        ...state,
        sorting,
        pagination: resetPagination ? { pageIndex: 0, pageSize: state.pagination.pageSize } : state.pagination,
      });
    },
    onFilterChange: async ({ columnFilters, globalFilter, state }) => {
      await fetchData({ ...state, columnFilters, globalFilter });
    },
    onPaginationChange: async ({ pagination, state }) => {
      await fetchData({ ...state, pagination });
    },
  });

  useEffect(() => {
    fetchData({ columnFilters: [], sorting: [], globalFilter: "", pagination: { pageIndex: 0, pageSize: 10 } });
  }, []);

  return (
    <DataTableCore
      table={table}
      columns={columns}
      searchableColumns={extractSearchableColumns(columns)}
      filterableColumns={extractFilterableColumns(columns)}
    />
  );
}
```

## Documentation

- **[Setup Guide](./docs/setup.md)** - Installation, CSS setup, and configuration
- **[Client-Side Usage](./docs/client-side-usage.md)** - Complete guide for client-side tables
- **[Server-Side Usage](./docs/server-side-usage.md)** - Complete guide for server-side operations

## Key Concepts

- **Column Metadata Auto-Detection** - Define `searchable` and `filterable` in `column.meta`
- **State Injection Pattern** - Server callbacks receive complete table state
- **QueryBuilder** - Type-safe query building with 20+ filter operators
- **URL Sync** - Optional deep linking with router adapters (Next.js, React Router)
- **View Management** - Save/load table configurations with localStorage

## Contributing

See the [Contributing Guide](./CONTRIBUTING.md) (if available) or check the source code for examples.

## License

MIT License
