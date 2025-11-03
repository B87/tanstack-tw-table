# Next.js Example App

This is a complete Next.js example application demonstrating both **client-side** and **server-side** usage of `@b87/tanstack-tw-table`.

## Features Demonstrated

### Client-Side Example (`/`)
- ✅ Client-side filtering, sorting, and pagination
- ✅ URL synchronization with Next.js router
- ✅ Column metadata auto-detection
- ✅ View management (save/load custom views)
- ✅ Row selection

### Server-Side Example (`/server-side`)
- ✅ Server-side pagination
- ✅ Server-side filtering
- ✅ Server-side sorting
- ✅ Real-time statistics display
- ✅ Loading states
- ✅ Error handling
- ✅ Advanced `DataTableCore` usage with `useDataTable` hook

## Running the Example

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev

# Open in browser
open http://localhost:3000
```

## Project Structure

```
app/
├── api/
│   └── users/
│       └── route.ts          # Server-side API endpoint
├── server-side/
│   └── page.tsx              # Server-side table example
├── page.tsx                  # Client-side table example
├── layout.tsx                # Root layout
└── globals.css               # Global styles (imports theme CSS)

tailwind.config.js            # Tailwind configuration with library setup
```

## Key Implementation Details

### Client-Side Mode

The client-side example uses the simple `DataTable` wrapper with `server={{ mode: "client" }}`:

```tsx
<DataTable
  data={sampleData}
  columns={columns}
  pageCount={1}
  tableId="nextjs-example"
  router={router}
  features={{
    viewManagement: true,
    rowSelection: true,
  }}
  server={{
    mode: "client", // Enable client-side operations
  }}
/>
```

### Server-Side Mode

The server-side example uses `DataTableCore` with the `useDataTable` hook for full control:

```tsx
const { table } = useDataTable({
  data: users,
  columns,
  pageCount,
  tableId: "server-side-example",
  router,
  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,
  onSortingChange: async ({ sorting, currentFilters, resetPagination }) => {
    await fetchData({ sorting, columnFilters: currentFilters, pagination });
  },
  onFilterChange: async (filters, globalFilter) => {
    await fetchData({ columnFilters: filters, sorting, globalFilter, pagination });
  },
});

<DataTableCore
  table={table}
  columns={columns}
  isLoading={isLoading}
  sortError={error}
  onClearSortError={() => setError(null)}
/>
```

### API Route

The server-side example includes a mock API route at `/api/users` that demonstrates:

- Query parameter parsing
- Filtering by multiple columns
- Sorting
- Pagination
- Statistics calculation
- Simulated network delay (300ms)

### CSS Setup

The global CSS file imports the library's theme:

```css
@import "@b87/tanstack-tw-table/theme-v3.css";

@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Tailwind Configuration

The `tailwind.config.js` is configured to:

1. Use ESM format (`export default`)
2. Include library components in content paths
3. Extend theme with CSS variables

```js
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    // Include the library's components
    './node_modules/@b87/tanstack-tw-table/dist/**/*.{js,mjs}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        // ... all other CSS variable colors
      },
    },
  },
}
```

## Column Metadata Pattern

Both examples use the new Phase 0.2 API with column metadata:

```tsx
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    meta: { searchable: true }, // Auto-detected for search
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: {
      filterable: { // Auto-detected for filtering
        options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ],
      },
    },
  },
];
```

## Learn More

- Main package: `@b87/tanstack-tw-table`
- [Setup Guide](../../SETUP.md)
- [Package README](../../README.md)
- [Phase 0 Improvements](../../TODO.md)

## Tips

- **Client-side mode** is best for small datasets (< 1000 rows)
- **Server-side mode** is required for large datasets
- Always set `server={{ mode: "client" }}` for static data
- Use `DataTableCore` + `useDataTable` for advanced use cases
- Use simple `DataTable` wrapper for quick setups
