"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import type { Table } from "@tanstack/react-table";

import { useDataTableUI } from "./DataTableContext";
import { DataTableFilterableColumn, DataTableSearchableColumn, DataTableI18nAdapter } from "../types";
import { enAdapter } from "../i18n/adapters/en";
import { DataTableDateFilter } from "./data-table-date-filter";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  filterableColumns?: DataTableFilterableColumn<TData>[];
  searchableColumns?: DataTableSearchableColumn<TData>[];
  deleteRowsAction?: (selectedRows: TData[]) => void;
  i18n?: DataTableI18nAdapter;
}

export function DataTableToolbar<TData>({
  table,
  filterableColumns = [],
  searchableColumns = [],
  deleteRowsAction,
  i18n = enAdapter,
}: DataTableToolbarProps<TData>) {
  const ui = useDataTableUI();
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto whitespace-nowrap">
        {searchableColumns.length > 0 &&
          searchableColumns.map(
            column =>
              table.getColumn(column.id ? String(column.id) : "") && (
                <ui.Input
                  key={String(column.id)}
                  placeholder={i18n.toolbar.filterPlaceholder(column.title)}
                  value={(table.getColumn(String(column.id))?.getFilterValue() as string) ?? ""}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => table.getColumn(String(column.id))?.setFilterValue(event.target.value)}
                  className="h-8 w-[150px] lg:w-[250px]"
                />
              )
          )}
        {filterableColumns.length > 0 &&
          filterableColumns.map(column => {
            const tableColumn = table.getColumn(column.id ? String(column.id) : "");
            if (!tableColumn) return null;

            // Use date filter for date type columns
            if (column.type === "date") {
              return (
                <DataTableDateFilter
                  key={String(column.id)}
                  column={tableColumn}
                  title={column.title}
                  operators={column.operators}
                  defaultOperator={column.defaultOperator}
                  i18n={i18n}
                />
              );
            }

            // Use faceted filter for other types
            return (
              <DataTableFacetedFilter
                key={String(column.id)}
                column={tableColumn}
                title={column.title}
                options={column.options}
                i18n={i18n}
              />
            );
          })}
        {isFiltered && (
          <ui.Button variant="ghost" onClick={() => table.resetColumnFilters()} className="h-8 px-2 lg:px-3">
            {i18n.toolbar.reset}
            <Cross2Icon className="ml-2 h-4 w-4" />
          </ui.Button>
        )}
      </div>
      <div className="flex shrink-0 items-center space-x-2">
        {table.getFilteredSelectedRowModel().rows.length > 0 && deleteRowsAction && (
          <ui.Button
            variant="outline"
            size="sm"
            onClick={() => deleteRowsAction(table.getFilteredSelectedRowModel().rows.map(r => r.original))}
          >
            {i18n.toolbar.deleteSelected(table.getFilteredSelectedRowModel().rows.length)}
          </ui.Button>
        )}
      </div>
    </div>
  );
}
