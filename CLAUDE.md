# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **@b87/tanstack-tw-table**, an npm package providing a batteries-included TanStack Table component with shadcn/ui integration, server-side support, view management, i18n, and framework-agnostic routing. Currently ~90% complete and preparing for npm publication.

**Package Status:** Pre-release (v0.1.0) - API improvements complete, testing and documentation in progress.

## Development Commands

### Build & Development
```bash
pnpm build              # Build package (tsup + copy CSS)
pnpm dev                # Watch mode for development
pnpm clean              # Remove dist directory
pnpm typecheck          # Type-check without building
```

### Testing
```bash
pnpm test               # Run all tests (vitest)
pnpm test:watch         # Run tests in watch mode
pnpm test:ui            # Open vitest UI
```

### Package Verification
```bash
pnpm pack               # Create tarball for testing
pnpm prepublishOnly     # Runs automatically before publish (builds package)
```

### Examples & Demos
```bash
pnpm dev:demos          # Run demo site
pnpm build:demos        # Build demo site
pnpm dev:all            # Run all packages in parallel
pnpm build:all          # Build library + all examples
```

## Architecture Overview

### Entry Points Hierarchy

The package has a clear hierarchy of entry points designed for different use cases:

1. **`DataTable`** (Simple) - `src/components/data-table-wrapper.tsx`
   - Batteries-included component with built-in `useDataTable` hook
   - Best for: Most common use cases, quick setup
   - Handles table state internally

2. **`DataTableCore`** (Advanced) - `src/components/data-table.tsx`
   - Requires external table instance from `useDataTable` hook
   - Best for: Advanced customization, shared state, complex integrations
   - Full control over table state and lifecycle

3. **`useDataTable` hook** (Headless)
   - Best for: Complete custom implementations, maximum flexibility
   - Provides table instance and view management actions

### Core Architectural Patterns

#### 1. UI Adapter Pattern (`src/ui/`)

The package uses dependency injection for UI components to allow consumers to customize or replace the entire UI:

- **Interface:** `src/ui/types.ts` - Defines `DataTableUI` type with all required component interfaces
- **Default Implementation:** `src/ui/shadcn/` - Vendored shadcn/ui components (no external setup required)
- **Context:** `src/components/DataTableContext.tsx` - Provides UI components via React context
- **Usage:** Components use `useDataTableUI()` instead of direct imports

This allows consumers to pass custom UI via the `ui` prop without modifying package code.

#### 2. Router Abstraction (`src/routing/`)

Framework-agnostic routing system for URL synchronization:

- **Interface:** `src/routing/types.ts` - `DataTableRouter` interface
- **Providers:**
  - `src/routing/providers/next.ts` - Next.js adapter (optional peer dependency)
  - `src/routing/providers/react-router.ts` - React Router adapter (optional peer dependency)
  - `src/routing/providers/client-side.ts` - No-router fallback
- **Integration:** `useDataTable` hook accepts optional `router` parameter
- **Export:** Available via `@b87/tanstack-tw-table/routing` subpath

#### 3. QueryBuilder System (`src/query/`)

Fluent API for server-side query construction:

- **`QueryBuilder.ts`** - Type-safe query builder with method chaining
- **`FilterOperators.ts`** - 20+ filter operators (EQUALS, CONTAINS, DATE_BETWEEN, etc.)
- **Integration:** Works seamlessly with TanStack Table's `ColumnFiltersState`
- **Server-side:** Generates URLSearchParams for API routes

Example:
```typescript
const query = DataTableQueryBuilder.create<User>()
  .filter('status', FilterOperator.IN, ['active', 'pending'])
  .filter('createdAt', FilterOperator.DATE_AFTER, '2024-01-01')
  .sort('name', 'asc')
  .paginate(1, 50)
  .build(); // Returns URLSearchParams
```

#### 4. Column Metadata Auto-Detection (`src/utils/column-helpers.ts`)

**New Pattern (Phase 0.2):** Columns can define searchable/filterable metadata directly:

```typescript
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    meta: {
      searchable: true,
      filterable: {
        options: [{ label: "Active", value: "active" }],
        defaultOperator: FilterOperator.IN
      }
    }
  }
];
```

Helper functions extract this metadata automatically:
- `extractSearchableColumns(columns)` - Returns `DataTableSearchableColumn[]`
- `extractFilterableColumns(columns)` - Returns `DataTableFilterableColumn[]`

#### 5. View Management (`src/storage/`)

Persistent table state (filters, sorting, visibility, pagination):

- **Interface:** `DataTableViewStorage` in `types.ts`
- **Providers:**
  - `local-storage-provider.ts` - Browser localStorage (current)
  - `optimized-storage-provider.ts` - Enhanced localStorage with compression
  - PostgreSQL provider (roadmap)
- **Component:** `ViewManager` for save/load/delete operations
- **Scope:** Per-table via `tableId` prop

#### 6. i18n System (`src/i18n/`)

Pluggable translation system:

- **Interface:** `DataTableI18nAdapter` in `i18n/types.ts`
- **Adapters:**
  - `adapters/en.ts` - English (default)
  - `adapters/es.ts` - Spanish
  - `adapters/next-intl.ts` - Next.js next-intl integration
  - `adapters/react-i18next.ts` - react-i18next integration
- **Usage:** Pass `i18n` prop to DataTable components

### Directory Structure

```
src/
├── components/         # React components
│   ├── data-table-wrapper.tsx    # Simple entry point (exported as DataTable)
│   ├── data-table.tsx             # Advanced entry point (exported as DataTableCore)
│   ├── data-table-toolbar.tsx
│   ├── data-table-pagination.tsx
│   ├── data-table-faceted-filter.tsx
│   ├── data-table-date-filter.tsx
│   ├── view-manager.tsx
│   └── DataTableContext.tsx       # UI adapter context
├── hooks/              # Custom hooks
│   ├── use-data-table.ts          # Core table state management
│   ├── use-server-query.ts        # Server-side query helpers
│   └── use-data-table-error-handler.ts
├── query/              # Server-side query building
│   ├── QueryBuilder.ts            # Fluent query builder
│   └── FilterOperators.ts         # Filter operator definitions
├── routing/            # Framework-agnostic routing
│   ├── types.ts
│   └── providers/
│       ├── next.ts
│       ├── react-router.ts
│       └── client-side.ts
├── storage/            # View persistence
│   ├── local-storage-provider.ts
│   └── optimized-storage-provider.ts
├── ui/                 # UI adapter system
│   ├── types.ts                   # Component interfaces
│   └── shadcn/                    # Vendored shadcn/ui components
│       ├── index.ts               # Default adapter export
│       ├── button.tsx
│       ├── table.tsx
│       └── [other components]
├── i18n/               # Internationalization
│   ├── types.ts
│   ├── index.ts
│   └── adapters/
├── utils/              # Utilities
│   ├── cn.ts                      # className utility (tailwind-merge)
│   ├── column-helpers.ts          # Column metadata extraction
│   └── statistics.ts              # Statistics helpers
├── styles/             # CSS theme files
│   ├── theme.css                  # Tailwind v4 theme
│   └── theme-v3.css               # Tailwind v3 theme
├── types.ts            # Shared TypeScript types
└── index.ts            # Main package entry point
```

### Build System

- **Bundler:** tsup (modern, fast TypeScript bundler)
- **Config:** `tsup.config.ts`
- **Outputs:**
  - CommonJS: `dist/index.js`
  - ESM: `dist/index.mjs`
  - Types: `dist/index.d.ts`
  - Subpath exports: `dist/routing/`
  - Styles: `dist/styles/theme.css` and `dist/styles/theme-v3.css`
- **Externals:** React, TanStack Table, all Radix UI components (peer dependencies)

### Package Exports

```json
{
  ".": "./dist/index.mjs",
  "./routing": "./dist/routing/index.mjs",
  "./theme.css": "./dist/styles/theme.css",
  "./theme-v3.css": "./dist/styles/theme-v3.css"
}
```

## TypeScript Patterns

### Type Safety Best Practices

**✅ DO:** Let TypeScript infer types from generics
```typescript
const columns: ColumnDef<User>[] = [
  { accessorKey: "name", header: "Name" }  // TypeScript knows "name" must exist on User
];
```

**❌ DON'T:** Use type assertions to bypass safety
```typescript
const searchableColumns = [
  { id: "name" as keyof User, title: "Name" }  // Defeats type checking
];
```

**✅ DO:** Use helper utilities for complex configurations
```typescript
import { extractSearchableColumns } from '@b87/tanstack-tw-table';
const searchable = extractSearchableColumns(columns);
```

### Generic Constraints

All major types are generic over `TData`:
- `DataTableProps<TData, TValue>`
- `DataTableQueryBuilder<TData>`
- `DataTableSearchableColumn<TData>`
- `DataTableFilterableColumn<TData>`

This ensures compile-time safety for column IDs and field access.

## Key Implementation Details

### Server-Side Operations

The package supports full server-side pagination, filtering, sorting:

1. **Query Building:** Use `useServerQuery` hook or `DataTableQueryBuilder` directly
2. **API Integration:** QueryBuilder generates URLSearchParams
3. **Response Processing:** `processServerResponse` extracts statistics
4. **Statistics:** Server can return aggregate data (total, filtered, custom metrics)

### State Management Flow

1. `useDataTable` hook manages all table state (TanStack Table + view management)
2. State changes trigger callbacks (e.g., `onSortingChange`, `onFilterChange`)
3. Router adapter (if provided) syncs state to URL
4. Storage provider persists views to localStorage
5. Components access UI via `DataTableContext`

### Testing Approach

- **Framework:** Vitest with jsdom environment
- **Philosophy:** User-centric testing (test behavior, not implementation)
- **Setup:** `vitest.config.ts` + `vitest.setup.ts` with Testing Library
- **Coverage:** Component tests, hook tests, query builder tests
- **Best Practice:** Test what users see and do, not internal state

## Migration Context (Phase 0)

The package recently completed Phase 0 (API improvements):

1. **Removed Next.js dependency** - Now framework-agnostic via router abstraction
2. **Simplified column configuration** - Auto-detection from column metadata
3. **Reduced prop complexity** - Grouped props into `features` and `server` objects
4. **Clear entry points** - `DataTable` (simple) vs `DataTableCore` (advanced)

**Breaking Changes:** Old API removed, no backward compatibility maintained. This is acceptable as package hasn't been published yet.

## Current State & Roadmap

**Completed:**
- ✅ Core functionality (table, filtering, sorting, pagination)
- ✅ UI adapter pattern
- ✅ Router abstraction
- ✅ QueryBuilder system
- ✅ Column metadata auto-detection
- ✅ Date filtering with calendar UI
- ✅ Build configuration
- ✅ Basic tests passing

**In Progress:**
- 🔄 Documentation (README exists but needs Phase 0 updates)
- 🔄 Integration tests (UI adapter, router patterns)
- 🔄 Tailwind v4 theme enhancements

**Pending:**
- ⏳ npm publication
- ⏳ JSDoc comments for all exports
- ⏳ Example projects

## Important Notes for Claude

1. **Do not add dependencies** without checking package.json peer dependencies strategy
2. **Maintain type safety** - never use `any` or type assertions to bypass checks
3. **Follow UI adapter pattern** - use `useDataTableUI()` in components, not direct imports
4. **Test changes** - run `pnpm test` after modifications
5. **Update phase tracking** - if completing TODO.md tasks, update completion status
6. **Respect architecture** - router abstraction and UI adapter patterns are intentional
7. **No framework coupling** - keep core independent of Next.js, React Router, etc.
8. **Documentation updates** - API changes require README.md updates (especially Phase 0 patterns)
