// Core components
// Main entry point: Simple, batteries-included data table
export { DataTable } from "./components/data-table-wrapper";
// Advanced: Core table component (requires table instance from useDataTable hook)
export { DataTableCore } from "./components/data-table";
export { DataTableVirtualized } from "./components/data-table-virtualized";
export { DataTablePagination } from "./components/data-table-pagination";
export { DataTableToolbar } from "./components/data-table-toolbar";
export { DataTableViewToggle } from "./components/data-table-view-toggle";
export { DataTableFacetedFilter } from "./components/data-table-faceted-filter";
export { DataTableDateFilter } from "./components/data-table-date-filter";
export { DataTableErrorBoundary } from "./components/data-table-error-boundary";
export { DataTableErrorBanner } from "./components/data-table-error-banner";
export { SortableHeader } from "./components/sortable-header";
export { SortIcon } from "./components/sort-icon";
export { ViewManager } from "./components/view-manager";

// Hooks
export { useDataTable } from "./hooks/use-data-table";
export { useServerQuery, useServerDataFetch, extractQueryParams } from "./hooks/use-server-query";
export { useDataTableErrorHandler } from "./hooks/use-data-table-error-handler";

// Storage providers
export { localStorageProvider } from "./storage/local-storage-provider";
export { optimizedStorageProvider } from "./storage/optimized-storage-provider";

// Query builders
export { DataTableQueryBuilder, createQueryBuilder, buildQueryFromTableState } from "./query/QueryBuilder";
export { FilterOperator, getOperatorsForType, getOperatorDefinition } from "./query/FilterOperators";

// Types
export * from "./types";
// Column helpers for auto-detection
export { extractSearchableColumns, extractFilterableColumns } from "./utils/column-helpers";

// URL sync utilities
export { serializeTableState, deserializeTableState, mergeUrlStateWithDefaults } from "./utils/url-sync";

// i18n
export * from "./i18n";

// Routing (for framework-agnostic URL synchronization)
// Note: Import from "@b87/tanstack-tw-table/routing" subpath
export type { DataTableRouter, DataTableRouterOptions } from "./routing/types";
