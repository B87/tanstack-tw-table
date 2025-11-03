import type { DataTableI18nAdapter } from "../types";

/**
 * Default English adapter for DataTable components
 *
 * This adapter provides all English text strings used throughout the data table.
 * Use this as the default or as a reference for creating custom adapters.
 */
export const enAdapter: DataTableI18nAdapter = {
  table: {
    noResults: "No results.",
  },

  pagination: {
    rowsSelected: count => {
      if (count === 0) return "No rows selected";
      if (count === 1) return "1 row selected";
      return `${count} rows selected`;
    },
    rowsPerPage: "Rows per page",
    pageOf: (current, total) => `Page ${current} of ${total}`,
    goToFirstPage: "Go to first page",
    goToPreviousPage: "Go to previous page",
    goToNextPage: "Go to next page",
    goToLastPage: "Go to last page",
  },

  toolbar: {
    filterPlaceholder: title => `Filter ${title}...`,
    reset: "Reset",
    deleteSelected: count => `Delete (${count})`,
  },

  filters: {
    noResults: "No results found.",
    selected: "selected",
    clearFilters: "Clear filters",
  },

  dateFilter: {
    operators: {
      on: "On",
      before: "Before",
      after: "After",
      between: "Between",
    },
    filterType: "Filter Type",
    startDate: "Start Date",
    date: "Date",
    endDate: "End Date",
    clear: "Clear",
    apply: "Apply",
    clearFilter: "Clear filter",
  },

  views: {
    views: "Views",
    noSavedViews: "No saved views",
    default: "Default",
    current: name => `Current: ${name}`,
    saveCurrentView: "Save Current View",
    saveViewDialog: {
      title: "Save Current View",
      description: "Save the current filter, sort, and column settings as a reusable view.",
      nameLabel: "Name *",
      namePlaceholder: "Enter view name",
      descriptionLabel: "Description",
      descriptionPlaceholder: "Optional description",
      setAsDefault: "Set as default view",
      cancel: "Cancel",
      save: "Save View",
      nameRequired: "Please enter a view name",
    },
    saved: "View saved successfully",
    loaded: name => `Loaded view: ${name}`,
    deleted: "View deleted successfully",
    saveFailed: "Failed to save view",
    deleteFailed: "Failed to delete view",
  },

  errors: {
    retry: "Retry",
    somethingWentWrong: "Something went wrong with the data table",
    errorDescription:
      "We encountered an error while rendering the table. This might be due to invalid data or a temporary issue. Please try again.",
    errorDetails: "Error Details (Development)",
    reloadPage: "Reload Page",
    tryAgain: "Try Again",
  },

  columns: {
    view: "View",
    toggleColumns: "Toggle columns",
  },

  actions: {
    addNew: "Add New",
  },
};
