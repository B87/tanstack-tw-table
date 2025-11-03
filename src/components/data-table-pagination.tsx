"use client";

import { ChevronLeftIcon, ChevronRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from "@radix-ui/react-icons";
import type { Table } from "@tanstack/react-table";

import { useDataTableUI } from "./DataTableContext";
import { enAdapter } from "../i18n/adapters/en";
import { DataTableI18nAdapter } from "../types";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  i18n?: DataTableI18nAdapter;
}

export function DataTablePagination<TData>({ table, i18n = enAdapter }: DataTablePaginationProps<TData>) {
  const ui = useDataTableUI();
  const enableRowSelection = table.options.enableRowSelection;

  return (
    <div className="flex items-center justify-between px-2">
      {enableRowSelection && (
        <div className="flex-1 text-sm text-muted-foreground">
          {i18n.pagination.rowsSelected(table.getFilteredSelectedRowModel().rows.length)}
        </div>
      )}
      {!enableRowSelection && <div className="flex-1" />}
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">{i18n.pagination.rowsPerPage}</p>
          <ui.Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value: string) => {
              table.setPageSize(Number(value));
            }}
          >
            <ui.SelectTrigger className="h-8 w-[70px]">
              <ui.SelectValue placeholder={table.getState().pagination.pageSize} />
            </ui.SelectTrigger>
            <ui.SelectContent side="top">
              {[10, 20, 30, 40, 50].map(pageSize => (
                <ui.SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </ui.SelectItem>
              ))}
            </ui.SelectContent>
          </ui.Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          {i18n.pagination.pageOf(table.getState().pagination.pageIndex + 1, table.getPageCount())}
        </div>
        <div className="flex items-center space-x-2">
          <ui.Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">{i18n.pagination.goToFirstPage}</span>
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </ui.Button>
          <ui.Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">{i18n.pagination.goToPreviousPage}</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </ui.Button>
          <ui.Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">{i18n.pagination.goToNextPage}</span>
            <ChevronRightIcon className="h-4 w-4" />
          </ui.Button>
          <ui.Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">{i18n.pagination.goToLastPage}</span>
            <DoubleArrowRightIcon className="h-4 w-4" />
          </ui.Button>
        </div>
      </div>
    </div>
  );
}
