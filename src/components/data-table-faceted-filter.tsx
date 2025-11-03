"use client";

import * as React from "react";
import { CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import type { Column } from "@tanstack/react-table";

import { DataTableI18nAdapter } from "../types";
import { enAdapter } from "../i18n/adapters/en";
import { useDataTableUI } from "./DataTableContext";
import { cn } from "../utils/cn";

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  i18n?: DataTableI18nAdapter;
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  i18n = enAdapter,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const ui = useDataTableUI();
  const facets = column?.getFacetedUniqueValues();
  const selectedValues = new Set(column?.getFilterValue() as string[]);

  return (
    <ui.Popover>
      <ui.PopoverTrigger asChild>
        <ui.Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <ui.Separator orientation="vertical" className="mx-2 h-4" />
              <ui.Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selectedValues.size}
              </ui.Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <ui.Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedValues.size} {i18n.filters.selected}
                  </ui.Badge>
                ) : (
                  options
                    .filter(option => selectedValues.has(option.value))
                    .map(option => (
                      <ui.Badge variant="secondary" key={option.value} className="rounded-sm px-1 font-normal">
                        {option.label}
                      </ui.Badge>
                    ))
                )}
              </div>
            </>
          )}
        </ui.Button>
      </ui.PopoverTrigger>
      <ui.PopoverContent className="w-[200px] p-0" align="start">
        <ui.Command>
          <ui.CommandInput placeholder={title} />
          <ui.CommandList>
            <ui.CommandEmpty>{i18n.filters.noResults}</ui.CommandEmpty>
            <ui.CommandGroup>
              {options.map(option => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <ui.CommandItem
                    key={option.value}
                    onSelect={() => {
                      const currentValues = new Set(column?.getFilterValue() as string[]);
                      if (isSelected) {
                        currentValues.delete(option.value);
                      } else {
                        currentValues.add(option.value);
                      }
                      const filterValues = Array.from(currentValues);
                      column?.setFilterValue(filterValues.length ? filterValues : undefined);
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className={cn("h-4 w-4")} />
                    </div>
                    {option.icon && <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                    <span>{option.label}</span>
                    {facets?.get(option.value) && (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                        {facets.get(option.value)}
                      </span>
                    )}
                  </ui.CommandItem>
                );
              })}
            </ui.CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <ui.CommandSeparator />
                <ui.CommandGroup>
                  <ui.CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center"
                  >
                    {i18n.filters.clearFilters}
                  </ui.CommandItem>
                </ui.CommandGroup>
              </>
            )}
          </ui.CommandList>
        </ui.Command>
      </ui.PopoverContent>
    </ui.Popover>
  );
}
