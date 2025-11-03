/**
 * Internationalization adapter interface for DataTable components
 *
 * This interface defines all user-facing text strings that can be customized.
 * Component library consumers can provide their own implementation using any i18n solution.
 */
export interface DataTableI18nAdapter {
  table: {
    noResults: string;
  };

  pagination: {
    rowsSelected: (count: number) => string;
    rowsPerPage: string;
    pageOf: (current: number, total: number) => string;
    goToFirstPage: string;
    goToPreviousPage: string;
    goToNextPage: string;
    goToLastPage: string;
  };

  toolbar: {
    filterPlaceholder: (title: string) => string;
    reset: string;
    deleteSelected: (count: number) => string;
  };

  filters: {
    noResults: string;
    selected: string;
    clearFilters: string;
  };

  dateFilter: {
    operators: {
      on: string;
      before: string;
      after: string;
      between: string;
    };
    filterType: string;
    startDate: string;
    date: string;
    endDate: string;
    clear: string;
    apply: string;
    clearFilter: string;
  };

  views: {
    views: string;
    noSavedViews: string;
    default: string;
    current: (name: string) => string;
    saveCurrentView: string;
    saveViewDialog: {
      title: string;
      description: string;
      nameLabel: string;
      namePlaceholder: string;
      descriptionLabel: string;
      descriptionPlaceholder: string;
      setAsDefault: string;
      cancel: string;
      save: string;
      nameRequired: string;
    };
    saved: string;
    loaded: (name: string) => string;
    deleted: string;
    saveFailed: string;
    deleteFailed: string;
  };

  errors: {
    retry: string;
    somethingWentWrong: string;
    errorDescription: string;
    errorDetails: string;
    reloadPage: string;
    tryAgain: string;
  };

  columns: {
    view: string;
    toggleColumns: string;
  };

  actions: {
    addNew: string;
  };
}
