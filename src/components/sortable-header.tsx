"use client";

import React from "react";
import { type Header, type Column } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";

import { useDataTableUI } from "./DataTableContext";
import { SortIcon } from "./sort-icon";
import { cn } from "../utils/cn";

interface SortableHeaderProps<TData> {
  header: Header<TData, unknown>;
  column: Column<TData, unknown>;
  isLoading?: boolean;
  children: React.ReactNode;
}

export function SortableHeader<TData>({ header, column, isLoading = false, children }: SortableHeaderProps<TData>) {
  const ui = useDataTableUI();
  const sortDirection = column.getIsSorted();
  const canSort = column.getCanSort();

  if (!canSort) {
    return <span className="font-medium">{children}</span>;
  }

  return (
    <ui.Button
      variant="ghost"
      size="sm"
      onClick={column.getToggleSortingHandler()}
      disabled={isLoading}
      className="h-auto p-2 -mx-2 text-left justify-start font-medium hover:bg-muted/50"
      aria-label={`Sort by ${column.id} ${sortDirection === "desc" ? "ascending" : "descending"}`}
    >
      {children}
      <SortIcon
        direction={sortDirection}
        className={cn(
          "ml-1 h-3 w-3 transition-opacity",
          isLoading && "opacity-50",
          !sortDirection && "text-muted-foreground"
        )}
      />
      {isLoading && <Loader2 className="ml-1 h-3 w-3 animate-spin" />}
    </ui.Button>
  );
}
