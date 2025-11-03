# Setup Guide

Complete installation and configuration guide for `@b87/tanstack-tw-table`.

## Table of Contents

- [Installation](#installation)
- [CSS Setup](#css-setup)
- [Tailwind Configuration](#tailwind-configuration)
- [Framework-Specific Setup](#framework-specific-setup)
- [URL Synchronization (Deep Linking)](#url-synchronization-deep-linking)
- [Peer Dependencies](#peer-dependencies)
- [Troubleshooting](#troubleshooting)

## Installation

Install the package and its peer dependencies:

```bash
# npm
npm install @b87/tanstack-tw-table @tanstack/react-table @tanstack/react-virtual

# pnpm
pnpm add @b87/tanstack-tw-table @tanstack/react-table @tanstack/react-virtual

# yarn
yarn add @b87/tanstack-tw-table @tanstack/react-table @tanstack/react-virtual
```

### Optional Dependencies

For framework-specific routing support:

```bash
# Next.js (App Router)
npm install next

# React Router
npm install react-router-dom
```

## CSS Setup

### Step 1: Import the Theme CSS

Choose between Tailwind v3 or v4 format based on your project:

#### Option A: Tailwind v3 (Recommended for most projects)

In your root CSS file (e.g., `app/globals.css` or `src/index.css`):

```css
@import "@b87/tanstack-tw-table/theme-v3.css";

@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### Option B: Tailwind v4

```css
@import "@b87/tanstack-tw-table/theme.css";
```

**Note:** The import must come **before** the `@tailwind` directives to ensure CSS variables are defined first.

## Tailwind Configuration

### Step 1: Update Content Paths

Add the library's components to your Tailwind content configuration:

```js
// tailwind.config.js (CommonJS)
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    // Add this line to include the library's components
    './node_modules/@b87/tanstack-tw-table/dist/**/*.{js,mjs}',
  ],
  // ... rest of config
}
```

Or for ESM projects (package.json with `"type": "module"`):

```js
// tailwind.config.js (ESM)
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    // Add this line to include the library's components
    './node_modules/@b87/tanstack-tw-table/dist/**/*.{js,mjs}',
  ],
  // ... rest of config
}
```

### Step 2: Extend Theme with CSS Variables

Add the shadcn/ui color tokens to your theme configuration:

```js
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@b87/tanstack-tw-table/dist/**/*.{js,mjs}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
```

## Framework-Specific Setup

### Next.js (App Router)

1. **Install Next.js** (if not already installed):
   ```bash
   npm install next
   ```

2. **Import CSS in your root layout** (`app/layout.tsx`):
   ```tsx
   import "./globals.css"; // This file imports the theme CSS
   ```

3. **Use the Next.js router adapter**:
   ```tsx
   "use client";

   import { DataTable } from "@b87/tanstack-tw-table";
   import { createNextRouter } from "@b87/tanstack-tw-table/routing";

   export function UsersTable() {
     const router = createNextRouter();

     return (
       <DataTable
         data={users}
         columns={columns}
         tableId="users-table"
         router={router}
         features={{
           viewManagement: true,
           rowSelection: true,
         }}
       />
     );
   }
   ```

### React Router

1. **Install React Router** (if not already installed):
   ```bash
   npm install react-router-dom
   ```

2. **Use the React Router adapter**:
   ```tsx
   import { DataTable } from "@b87/tanstack-tw-table";
   import { createReactRouterAdapter } from "@b87/tanstack-tw-table/routing";

   export function UsersTable() {
     const router = createReactRouterAdapter();

     return (
       <DataTable
         data={users}
         columns={columns}
         tableId="users-table"
         router={router}
       />
     );
   }
   ```

### Client-Side Only (No Router)

If you don't need URL synchronization, simply omit the `router` prop:

```tsx
import { DataTable } from "@b87/tanstack-tw-table";

export function UsersTable() {
  return (
    <DataTable
      data={users}
      columns={columns}
      tableId="users-table"
      // No router - state stays in memory only
    />
  );
}
```

## URL Synchronization (Deep Linking)

URL synchronization allows table state (filters, sorting, pagination, search) to be reflected in the browser URL, enabling:
- **Deep linking:** Share URLs with specific filters applied
- **Browser history:** Use back/forward buttons to navigate table states
- **Bookmarks:** Save and return to specific table views
- **Persistence:** State survives page reloads

### Enabling URL Sync

Add `urlSync: true` to the `features` configuration:

```tsx
"use client";

import { DataTable } from "@b87/tanstack-tw-table";
import { createNextRouter } from "@b87/tanstack-tw-table/routing";

export function UsersTable() {
  const router = createNextRouter();

  return (
    <DataTable
      data={users}
      columns={columns}
      tableId="users-table"
      router={router}
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

When enabled, the table state is encoded in the URL using short query parameters:

```
?f=status:active&f=role:admin&s=name:asc&p=2&ps=20&q=john
```

Parameter breakdown:
- `f` - Filters (can have multiple): `columnId:value`
- `s` - Sorting (can have multiple): `columnId:asc` or `columnId:desc`
- `p` - Page index (0-based)
- `ps` - Page size
- `q` - Global search/filter term

### Granular Control

You can selectively enable URL sync for specific features:

```tsx
<DataTable
  data={users}
  columns={columns}
  tableId="users-table"
  router={router}
  features={{
    urlSync: {
      filters: true,    // Sync column filters
      sorting: true,    // Sync sorting state
      pagination: false, // Don't sync pagination
      search: true,     // Sync global search
    },
  }}
/>
```

### Behavior Notes

1. **Debouncing:** URL updates are debounced by 300ms to prevent excessive browser history entries during rapid state changes.

2. **Saved Views Priority:** When a saved view is loaded (via View Manager), URL sync is automatically disabled to prevent conflicts. The view ID is synced instead.

3. **Initial State:** On page load, the table reads state from the URL and initializes accordingly. This allows shared URLs to restore the exact table state.

4. **Server-Side Tables:** URL sync should be **disabled** for server-side tables (manual mode) as they typically manage their own query parameters through the API:

   ```tsx
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
   });
   ```

### Advanced Usage

You can also manually serialize/deserialize table state using the exported utilities:

```tsx
import { serializeTableState, deserializeTableState } from "@b87/tanstack-tw-table";

// Serialize current table state
const searchParams = serializeTableState({
  filters: [{ id: "status", value: "active" }],
  sorting: [{ id: "name", desc: false }],
  pagination: { pageIndex: 0, pageSize: 10 },
  globalFilter: "john",
});

// Deserialize from URL
const tableState = deserializeTableState(searchParams);
```

## Peer Dependencies

The package requires these peer dependencies:

### Required

- `react` >= 18.0.0
- `react-dom` >= 18.0.0
- `@tanstack/react-table` >= 8.10.0
- `@tanstack/react-virtual` >= 3.0.0
- `tailwindcss` >= 3.4.0 or >= 4.0.0

### Optional

- `next` >= 13.4.0 (for Next.js router adapter)
- `react-router-dom` >= 6.0.0 (for React Router adapter)

## Troubleshooting

### CSS Not Loading

**Problem:** Styles are not applied, table looks unstyled.

**Solution:**
1. Verify the CSS import is **before** `@tailwind` directives:
   ```css
   @import "@b87/tanstack-tw-table/theme-v3.css";

   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

2. Check that Tailwind content includes the library:
   ```js
   content: [
     './node_modules/@b87/tanstack-tw-table/dist/**/*.{js,mjs}',
   ]
   ```

3. Ensure theme colors are extended in `tailwind.config.js`

### `border-border` Class Error

**Problem:** Error: "The `border-border` class does not exist"

**Solution:** The CSS variables must be defined before Tailwind processes the theme CSS. Ensure:
1. Theme CSS is imported first
2. Theme extends colors with CSS variables (see Tailwind Configuration above)

### Next.js Router Error

**Problem:** "next/navigation is not available"

**Solution:**
1. Ensure `next` is installed: `npm install next`
2. Use the router in a client component (`"use client"` directive)
3. Rebuild the package if you're in development: `pnpm build`

### TypeScript Errors

**Problem:** TypeScript can't find types for the package

**Solution:**
1. Ensure TypeScript is configured correctly in your project
2. The package exports TypeScript declarations automatically
3. Restart your TypeScript server (VS Code: Cmd+Shift+P → "Restart TypeScript Server")

### Module Format Errors

**Problem:** "Specified module format (EcmaScript Modules) is not matching"

**Solution:** If your `package.json` has `"type": "module"`, use ESM syntax in `tailwind.config.js`:
```js
// Use this
export default { /* config */ }

// Not this
module.exports = { /* config */ }
```

### Filters Don't Work

**Problem:** Filter dropdowns appear but clicking them doesn't filter the data

**Solution:** You need to enable client-side mode for static data:
```tsx
<DataTable
  data={users}
  columns={columns}
  pageCount={1}
  tableId="users-table"
  server={{
    mode: "client", // Add this!
  }}
/>
```

**Why:** By default, the table expects server-side filtering. Set `mode: "client"` to enable client-side operations.

## Minimal Example

Here's a complete minimal setup:

### 1. Install Dependencies

```bash
npm install @b87/tanstack-tw-table @tanstack/react-table @tanstack/react-virtual
```

### 2. Create `globals.css`

```css
@import "@b87/tanstack-tw-table/theme-v3.css";

@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 3. Configure `tailwind.config.js`

```js
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './node_modules/@b87/tanstack-tw-table/dist/**/*.{js,mjs}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
}
```

### 4. Use the Component

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

export function UsersTable() {
  const users = [
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
        mode: "client", // Enable client-side filtering/sorting/pagination
      }}
    />
  );
}
```

## Important: Client-Side vs Server-Side Mode

**By default, the DataTable uses server-side mode (`mode: "manual"`)**, which means:

- ❌ Client-side filtering is **disabled**
- ❌ Client-side sorting is **disabled**
- ❌ Client-side pagination is **disabled**
- ✅ You must provide server-side handlers

### Client-Side Mode (For Static Data)

If you have static data and want filtering/sorting to work in the browser:

```tsx
<DataTable
  data={users}
  columns={columns}
  pageCount={1}
  tableId="users-table"
  server={{
    mode: "client", // ⚡ IMPORTANT: Enable client-side operations
  }}
/>
```

### Server-Side Mode (For Large Datasets)

For server-side operations with large datasets:

```tsx
<DataTable
  data={users}
  columns={columns}
  pageCount={totalPages}
  tableId="users-table"
  server={{
    mode: "manual", // Default - requires server handlers
    onSortingChange: async ({ sorting, currentFilters }) => {
      // Fetch sorted data from server
      await fetchUsers({ sorting, filters: currentFilters });
    },
    isLoading: isLoading,
  }}
/>
```

**Common Mistake:** Forgetting to set `mode: "client"` for static data will make filters appear but not work!

## Next Steps

- See [README.md](./README.md) for usage examples and API reference
- Check [examples/nextjs-app](./examples/nextjs-app) for a complete Next.js implementation
- Read about [Phase 0 improvements](./TODO.md#phase-0-api-improvements--framework-independence-) for new API patterns

## Support

If you encounter any issues:

1. Check this setup guide for common solutions
2. Review the [examples](./examples/) directory
3. Open an issue at [GitHub Issues](https://github.com/b87/tanstack-tw-table/issues)
