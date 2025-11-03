"use client";

import * as React from "react";
import { CalendarIcon, XIcon } from "lucide-react";
import type { Column } from "@tanstack/react-table";
import { format } from "date-fns";

import { cn } from "../utils/cn";
import { useDataTableUI } from "./DataTableContext";
import { DataTableI18nAdapter } from "../types";
import { enAdapter } from "../i18n/adapters/en";
import { FilterOperator, getOperatorsForType } from "../query/FilterOperators";

interface DataTableDateFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  operators?: FilterOperator[];
  defaultOperator?: FilterOperator;
  i18n?: DataTableI18nAdapter;
}

interface DateFilterValue {
  operator: FilterOperator;
  date?: Date;
  endDate?: Date; // For DATE_BETWEEN operator
}

export function DataTableDateFilter<TData, TValue>({
  column,
  title,
  operators,
  defaultOperator = FilterOperator.DATE_AFTER,
  i18n = enAdapter,
}: DataTableDateFilterProps<TData, TValue>) {
  const ui = useDataTableUI();
  const [isOpen, setIsOpen] = React.useState(false);
  const [filterValue, setFilterValue] = React.useState<DateFilterValue | undefined>(
    column?.getFilterValue() as DateFilterValue | undefined
  );

  // Get available date operators
  const availableOperators = React.useMemo(() => {
    if (operators) {
      return operators;
    }
    return getOperatorsForType("date").map(op => op.value);
  }, [operators]);

  const currentOperator = filterValue?.operator || defaultOperator;
  const requiresSecondDate = currentOperator === FilterOperator.DATE_BETWEEN;
  const hasActiveFilter = filterValue && filterValue.date;

  const handleOperatorChange = (operator: string) => {
    const newOperator = operator as FilterOperator;
    const newValue: DateFilterValue = {
      operator: newOperator,
      date: filterValue?.date,
      ...(newOperator === FilterOperator.DATE_BETWEEN && { endDate: filterValue?.endDate }),
    };
    setFilterValue(newValue);
    column?.setFilterValue(newValue);
  };

  const handleDateChange = React.useCallback(
    (date: Date | undefined, isEndDate = false) => {
      if (!date) return;

      const newValue: DateFilterValue = {
        operator: currentOperator,
        date: isEndDate ? filterValue?.date : date,
        ...(requiresSecondDate && { endDate: isEndDate ? date : filterValue?.endDate }),
      };

      setFilterValue(newValue);
      column?.setFilterValue(newValue);
    },
    [currentOperator, filterValue, requiresSecondDate, column]
  );

  const handleClear = () => {
    setFilterValue(undefined);
    column?.setFilterValue(undefined);
  };

  const getOperatorLabel = React.useCallback(
    (operator: FilterOperator) => {
      const labels: Record<string, string> = {
        [FilterOperator.DATE_EQUALS]: i18n.dateFilter.operators.on,
        [FilterOperator.DATE_BEFORE]: i18n.dateFilter.operators.before,
        [FilterOperator.DATE_AFTER]: i18n.dateFilter.operators.after,
        [FilterOperator.DATE_BETWEEN]: i18n.dateFilter.operators.between,
      };
      return labels[operator] || "Filter";
    },
    [i18n]
  );

  const formatDateDisplay = React.useCallback(() => {
    if (!filterValue?.date) return null;

    const startDate = format(filterValue.date, "MMM dd, yyyy");

    if (requiresSecondDate && filterValue.endDate) {
      const endDate = format(filterValue.endDate, "MMM dd, yyyy");
      return `${startDate} - ${endDate}`;
    }

    return startDate;
  }, [filterValue, requiresSecondDate]);

  return (
    <ui.Popover open={isOpen} onOpenChange={setIsOpen}>
      <ui.PopoverTrigger asChild>
        <ui.Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 border-dashed justify-start text-left font-normal",
            hasActiveFilter && "border-solid bg-accent"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="truncate">
            {title}
            {hasActiveFilter && (
              <>
                {": "}
                <span className="font-medium">{formatDateDisplay()}</span>
              </>
            )}
          </span>
          {hasActiveFilter && (
            <span
              role="button"
              tabIndex={0}
              aria-label={i18n.dateFilter.clearFilter}
              className="ml-auto h-4 w-4 p-0 cursor-pointer hover:bg-muted rounded-sm flex items-center justify-center"
              onClick={e => {
                e.stopPropagation();
                handleClear();
              }}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClear();
                }
              }}
            >
              <XIcon className="h-3 w-3" />
            </span>
          )}
        </ui.Button>
      </ui.PopoverTrigger>
      <ui.PopoverContent className="w-auto p-0" align="start">
        <div className="space-y-4 p-4">
          {/* Operator Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{i18n.dateFilter.filterType}</label>
            <ui.Select value={currentOperator} onValueChange={handleOperatorChange}>
              <ui.SelectTrigger className="w-full">
                <ui.SelectValue />
              </ui.SelectTrigger>
              <ui.SelectContent>
                {availableOperators.map(operator => (
                  <ui.SelectItem key={operator} value={operator}>
                    {getOperatorLabel(operator)}
                  </ui.SelectItem>
                ))}
              </ui.SelectContent>
            </ui.Select>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {requiresSecondDate ? i18n.dateFilter.startDate : i18n.dateFilter.date}
            </label>
            <ui.Calendar
              mode="single"
              selected={filterValue?.date}
              onSelect={(date: Date) => handleDateChange(date, false)}
              className="rounded-md border"
            />
          </div>

          {/* End Date (only for DATE_BETWEEN) */}
          {requiresSecondDate && (
            <div className="space-y-2">
              <label className="text-sm font-medium">{i18n.dateFilter.endDate}</label>
              <ui.Calendar
                mode="single"
                selected={filterValue?.endDate}
                onSelect={(date: Date) => handleDateChange(date, true)}
                className="rounded-md border"
                disabled={(date: Date) => (filterValue?.date ? date < filterValue.date : false)}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-2">
            <ui.Button variant="outline" size="sm" onClick={handleClear}>
              {i18n.dateFilter.clear}
            </ui.Button>
            <ui.Button size="sm" onClick={() => setIsOpen(false)}>
              {i18n.dateFilter.apply}
            </ui.Button>
          </div>
        </div>
      </ui.PopoverContent>
    </ui.Popover>
  );
}
