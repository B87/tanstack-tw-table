# Usage Guide

Comprehensive guide for using the Data Table Component. For a quick overview, see [README.md](./README.md).

## 📖 Quick Start

### Client-Side Table (Simple)

```tsx
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
    meta: { searchable: true }, // Auto-detected by DataTable
    enableSorting: true,
  },
  {
    accessorKey: "email",
    header: "Email",
    meta: { searchable: true }, // Auto-detected by DataTable
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "active" ? "default" : "secondary"}>{row.original.status}</Badge>
    ),
  },
];

export function UsersTable() {
  return (
    <DataTable
      data={users}
      columns={columns}
      pageCount={Math.ceil(users.length / 10)}
      tableId="users-table"
      server={{
        mode: "client", // Enable client-side operations
      }}
    />
  );
}
```

### Server-Side Table (Advanced)

```tsx
import { useState, useCallback, useEffect } from "react";
import { useDataTable, DataTableCore, useServerQuery } from "@b87/tanstack-tw-table";
import { extractSearchableColumns, extractFilterableColumns } from "@b87/tanstack-tw-table";
import type { ColumnFiltersState, SortingState, PaginationState } from "@tanstack/react-table";

export function ServerSideUsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Configure server-side query building
  const { buildQuery, processServerResponse, statistics } = useServerQuery<User>({
    searchableColumns: ["name", "email"],
    defaultPageSize: 50,
    enableQueryBuilder: true,
    enableStatistics: true, // Enable server-side statistics
  });

  // Fetch data function
  const fetchData = useCallback(
    async (tableState: {
      columnFilters?: ColumnFiltersState;
      sorting?: SortingState;
      pagination?: PaginationState;
      globalFilter?: string;
    }) => {
      setIsLoading(true);
      try {
        const queryParams = buildQuery(
          tableState.columnFilters || [],
          tableState.sorting || [],
          tableState.globalFilter,
          tableState.pagination
        );

        const response = await fetch(`/api/users?${queryParams.toString()}`);
        const result = await response.json();

        // Process response and extract statistics
        processServerResponse(result);

        setUsers(result.data);
        setPageCount(result.pagination?.totalPages || 1);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [buildQuery, processServerResponse]
  );

  // Initialize data table with server-side controls
  const { table } = useDataTable({
    data: users,
    columns,
    pageCount,
    tableId: "server-users-table",
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
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
      {/* Display server-side statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Total Users" value={statistics.total} />
          <StatCard label="Active Users" value={statistics.activeUsers || 0} />
          <StatCard label="Filtered Results" value={statistics.filtered} />
        </div>
      )}

      <DataTableCore
        table={table}
        columns={columns}
        searchableColumns={extractSearchableColumns(columns)}
        filterableColumns={extractFilterableColumns(columns)}
        isLoading={isLoading}
      />
    </div>
  );
}
```

## 🔧 Advanced Configuration

### Server-Side Statistics

Enable server-side statistics to show accurate aggregate data across your entire dataset:

```tsx
// API Response Structure
interface ApiResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  statistics?: {
    total: number; // Total records in database
    filtered: number; // Records matching current filters
    activeUsers?: number; // Custom statistic
    pendingUsers?: number; // Custom statistic
    [key: string]: number; // Any additional statistics
  };
}

// In your API route (e.g., /api/users/route.ts)
export async function GET(request: NextRequest) {
  // ... query building logic ...

  const users = await getUsersWithFilters(filters);
  const totalCount = await getTotalUsersCount();
  const activeCount = await getActiveUsersCount();

  return NextResponse.json({
    data: users,
    pagination: {
      /* ... */
    },
    statistics: {
      total: totalCount,
      filtered: users.length,
      activeUsers: activeCount,
      pendingUsers: totalCount - activeCount,
    },
  });
}

// In your component
const { statistics } = useServerQuery<User>({
  enableStatistics: true,
  // ... other options
});

// Display statistics
{
  statistics && (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <StatCard label="Total Users" value={statistics.total} />
      <StatCard label="Active" value={statistics.activeUsers || 0} />
      <StatCard label="Pending" value={statistics.pendingUsers || 0} />
      <StatCard label="Filtered" value={statistics.filtered} />
    </div>
  );
}
```

### Advanced Filtering with 20+ Operators

```tsx
import { FilterOperator } from "@/components/data-table/query/FilterOperators";

const filterableColumns: DataTableFilterableColumn<User>[] = [
  {
    id: "status",
    title: "Status",
    type: "string",
    defaultOperator: FilterOperator.IN,
    operators: [
      FilterOperator.IN, // Multiple selection
      FilterOperator.NOT_IN, // Exclude multiple
      FilterOperator.EQUALS, // Exact match
      FilterOperator.NOT_EQUALS, // Not equal
      FilterOperator.CONTAINS, // Text contains
    ],
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Pending", value: "pending" },
    ],
  },
  {
    id: "createdAt",
    title: "Created Date",
    type: "date", // 🆕 NEW: Date type enables specialized date picker
    defaultOperator: FilterOperator.DATE_AFTER,
    operators: [
      FilterOperator.DATE_EQUALS, // Exact date match
      FilterOperator.DATE_BEFORE, // Before specified date
      FilterOperator.DATE_AFTER, // After specified date
      FilterOperator.DATE_BETWEEN, // Date range selection
    ],
    // 🆕 No options needed - automatically shows date picker UI
  },
  {
    id: "score",
    title: "Score",
    type: "number",
    defaultOperator: FilterOperator.GREATER_THAN_OR_EQUAL,
    operators: [
      FilterOperator.EQUALS,
      FilterOperator.GREATER_THAN,
      FilterOperator.GREATER_THAN_OR_EQUAL,
      FilterOperator.LESS_THAN,
      FilterOperator.LESS_THAN_OR_EQUAL,
      FilterOperator.BETWEEN,
    ],
  },
];

// ❌ BAD: Using type assertions (defeats TypeScript safety)
const searchableColumnsBad = [
  { id: "name" as keyof User, title: "Name" },
  { id: "email" as keyof User, title: "Email" },
];

// ✅ GOOD: Let TypeScript infer the types
const searchableColumns: DataTableSearchableColumn<User>[] = [
  { id: "name", title: "Name" }, // TypeScript ensures 'name' exists on User
  { id: "email", title: "Email" }, // TypeScript ensures 'email' exists on User
  { id: "company", title: "Company" }, // TypeScript ensures 'company' exists on User
];

// ✅ BETTER: Use helper functions for complex configurations
import { createSearchableColumns } from "@/components/data-table/utils/column-helpers";

const searchableColumnsHelper = createSearchableColumns<User>([
  { id: "name", title: "Name" },
  { id: "email", title: "Email" },
  { id: "company", title: "Company" },
]);
```

### Complete Filter Operators Reference

```tsx
// String Operations
FilterOperator.EQUALS; // Exact match
FilterOperator.NOT_EQUALS; // Not equal
FilterOperator.CONTAINS; // Contains text
FilterOperator.NOT_CONTAINS; // Does not contain
FilterOperator.STARTS_WITH; // Starts with
FilterOperator.ENDS_WITH; // Ends with
FilterOperator.IN; // In array
FilterOperator.NOT_IN; // Not in array

// Numeric Operations
FilterOperator.GREATER_THAN; // >
FilterOperator.GREATER_THAN_OR_EQUAL; // >=
FilterOperator.LESS_THAN; // <
FilterOperator.LESS_THAN_OR_EQUAL; // <=
FilterOperator.BETWEEN; // Between two values

// Date Operations (🆕 NEW)
FilterOperator.DATE_EQUALS; // Same date
FilterOperator.DATE_BEFORE; // Before date
FilterOperator.DATE_AFTER; // After date
FilterOperator.DATE_BETWEEN; // Between dates

// Null Operations
FilterOperator.IS_NULL; // Is null/empty
FilterOperator.IS_NOT_NULL; // Is not null/empty

// Array Operations
FilterOperator.ARRAY_CONTAINS; // Array contains value
FilterOperator.ARRAY_LENGTH; // Array length equals
```

## 🆕 Advanced Date Filtering

### DataTableDateFilter Component

The new `DataTableDateFilter` provides a specialized UI for filtering date columns with calendar pickers and intuitive date range selection.

#### Features

- ✅ **Calendar UI**: Interactive date picker with visual calendar
- ✅ **Multiple Operators**: Support for equals, before, after, and between operations
- ✅ **Date Ranges**: Built-in support for start and end date selection
- ✅ **Type Safety**: Full TypeScript integration with QueryBuilder
- ✅ **User-Friendly**: Clear visual indicators for active filters
- ✅ **Keyboard Navigation**: Full accessibility support

#### Basic Usage

```tsx
import { DataTableDateFilter } from "@/components/data-table";
import { FilterOperator } from "@/components/data-table/query/FilterOperators";

// Configure date columns in your filterable columns
const filterableColumns: DataTableFilterableColumn<User>[] = [
  {
    id: "createdAt",
    title: "Created Date",
    type: "date", // This enables the date filter UI
    defaultOperator: FilterOperator.DATE_AFTER,
    operators: [
      FilterOperator.DATE_EQUALS, // "On" - exact date match
      FilterOperator.DATE_BEFORE, // "Before" - earlier than date
      FilterOperator.DATE_AFTER, // "After" - later than date
      FilterOperator.DATE_BETWEEN, // "Between" - date range
    ],
  },
  {
    id: "lastLoginAt",
    title: "Last Login",
    type: "date",
    defaultOperator: FilterOperator.DATE_BETWEEN,
    // Custom operator subset for specific use cases
    operators: [FilterOperator.DATE_AFTER, FilterOperator.DATE_BETWEEN],
  },
];
```

#### Advanced Date Filter Configuration

```tsx
// Full configuration example
const dateFilterColumn = {
  id: "eventDate",
  title: "Event Date",
  type: "date" as const,
  defaultOperator: FilterOperator.DATE_BETWEEN,
  operators: [
    FilterOperator.DATE_EQUALS, // Single date selection
    FilterOperator.DATE_BEFORE, // Before date (exclusive)
    FilterOperator.DATE_AFTER, // After date (exclusive)
    FilterOperator.DATE_BETWEEN, // Date range (inclusive)
  ],
};

// The DataTable automatically renders DataTableDateFilter for date type columns
<DataTable
  table={table}
  columns={columns}
  data={data}
  filterableColumns={[dateFilterColumn]} // Automatically uses date picker
  searchableColumns={searchableColumns}
/>;
```

#### Date Filter UI Behavior

```tsx
// User experience for each operator:

// DATE_EQUALS - "On"
// Shows: Single calendar picker
// User selects: One specific date
// Result: Matches records from that exact date

// DATE_BEFORE - "Before"
// Shows: Single calendar picker
// User selects: Cutoff date
// Result: Matches records before the selected date

// DATE_AFTER - "After"
// Shows: Single calendar picker
// User selects: Start date
// Result: Matches records after the selected date

// DATE_BETWEEN - "Between"
// Shows: Two calendar pickers (Start Date / End Date)
// User selects: Date range
// Result: Matches records within the date range (inclusive)
```

### Integration with QueryBuilder

The date filters seamlessly integrate with the QueryBuilder system for server-side processing:

```tsx
// Client-side: Date filter generates this structure
const dateFilterValue = {
  operator: FilterOperator.DATE_BETWEEN,
  date: new Date("2024-01-15"), // Start date
  endDate: new Date("2024-01-31"), // End date (for BETWEEN only)
};

// QueryBuilder automatically converts to proper query parameters
const queryBuilder = DataTableQueryBuilder.create<User>().filtersFromTable(columnFilters); // Includes date filters

// Generated URL parameters:
// ?createdAt_min=2024-01-15T00:00:00.000Z&createdAt_max=2024-01-31T00:00:00.000Z&createdAt_op=date_between
```

### Server-Side Date Handling

```tsx
// API route example - /api/users/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // QueryBuilder provides standardized date parameter format
  const createdAtMin = searchParams.get('createdAt_min');
  const createdAtMax = searchParams.get('createdAt_max');
  const createdAtOp = searchParams.get('createdAt_op');

  let whereClause = [];

  if (createdAtOp === 'date_between' && createdAtMin && createdAtMax) {
    whereClause.push(
      and(
        gte(users.createdAt, new Date(createdAtMin)),
        lte(users.createdAt, new Date(createdAtMax))
      )
    );
  } else if (createdAtOp === 'date_after' && createdAtMin) {
    whereClause.push(gte(users.createdAt, new Date(createdAtMin)));
  } else if (createdAtOp === 'date_before' && createdAtMax) {
    whereClause.push(lte(users.createdAt, new Date(createdAtMax)));
  }

  // Execute query with date filters...
}
```

### QueryBuilder Fluent API

Build complex server-side queries with a type-safe, fluent interface:

```tsx
import { DataTableQueryBuilder } from '@/components/data-table/query/QueryBuilder';
import { FilterOperator } from '@/components/data-table/query/FilterOperators';

// Direct QueryBuilder usage
const queryBuilder = DataTableQueryBuilder.create<User>()
  .filter('status', FilterOperator.IN, ['active', 'pending'])
  .filter('createdAt', FilterOperator.DATE_AFTER, '2024-01-01')
  .filter('score', FilterOperator.GREATER_THAN_OR_EQUAL, 80)
  .sort('createdAt', 'desc')
  .sort('name', 'asc') // Secondary sort
  .paginate(1, 50)
  .search(['name', 'email', 'company'], searchTerm);

const queryParams = queryBuilder.build();
// Result: ?status=active,pending&createdAt_op=date_after&createdAt=2024-01-01...

// Use with fetch
const response = await fetch(`/api/users?${queryParams.toString()}`);
const data = await response.json();
```

### Programmatic Query Building

```tsx
// Build queries programmatically based on conditions
const buildUserQuery = (filters: UserFilters) => {
  let query = DataTableQueryBuilder.create<User>();

  // Add filters conditionally
  if (filters.status?.length) {
    query = query.filter("status", FilterOperator.IN, filters.status);
  }

  if (filters.dateRange) {
    query = query.filter("createdAt", FilterOperator.DATE_BETWEEN, [filters.dateRange.start, filters.dateRange.end]);
  }

  if (filters.minScore) {
    query = query.filter("score", FilterOperator.GREATER_THAN_OR_EQUAL, filters.minScore);
  }

  // Add search if provided
  if (filters.search) {
    query = query.search(["name", "email"], filters.search);
  }

  // Apply sorting and pagination
  return query
    .sort(filters.sortBy || "createdAt", filters.sortOrder || "desc")
    .paginate(filters.page || 1, filters.pageSize || 50);
};
```

## 💾 View Management & Persistence

### Automatic State Persistence

The data table automatically saves and restores:

- ✅ **Column Filters** - All filter values and selected operators
- ✅ **Sorting State** - Primary and secondary sort columns with direction
- ✅ **Column Visibility** - Which columns are shown/hidden
- ✅ **Pagination Settings** - Page size preferences
- ✅ **Global Search** - Search terms and selected columns

### View Operations

```tsx
import { ViewManager } from "@/components/data-table/view-manager";

// View management in your component
const { table, actions } = useDataTable({
  // ... table configuration
});

const handleViewSave = async (viewData: Omit<DataTableView, "id" | "createdAt" | "updatedAt">) => {
  await actions.saveView(viewData);
  toast.success("View saved successfully");
};

const handleViewLoad = (view: DataTableView) => {
  actions.loadView(view);
  toast.success(`Loaded view: ${view.name}`);
};

// View manager component
<ViewManager
  tableId="users-table"
  currentView={actions.getCurrentViewState()}
  onViewSave={handleViewSave}
  onViewLoad={handleViewLoad}
  onViewDelete={async viewId => {
    await actions.deleteView(viewId);
    toast.success("View deleted");
  }}
/>;
```

### Custom View Creation

```tsx
// Create views programmatically
const createQuickViews = () => {
  // Active users view
  const activeUsersView = {
    name: "Active Users",
    description: "Show only active users",
    columnFilters: [{ id: "status", value: ["active"] }],
    sorting: [{ id: "name", desc: false }],
    columnVisibility: { internalNotes: false },
    pagination: { pageIndex: 0, pageSize: 25 },
    globalFilter: "",
    isDefault: false,
  };

  // Recent signups view
  const recentSignupsView = {
    name: "Recent Signups",
    description: "Users who joined in the last 30 days",
    columnFilters: [{ id: "createdAt", value: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()] }],
    sorting: [{ id: "createdAt", desc: true }],
    columnVisibility: {},
    pagination: { pageIndex: 0, pageSize: 50 },
    globalFilter: "",
    isDefault: false,
  };

  return [activeUsersView, recentSignupsView];
};
```

## 🧩 Component Architecture

### Core Components

#### `<DataTable />`

**Best for:** Client-side tables with simple requirements (auto-detects searchable/filterable columns)

```tsx
// ✅ RECOMMENDED: Use column.meta for auto-detection
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    meta: { searchable: true }, // Auto-detected!
  },
];

<DataTable
  data={users}
  columns={columns}
  tableId="simple-users"
  server={{ mode: "client" }}
/>
```

#### `<DataTableCore />`

**Best for:** Server-side tables with full control

```tsx
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

### Specialized Components

#### `<ViewManager />`

Handles view persistence and management

```tsx
<ViewManager
  tableId="users-table"
  currentView={currentViewState}
  onViewSave={handleViewSave}
  onViewLoad={handleViewLoad}
  onViewDelete={handleViewDelete}
/>
```

#### `<DataTableToolbar />`

Search, filters, and actions bar

- Global search across multiple columns
- Advanced filtering with 20+ operators
- Bulk actions and export functionality
- Column visibility toggle

#### `<DataTableFacetedFilter />`

Advanced multi-select filtering

```tsx
<DataTableFacetedFilter
  column={table.getColumn("status")}
  title="Status"
  options={statusOptions}
  operators={[FilterOperator.IN, FilterOperator.NOT_IN]}
  defaultOperator={FilterOperator.IN}
/>
```

#### `<DataTableDateFilter />` 🆕 NEW

Specialized date filtering with calendar UI

```tsx
<DataTableDateFilter
  column={table.getColumn("createdAt")}
  title="Created Date"
  operators={[
    FilterOperator.DATE_EQUALS,
    FilterOperator.DATE_BEFORE,
    FilterOperator.DATE_AFTER,
    FilterOperator.DATE_BETWEEN,
  ]}
  defaultOperator={FilterOperator.DATE_AFTER}
/>
```

**Features:**

- 📅 **Calendar UI**: Visual date picker with month/year navigation
- 🔄 **Smart Operators**: On, Before, After, and Between date operations
- 📍 **Date Ranges**: Built-in support for start/end date selection
- 🧪 **Well-Tested**: Comprehensive user-centric test coverage
- ♿ **Accessible**: Full keyboard navigation and screen reader support

### Utility Components

#### `<DataTableViewToggle />`

Switch between table views (compact, comfortable, etc.)

#### `<DataTableColumnHeader />`

Sortable column headers with indicators

#### `<DataTablePagination />`

Full-featured pagination with page size selection

## 🔌 Hooks & APIs

### `useDataTable` - Core Table Management

The primary hook for table state and operations:

```tsx
const {
  table, // TanStack table instance
  savedViews, // Array of saved views
  currentViewId, // Active view ID
  actions, // View management actions
} = useDataTable({
  data: users,
  columns,
  pageCount,
  tableId: "users-table",
  defaultView: {
    columnVisibility: {},
    sorting: [{ id: "createdAt", desc: true }],
  },
  // Server-side configuration
  manualFiltering: true,
  manualSorting: true,
  manualPagination: true,
  // Event handlers
  onSortingChange: handleServerSorting,
  onFilterChange: handleServerFiltering,
});

// Available actions
actions.saveView(viewData);
actions.loadView(view);
actions.deleteView(viewId);
actions.getCurrentViewState();
actions.resetToDefault();
```

### `useServerQuery` - Server-Side Operations

Hook for building and managing server queries:

```tsx
const {
  buildQuery, // Build URLSearchParams from table state
  processServerResponse, // Process API response and extract statistics
  statistics, // Current statistics state
  createQueryBuilder, // Create QueryBuilder instance
} = useServerQuery<User>({
  searchableColumns: ["name", "email", "company"],
  defaultPageSize: 50,
  enableQueryBuilder: true,
  enableStatistics: true, // Enable statistics processing
  queryBuilderOptions: {
    includeEmptyValues: false,
    encodeValues: true,
  },
});

// Usage in data fetching
const fetchUsers = async tableState => {
  const queryParams = buildQuery(
    tableState.columnFilters,
    tableState.sorting,
    tableState.globalFilter,
    tableState.pagination
  );

  const response = await fetch(`/api/users?${queryParams}`);
  const result = await response.json();

  // Process response to extract statistics
  return processServerResponse(result);
};
```

### `useServerDataFetch` - Simplified Server Fetching

Combines query building with data fetching:

```tsx
const { fetchData, statistics } = useServerDataFetch(
  async queryParams => {
    const response = await fetch(`/api/users?${queryParams}`);
    return response.json();
  },
  {
    searchableColumns: ["name", "email"],
    enableStatistics: true,
  }
);

// Use in component
useEffect(() => {
  fetchData(columnFilters, sorting, globalFilter, pagination);
}, [columnFilters, sorting, globalFilter, pagination]);
```

## 💾 Storage Architecture

### LocalStorageProvider (Current)

```tsx
// Automatic localStorage persistence
// Views stored per table ID
// ~5MB storage limit
// Survives browser sessions
```

**Limitations:**

- Device-specific (no cross-device sync)
- Storage quota limitations
- No team collaboration

### PostgreSQL Provider (Roadmap)

```tsx
// Planned features:
// - Cross-device synchronization
// - Team view sharing
// - Unlimited storage
// - View versioning and audit trail
// - Advanced permissions
```

## 🔒 TypeScript Support

### Core Interfaces

```tsx
// Main component props
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  searchableColumns?: DataTableSearchableColumn<TData>[];
  filterableColumns?: DataTableFilterableColumn<TData>[];
  statistics?: DataTableStatistics; // Server-side statistics
  // ... other props
}

// Enhanced filterable columns with operator support
interface DataTableFilterableColumn<TData> {
  id: keyof TData;
  title: string;
  type?: "string" | "number" | "date" | "boolean" | "array";
  operators?: FilterOperator[]; // Available operators
  defaultOperator?: FilterOperator; // Default operator
  options: Array<{
    label: string;
    value: string;
    icon?: React.ComponentType;
    withCount?: boolean; // Show count badges
  }>;
}

// Statistics interface
interface DataTableStatistics {
  total: number; // Total records in database
  filtered: number; // Records matching filters
  [key: string]: number; // Custom statistics
}

// Server query response
interface ServerQueryResponse<TData> {
  data: TData[];
  pagination?: PaginationInfo;
  statistics?: DataTableStatistics; // Optional statistics
}
```

### Hook Types

```tsx
// useDataTable hook return type
interface UseDataTableReturn<TData> {
  table: Table<TData>;
  savedViews: DataTableView[];
  currentViewId: string | null;
  actions: {
    saveView: (view: Omit<DataTableView, "id" | "createdAt" | "updatedAt">) => Promise<void>;
    loadView: (view: DataTableView) => void;
    deleteView: (viewId: string) => Promise<void>;
    getCurrentViewState: () => Partial<DataTableView>;
    resetToDefault: () => void;
  };
}

// useServerQuery hook return type
interface UseServerQueryReturn<TData> {
  buildQuery: (
    columnFilters: ColumnFiltersState,
    sorting: SortingState,
    globalFilter?: string,
    pagination?: PaginationState
  ) => URLSearchParams;
  processServerResponse: (response: ServerQueryResponse<TData>) => ServerQueryResponse<TData>;
  statistics: DataTableStatistics | null;
  createQueryBuilder: (...args) => DataTableQueryBuilder<TData>;
}
```

### Generic Constraints

```tsx
// Strongly typed column definitions
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name", // ✅ Type-safe - 'name' exists on User
    header: "Name",
    enableSorting: true,
  },
  {
    accessorKey: "invalidField", // ❌ TypeScript error - doesn't exist on User
    header: "Invalid",
  },
];

// ✅ Type-safe filter columns (TypeScript enforces keyof User)
const filterableColumns: DataTableFilterableColumn<User>[] = [
  {
    id: "status", // ✅ TypeScript ensures 'status' exists on User
    title: "Status",
    type: "string",
    defaultOperator: FilterOperator.IN,
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  },
];

// ✅ BETTER: Use helper functions and builders
import { createColumnConfig } from "@/components/data-table/utils/column-helpers";

const { searchableColumns, filterableColumns } = createColumnConfig<User>()
  .addSearchable("name", "Name")
  .addSearchable("email", "Email")
  .addFilterable({
    id: "status",
    title: "Status",
    type: "string",
    defaultOperator: FilterOperator.IN,
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  })
  .build();

// Type-safe query building
const queryBuilder = DataTableQueryBuilder.create<User>()
  .filter("name", FilterOperator.CONTAINS, "john") // ✅ 'name' is keyof User
  .filter("age", FilterOperator.GREATER_THAN, 18) // ✅ 'age' is keyof User
  .filter("invalid", FilterOperator.EQUALS, "test"); // ❌ TypeScript error
```

## 🎨 Styling & Design

### Design System Integration

Built with **shadcn/ui** components and **Tailwind CSS**:

```tsx
// Consistent with project design tokens
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Uses design system colors and spacing
<DataTable
  className="border-border bg-background"
  // Automatically applies consistent styling
/>;
```

### Responsive Design

```tsx
// Mobile-first responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard label="Total" value={statistics.total} />
  {/* Cards stack on mobile, grid on larger screens */}
</div>

// Responsive table controls
<DataTableToolbar className="flex flex-col sm:flex-row gap-2" />
```

### Dark Mode Support

All components automatically adapt to dark/light mode via CSS variables.

## ⚡ Performance Optimizations

### Server-Side Benefits

- ✅ **Pagination**: Only load visible rows, not entire dataset
- ✅ **Filtering**: Database-level filtering reduces network payload
- ✅ **Sorting**: Efficient database sorting vs client-side arrays
- ✅ **Statistics Caching**: 5-minute cache reduces redundant calculations

### Client-Side Optimizations

- ✅ **Memoization**: Prevents unnecessary re-renders with `useMemo`/`useCallback`
- ✅ **Stable References**: Fixed infinite loop issues with proper dependencies
- ✅ **Lazy Loading**: Filter options loaded on-demand
- ✅ **Debounced Search**: 300ms delay prevents excessive API calls

### Memory Management

- ✅ **View Storage**: Efficient localStorage with quota management
- ✅ **Cache Cleanup**: Automatic cleanup of expired statistics
- ✅ **Component Unmount**: Proper cleanup of subscriptions and timers

## ♿ Accessibility Features

### Keyboard Navigation

```tsx
// Full keyboard support
Tab          // Navigate between controls
Enter/Space  // Activate buttons and filters
Escape       // Close dialogs and dropdowns
Arrow Keys   // Navigate within dropdowns
```

### Screen Reader Support

- ✅ **ARIA Labels**: All interactive elements labeled
- ✅ **Live Regions**: Status updates announced
- ✅ **Role Attributes**: Proper semantic markup
- ✅ **Focus Management**: Logical tab order maintained

### Visual Accessibility

- ✅ **High Contrast**: Meets WCAG AA standards
- ✅ **Focus Indicators**: Clear focus outlines
- ✅ **Color Independence**: Information not conveyed by color alone

## 📚 Real-World Examples

### Production Implementations

#### Organizations Management (`src/app/organizations/page.tsx`)

```tsx
// Features demonstrated:
// - Server-side filtering with 5+ operators
// - Statistics display (total, customers, prospects)
// - Export functionality
// - Bulk operations
// - View persistence
```

#### People Directory (`src/app/people/page.tsx`)

```tsx
// Features demonstrated:
// - Complex filtering (status, date ranges, tags)
// - Multi-column search
// - Custom cell renderers
// - Row selection and actions
```

#### Projects Dashboard (`src/app/projects/page.tsx`)

```tsx
// Features demonstrated:
// - Client-side implementation
// - Simple configuration
// - Basic filtering and search
```
