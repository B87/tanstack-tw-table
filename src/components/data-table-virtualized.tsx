"use client";

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { flexRender, type Table as TanStackTable } from "@tanstack/react-table";

import { useDataTableUI } from "./DataTableContext";
import { DataTableProps, ServerSortingProps } from "../types";
import { DataTableToolbar } from "./data-table-toolbar";
import { DataTableErrorBanner } from "./data-table-error-banner";
import { DataTablePagination } from "./data-table-pagination";
import { SortableHeader } from "./sortable-header";

interface DataTableVirtualizedProps<TData, TValue> extends DataTableProps<TData, TValue>, ServerSortingProps {
  table: TanStackTable<TData>;
  height?: number;
  estimateSize?: number;
  overscan?: number;
}

export function DataTableVirtualized<TData, TValue>({
  table,
  columns,
  searchableColumns,
  filterableColumns,
  newRowLink,
  deleteRowsAction,
  height = 600,
  estimateSize = 50,
  overscan = 5,
  isLoading = false,
  sortError,
  onClearSortError,
}: DataTableVirtualizedProps<TData, TValue>) {
  const ui = useDataTableUI();
  const parentRef = React.useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  const items = virtualizer.getVirtualItems();

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchableColumns={searchableColumns}
        filterableColumns={filterableColumns}
        deleteRowsAction={deleteRowsAction}
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
        <div className="overflow-hidden">
          <ui.Table>
            <ui.TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
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
          </ui.Table>
        </div>
        <div
          ref={parentRef}
          className="overflow-auto"
          style={{
            height: `${height}px`,
          }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            <ui.Table>
              <ui.TableBody>
                {rows.length > 0 ? (
                  items.map(virtualRow => {
                    const row = rows[virtualRow.index];
                    return (
                      <ui.TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="hover:bg-muted/50 absolute w-full"
                        style={{
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        {row.getVisibleCells().map(cell => (
                          <ui.TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </ui.TableCell>
                        ))}
                      </ui.TableRow>
                    );
                  })
                ) : (
                  <ui.TableRow>
                    <ui.TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </ui.TableCell>
                  </ui.TableRow>
                )}
              </ui.TableBody>
            </ui.Table>
          </div>
        </div>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
