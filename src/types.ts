import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
  Table,
} from "@tanstack/react-table";
import type { FilterOperator } from "./query/FilterOperators";
import type { DataTableQueryBuilder } from "./query/QueryBuilder";
import type { DataTableI18nAdapter } from "./i18n/types";

/**
 * Column metadata for auto-detection of searchable/filterable columns
 * Extends TanStack Table's ColumnMeta type
 */
export interface DataTableColumnMeta<TData> {
  /**
   * Enable search on this column
   * @example { searchable: true }
   * @example { searchable: { weight: 2 } } // Higher weight = more relevant
   */
  searchable?: boolean | {
    weight?: number; // For search ranking (default: 1)
  };
  /**
   * Enable filtering on this column
   * @example { filterable: { options: [{ label: "Active", value: "active" }] } }
   */
  filterable?: {
    options: Array<{
      label: string;
      value: string;
      icon?: React.ComponentType<{ className?: string }>;
      withCount?: boolean;
    }>;
    type?: "string" | "number" | "date" | "boolean" | "array";
    operators?: FilterOperator[];
    defaultOperator?: FilterOperator;
  };
}

// Extend TanStack Table's ColumnMeta type
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> extends DataTableColumnMeta<TData> {}
}

export interface DataTableSearchableColumn<TData> {
  id: keyof TData;
  title: string;
}

export interface DataTableFilterableColumn<TData> {
  id: keyof TData;
  title: string;
  type?: "string" | "number" | "date" | "boolean" | "array";
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
    withCount?: boolean;
  }[];
  operators?: FilterOperator[];
  defaultOperator?: FilterOperator;
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  searchableColumns?: DataTableSearchableColumn<TData>[];
  filterableColumns?: DataTableFilterableColumn<TData>[];
  newRowLink?: string;
  // If provided, called with the currently selected row originals
  deleteRowsAction?: (selectedRows: TData[]) => void;
  // Statistics support
  statistics?: DataTableStatistics;
  // i18n adapter for translating all UI strings
  i18n?: DataTableI18nAdapter;
}

export interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  filterableColumns?: DataTableFilterableColumn<TData>[];
  searchableColumns?: DataTableSearchableColumn<TData>[];
  deleteRowsAction?: (selectedRows: TData[]) => void;
  i18n?: DataTableI18nAdapter;
}

export interface DataTableView {
  id: string;
  name: string;
  description?: string;
  columnFilters: ColumnFiltersState;
  sorting: SortingState;
  columnVisibility: VisibilityState;
  pagination: PaginationState;
  globalFilter: string;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ViewManagerProps {
  tableId: string;
  currentView: Partial<DataTableView>;
  onViewChange: (view: Partial<DataTableView>) => void;
  onViewSave: (view: Omit<DataTableView, "id" | "createdAt" | "updatedAt">) => void;
  onViewDelete: (viewId: string) => void;
  onViewLoad: (view: DataTableView) => void;
  i18n?: DataTableI18nAdapter;
}

export interface DataTableViewStorage {
  saveView: (tableId: string, view: DataTableView) => Promise<void>;
  loadViews: (tableId: string) => Promise<DataTableView[]>;
  deleteView: (tableId: string, viewId: string) => Promise<void>;
  updateView: (tableId: string, viewId: string, view: Partial<DataTableView>) => Promise<void>;
}

export interface FilterCondition {
  id: string;
  columnId: string;
  operator: string;
  value: any;
}

export interface AdvancedFilterProps {
  columns: Array<{
    id: string;
    label: string;
    type: "text" | "number" | "date" | "select" | "boolean";
    options?: Array<{ label: string; value: string }>;
  }>;
  conditions: FilterCondition[];
  onChange: (conditions: FilterCondition[]) => void;
}

// Complete table state snapshot for server callbacks
export interface DataTableState {
  columnFilters: ColumnFiltersState;
  sorting: SortingState;
  pagination: PaginationState;
  globalFilter: string;
}

// Server-side callback parameters with complete state
export interface ServerSortParams {
  sorting: SortingState;
  state: DataTableState; // Complete state snapshot
  resetPagination: boolean;
}

export interface ServerFilterParams {
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  state: DataTableState; // Complete state snapshot
}

export interface ServerPaginationParams {
  pagination: PaginationState;
  state: DataTableState; // Complete state snapshot
}

export interface ServerSortingProps {
  onSortingChange?: (params: ServerSortParams) => Promise<void>;
  currentSorting?: SortingState;
  isLoading?: boolean;
  sortError?: string | null;
  onClearSortError?: () => void;
}

export interface ServerQueryParams<TData = any> {
  queryBuilder: DataTableQueryBuilder<TData>;
  resetPagination?: boolean;
}

export interface ServerQueryProps<TData = any> {
  onQueryChange?: (params: ServerQueryParams<TData>) => Promise<void>;
  isLoading?: boolean;
  queryError?: string | null;
  onClearQueryError?: () => void;
}

export interface UseServerQueryOptions<TData = any> {
  searchableColumns?: (keyof TData)[];
  defaultPageSize?: number;
  enableQueryBuilder?: boolean;
  queryBuilderOptions?: {
    includeEmptyValues?: boolean;
    parameterPrefix?: string;
    encodeValues?: boolean;
  };
  enableStatistics?: boolean;
}

export interface DataTableStatistics {
  total: number;
  filtered: number;
  [key: string]: number; // Allow custom statistics
}

export interface ServerQueryResponse<TData = any> {
  data: TData[];
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  statistics?: DataTableStatistics;
}

// Re-export i18n types for convenience
export type { DataTableI18nAdapter } from "./i18n/types";

/**
 * Feature configuration for DataTable
 * Groups related props to reduce complexity
 */
export interface DataTableFeatures {
  /**
   * Enable view management (save/load/delete views)
   * @example true // Use default storage
   * @example { enabled: true, storage: customStorage }
   */
  viewManagement?: boolean | {
    enabled: boolean;
    storage?: DataTableViewStorage;
  };
  /**
   * Enable virtualization for large datasets
   * @example true // Use defaults
   * @example { enabled: true, height: 600, estimateSize: 50 }
   */
  virtualization?: boolean | {
    enabled: boolean;
    height?: number;
    estimateSize?: number;
    overscan?: number;
  };
  /**
   * Enable row selection
   */
  rowSelection?: boolean;
  /**
   * Enable URL synchronization for table state
   * Syncs filters, sorting, pagination, and search to URL params
   * @example true // Sync all state
   * @example { filters: true, sorting: true, pagination: false }
   */
  urlSync?: boolean | {
    filters?: boolean;
    sorting?: boolean;
    pagination?: boolean;
    search?: boolean;
  };
}

/**
 * Server-side configuration for DataTable
 * Groups server-related props
 */
export interface DataTableServerConfig<TData = any> {
  /**
   * Server mode: "manual" for server-side operations, "client" for client-side
   * @default "manual"
   */
  mode?: "manual" | "client";
  /**
   * Callback when sorting changes (server-side)
   */
  onSortingChange?: (params: ServerSortParams) => Promise<void>;
  /**
   * Current sorting state (for controlled component)
   */
  currentSorting?: SortingState;
  /**
   * Loading state
   */
  isLoading?: boolean;
  /**
   * Error message from server
   */
  error?: string | null;
  /**
   * Clear error callback
   */
  onClearError?: () => void;
}
