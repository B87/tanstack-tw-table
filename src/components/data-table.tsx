"use client";

import * as React from "react";
import { flexRender, type Table as TanStackTable, type ColumnDef } from "@tanstack/react-table";

import { useDataTableUI } from "./DataTableContext";
import {
  DataTableProps,
  ServerSortingProps,
  DataTableSearchableColumn,
  DataTableFilterableColumn,
} from "../types";
import { enAdapter } from "../i18n/adapters/en";
import { DataTableToolbar } from "./data-table-toolbar";
import { DataTableErrorBanner } from "./data-table-error-banner";
import { DataTablePagination } from "./data-table-pagination";
import { SortableHeader } from "./sortable-header";

interface DataTableCoreProps<TData, TValue> extends Partial<DataTableProps<TData, TValue>>, ServerSortingProps {
  table: TanStackTable<TData>;
  columns: ColumnDef<TData, TValue>[];
  searchableColumns?: DataTableSearchableColumn<TData>[];
  filterableColumns?: DataTableFilterableColumn<TData>[];
}

function DataTableCoreComponent<TData, TValue>({
  table,
  columns,
  searchableColumns,
  filterableColumns,
  newRowLink,
  deleteRowsAction,
  isLoading = false,
  sortError,
  onClearSortError,
  i18n = enAdapter,
}: DataTableCoreProps<TData, TValue>) {
  const ui = useDataTableUI();
  // Remove memoization to ensure table state changes are reflected immediately
  const rows = table.getRowModel().rows;
  const headerGroups = table.getHeaderGroups();

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchableColumns={searchableColumns}
        filterableColumns={filterableColumns}
        deleteRowsAction={deleteRowsAction}
        i18n={i18n}
      />
      {sortError && (
        <DataTableErrorBanner
          error={sortError}
          onRetry={() => {
            // Trigger a re-sort by toggling the current sort
            const currentSort = table.getState().sorting[0];
            if (currentSort) {
              table.setSorting([currentSort]);
            }
          }}
          onDismiss={onClearSortError}
        />
      )}
      <div className="rounded-md border">
        <ui.Table>
          <ui.TableHeader>
            {headerGroups.map(headerGroup => (
              <ui.TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  const headerContent = header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext());

                  return (
                    <ui.TableHead key={header.id} colSpan={header.colSpan}>
                      {header.column.getCanSort() ? (
                        <SortableHeader header={header} column={header.column} isLoading={isLoading}>
                          {headerContent}
                        </SortableHeader>
                      ) : (
                        headerContent
                      )}
                    </ui.TableHead>
                  );
                })}
              </ui.TableRow>
            ))}
          </ui.TableHeader>
          <ui.TableBody>
            {rows?.length ? (
              rows.map(row => (
                <ui.TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-muted/50">
                  {row.getVisibleCells().map(cell => (
                    <ui.TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</ui.TableCell>
                  ))}
                </ui.TableRow>
              ))
            ) : (
              <ui.TableRow>
                <ui.TableCell colSpan={columns.length} className="h-24 text-center">
                  {i18n.table.noResults}
                </ui.TableCell>
              </ui.TableRow>
            )}
          </ui.TableBody>
        </ui.Table>
      </div>
      <DataTablePagination table={table} i18n={i18n} />
    </div>
  );
}

// Export without React.memo to ensure proper reactivity for table interactions
// This is the core table component that requires a table instance from useDataTable
export const DataTableCore = DataTableCoreComponent as <TData, TValue>(
  props: DataTableCoreProps<TData, TValue>
) => React.ReactElement;
