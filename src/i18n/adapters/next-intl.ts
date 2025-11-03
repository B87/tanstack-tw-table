import type { DataTableI18nAdapter } from "../types";

/**
 * Helper factory for creating a DataTable i18n adapter from next-intl
 *
 * @example
 * ```tsx
 * import { useTranslations } from 'next-intl';
 * import { createNextIntlAdapter } from '@b87/tanstack-tw-table/i18n';
 *
 * function MyComponent() {
 *   const t = useTranslations('dataTable');
 *   const i18n = createNextIntlAdapter(t);
 *
 *   return <DataTable i18n={i18n} {...props} />;
 * }
 * ```
 *
 * Expected translation file structure (messages/en/dataTable.json):
 * ```json
 * {
 *   "table": {
 *     "noResults": "No results."
 *   },
 *   "pagination": {
 *     "rowsSelected": "{count, plural, =0 {No rows selected} one {1 row selected} other {# rows selected}}",
 *     "rowsPerPage": "Rows per page",
 *     "pageOf": "Page {current} of {total}",
 *     ...
 *   },
 *   ...
 * }
 * ```
 */
export function createNextIntlAdapter(t: (key: string, values?: Record<string, any>) => string): DataTableI18nAdapter {
  return {
    table: {
      noResults: t("table.noResults"),
    },

    pagination: {
      rowsSelected: count => t("pagination.rowsSelected", { count }),
      rowsPerPage: t("pagination.rowsPerPage"),
      pageOf: (current, total) => t("pagination.pageOf", { current, total }),
      goToFirstPage: t("pagination.goToFirstPage"),
      goToPreviousPage: t("pagination.goToPreviousPage"),
      goToNextPage: t("pagination.goToNextPage"),
      goToLastPage: t("pagination.goToLastPage"),
    },

    toolbar: {
      filterPlaceholder: title => t("toolbar.filterPlaceholder", { title }),
      reset: t("toolbar.reset"),
      deleteSelected: count => t("toolbar.deleteSelected", { count }),
    },

    filters: {
      noResults: t("filters.noResults"),
      selected: t("filters.selected"),
      clearFilters: t("filters.clearFilters"),
    },

    dateFilter: {
      operators: {
        on: t("dateFilter.operators.on"),
        before: t("dateFilter.operators.before"),
        after: t("dateFilter.operators.after"),
        between: t("dateFilter.operators.between"),
      },
      filterType: t("dateFilter.filterType"),
      startDate: t("dateFilter.startDate"),
      date: t("dateFilter.date"),
      endDate: t("dateFilter.endDate"),
      clear: t("dateFilter.clear"),
      apply: t("dateFilter.apply"),
      clearFilter: t("dateFilter.clearFilter"),
    },

    views: {
      views: t("views.views"),
      noSavedViews: t("views.noSavedViews"),
      default: t("views.default"),
      current: name => t("views.current", { name }),
      saveCurrentView: t("views.saveCurrentView"),
      saveViewDialog: {
        title: t("views.saveViewDialog.title"),
        description: t("views.saveViewDialog.description"),
        nameLabel: t("views.saveViewDialog.nameLabel"),
        namePlaceholder: t("views.saveViewDialog.namePlaceholder"),
        descriptionLabel: t("views.saveViewDialog.descriptionLabel"),
        descriptionPlaceholder: t("views.saveViewDialog.descriptionPlaceholder"),
        setAsDefault: t("views.saveViewDialog.setAsDefault"),
        cancel: t("views.saveViewDialog.cancel"),
        save: t("views.saveViewDialog.save"),
        nameRequired: t("views.saveViewDialog.nameRequired"),
      },
      saved: t("views.saved"),
      loaded: name => t("views.loaded", { name }),
      deleted: t("views.deleted"),
      saveFailed: t("views.saveFailed"),
      deleteFailed: t("views.deleteFailed"),
    },

    errors: {
      retry: t("errors.retry"),
      somethingWentWrong: t("errors.somethingWentWrong"),
      errorDescription: t("errors.errorDescription"),
      errorDetails: t("errors.errorDetails"),
      reloadPage: t("errors.reloadPage"),
      tryAgain: t("errors.tryAgain"),
    },

    columns: {
      view: t("columns.view"),
      toggleColumns: t("columns.toggleColumns"),
    },

    actions: {
      addNew: t("actions.addNew"),
    },
  };
}
