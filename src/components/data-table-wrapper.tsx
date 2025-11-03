"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTableCore } from "./data-table";
import { DataTableVirtualized } from "./data-table-virtualized";
import { ViewManager } from "./view-manager";
import { DataTableViewToggle } from "./data-table-view-toggle";
import { Button } from "../ui/shadcn/button";
import { useDataTable } from "../hooks/use-data-table";
import { DataTableErrorBoundary } from "./data-table-error-boundary";
import { optimizedStorageProvider } from "../storage/optimized-storage-provider";
import type {
  DataTableFilterableColumn,
  DataTableSearchableColumn,
  DataTableView,
  DataTableI18nAdapter,
  DataTableFeatures,
  DataTableServerConfig,
} from "../types";
import type { DataTableUIOverrides } from "../ui/types";
import { enAdapter } from "../i18n/adapters/en";
import type { DataTableRouter } from "../routing/types";
import { shadcnUI } from "../ui/shadcn";
import { DataTableUIProvider } from "./DataTableContext";
import { extractSearchableColumns, extractFilterableColumns } from "../utils/column-helpers";

interface DataTableProps<TData, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  pageCount: number;
  tableId: string;
  router?: DataTableRouter;
  // Column configs (optional - auto-detected from column.meta if not provided)
  searchableColumns?: DataTableSearchableColumn<TData>[];
  filterableColumns?: DataTableFilterableColumn<TData>[];
  newRowLink?: string;
  deleteRowsAction?: (selectedRows: TData[]) => void;
  defaultView?: Partial<DataTableView>;
  // Grouped props
  features?: DataTableFeatures;
  server?: DataTableServerConfig<TData>;
  i18n?: DataTableI18nAdapter;
  ui?: DataTableUIOverrides;
}

function DataTableComponent<TData, TValue>({
  data,
  columns,
  pageCount,
  tableId,
  router,
  searchableColumns,
  filterableColumns,
  newRowLink,
  deleteRowsAction,
  defaultView,
  features,
  server,
  i18n = enAdapter,
  ui: uiOverrides,
}: DataTableProps<TData, TValue>) {
  // Auto-detect columns from metadata if not explicitly provided
  const resolvedSearchableColumns = searchableColumns ?? extractSearchableColumns(columns);
  const resolvedFilterableColumns = filterableColumns ?? extractFilterableColumns(columns);

  // Extract values from features and server configs
  const virtualizationEnabled = features?.virtualization === true || (features?.virtualization as any)?.enabled === true;
  const virtualizationConfig = typeof features?.virtualization === "object" ? features.virtualization : undefined;
  const rowSelectionEnabled = features?.rowSelection ?? true;
  const viewManagementConfig = typeof features?.viewManagement === "object" ? features.viewManagement : undefined;
  const viewManagementEnabled = features?.viewManagement === true || viewManagementConfig?.enabled === true;
  const urlSyncEnabled = features?.urlSync; // Extract urlSync from features

  // Use storage from features or default
  const resolvedStorageProvider = viewManagementConfig?.storage || optimizedStorageProvider;

  // Server mode determines manual flags
  const serverMode = server?.mode ?? "manual";
  const resolvedManualPagination = serverMode === "manual";
  const resolvedManualSorting = serverMode === "manual";
  const resolvedManualFiltering = serverMode === "manual";

  const { table, savedViews, currentViewId, actions } = useDataTable({
    data,
    columns,
    pageCount,
    tableId,
    router,
    storageProvider: resolvedStorageProvider,
    defaultView: {
      ...defaultView,
      ...(server?.currentSorting && { sorting: server.currentSorting }),
    },
    manualPagination: resolvedManualPagination,
    manualSorting: resolvedManualSorting,
    manualFiltering: resolvedManualFiltering,
    enableRowSelection: rowSelectionEnabled,
    onSortingChange: server?.onSortingChange,
    urlSync: urlSyncEnabled, // Pass urlSync to hook
  });

  const ui = { ...shadcnUI, ...uiOverrides };

  const handleViewChange = (view: Partial<DataTableView>) => {
    // This is called when the view state changes but isn't used directly
    // The hook handles the state management internally
  };

  const handleViewSave = async (viewData: Omit<DataTableView, "id" | "createdAt" | "updatedAt">) => {
    await actions.saveView(viewData);
  };

  const handleViewLoad = (view: DataTableView) => {
    actions.loadView(view);
  };

  const handleViewDelete = async (viewId: string) => {
    await actions.deleteView(viewId);
  };

  return (
    <DataTableUIProvider value={ui}>
      <DataTableErrorBoundary
        resetOnPropsChange={true}
        onError={(error, errorInfo) => {
          console.error("DataTable Error:", { error, errorInfo, tableId });
        }}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            {viewManagementEnabled && (
              <ViewManager
                tableId={tableId}
                currentView={actions.getCurrentViewState()}
                onViewChange={handleViewChange}
                onViewSave={handleViewSave}
                onViewDelete={handleViewDelete}
                onViewLoad={handleViewLoad}
                i18n={i18n}
              />
            )}
            <div className="flex items-center gap-2">
              <DataTableViewToggle table={table} i18n={i18n} />
              {newRowLink && (
                <Button variant="outline" size="sm">
                  <a href={newRowLink}>{i18n.actions.addNew}</a>
                </Button>
              )}
            </div>
          </div>
          {virtualizationEnabled ? (
            <DataTableVirtualized
              table={table}
              columns={columns}
              data={data}
              pageCount={pageCount}
              searchableColumns={resolvedSearchableColumns}
              filterableColumns={resolvedFilterableColumns}
              newRowLink={newRowLink}
              deleteRowsAction={deleteRowsAction}
              height={virtualizationConfig?.height ?? 600}
              estimateSize={virtualizationConfig?.estimateSize ?? 50}
              overscan={virtualizationConfig?.overscan ?? 5}
              isLoading={server?.isLoading}
              sortError={server?.error}
              onClearSortError={server?.onClearError}
              i18n={i18n}
            />
          ) : (
            <DataTableCore
              table={table}
              columns={columns}
              searchableColumns={resolvedSearchableColumns}
              filterableColumns={resolvedFilterableColumns}
              newRowLink={newRowLink}
              deleteRowsAction={deleteRowsAction}
              isLoading={server?.isLoading}
              sortError={server?.error}
              onClearSortError={server?.onClearError}
              i18n={i18n}
            />
          )}
        </div>
      </DataTableErrorBoundary>
    </DataTableUIProvider>
  );
}

// Main entry point: Simple, batteries-included data table
// For advanced usage, use DataTableCore with useDataTable hook
export const DataTable = DataTableComponent as <TData, TValue>(
  props: DataTableProps<TData, TValue>
) => React.ReactElement;
