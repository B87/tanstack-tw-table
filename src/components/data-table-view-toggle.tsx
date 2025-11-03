"use client";

import { useDataTableUI } from "./DataTableContext";
import { Table } from "@tanstack/react-table";
import { DataTableI18nAdapter } from "../types";
import { enAdapter } from "../i18n/adapters/en";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";

interface DataTableViewToggleProps<TData> {
  table: Table<TData>;
  i18n?: DataTableI18nAdapter;
}

export function DataTableViewToggle<TData>({ table, i18n = enAdapter }: DataTableViewToggleProps<TData>) {
  const ui = useDataTableUI();
  return (
    <ui.DropdownMenu>
      <ui.DropdownMenuTrigger asChild>
        <ui.Button variant="outline" size="sm" className="ml-auto hidden h-8 lg:flex">
          <MixerHorizontalIcon className="mr-2 h-4 w-4" />
          {i18n.columns.view}
        </ui.Button>
      </ui.DropdownMenuTrigger>
      <ui.DropdownMenuContent align="end" className="w-[150px]">
        <ui.DropdownMenuLabel>{i18n.columns.toggleColumns}</ui.DropdownMenuLabel>
        <ui.DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(column => typeof column.accessorFn !== "undefined" && column.getCanHide())
          .map(column => {
            // Get the column header - use translated header if available, fallback to column ID
            const header = column.columnDef.header;
            const displayName = typeof header === "string" ? header : column.id;

            return (
              <ui.DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(value: boolean) => column.toggleVisibility(value)}
              >
                {displayName}
              </ui.DropdownMenuCheckboxItem>
            );
          })}
      </ui.DropdownMenuContent>
    </ui.DropdownMenu>
  );
}
