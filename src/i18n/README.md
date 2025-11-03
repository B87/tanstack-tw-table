# DataTable Internationalization (i18n)

This directory provides a framework-agnostic i18n adapter pattern for the DataTable component library.

## Overview

The DataTable components support internationalization through an **adapter pattern** that works with any i18n solution or none at all. All components default to English, making the library work out-of-the-box.

## Usage

### Option 1: Default English (Zero Configuration)

```tsx
import { DataTable, enAdapter } from "@/components/data-table";

// Uses English by default - no configuration needed
<DataTable {...props} />;
```

### Option 2: Spanish Adapter

```tsx
import { DataTable, esAdapter } from "@/components/data-table";

<DataTable i18n={esAdapter} {...props} />;
```

### Option 3: With next-intl (Recommended for this project)

```tsx
"use client";

import { useTranslations } from "next-intl";
import { DataTable, createNextIntlAdapter } from "@/components/data-table";

function MyComponent() {
  const t = useTranslations("dataTable");
  const i18n = createNextIntlAdapter(t);

  return <DataTable i18n={i18n} {...props} />;
}
```

**Required translation file structure** (`messages/en/dataTable.json`):

```json
{
  "table": {
    "noResults": "No results."
  },
  "pagination": {
    "rowsSelected": "{count, plural, =0 {No rows selected} one {1 row selected} other {# rows selected}}",
    "rowsPerPage": "Rows per page",
    "pageOf": "Page {current} of {total}",
    "goToFirstPage": "Go to first page",
    "goToPreviousPage": "Go to previous page",
    "goToNextPage": "Go to next page",
    "goToLastPage": "Go to last page"
  },
  "toolbar": {
    "filterPlaceholder": "Filter {title}...",
    "reset": "Reset",
    "deleteSelected": "Delete ({count})"
  },
  "filters": {
    "noResults": "No results found.",
    "selected": "selected",
    "clearFilters": "Clear filters"
  },
  "dateFilter": {
    "operators": {
      "on": "On",
      "before": "Before",
      "after": "After",
      "between": "Between"
    },
    "filterType": "Filter Type",
    "startDate": "Start Date",
    "date": "Date",
    "endDate": "End Date",
    "clear": "Clear",
    "apply": "Apply",
    "clearFilter": "Clear filter"
  },
  "views": {
    "views": "Views",
    "noSavedViews": "No saved views",
    "default": "Default",
    "current": "Current: {name}",
    "saveCurrentView": "Save Current View",
    "saveViewDialog": {
      "title": "Save Current View",
      "description": "Save the current filter, sort, and column settings as a reusable view.",
      "nameLabel": "Name *",
      "namePlaceholder": "Enter view name",
      "descriptionLabel": "Description",
      "descriptionPlaceholder": "Optional description",
      "setAsDefault": "Set as default view",
      "cancel": "Cancel",
      "save": "Save View",
      "nameRequired": "Please enter a view name"
    },
    "saved": "View saved successfully",
    "loaded": "Loaded view: {name}",
    "deleted": "View deleted successfully",
    "saveFailed": "Failed to save view",
    "deleteFailed": "Failed to delete view"
  },
  "errors": {
    "retry": "Retry",
    "somethingWentWrong": "Something went wrong with the data table",
    "errorDescription": "We encountered an error while rendering the table. This might be due to invalid data or a temporary issue. Please try again.",
    "errorDetails": "Error Details (Development)",
    "reloadPage": "Reload Page",
    "tryAgain": "Try Again"
  },
  "columns": {
    "view": "View",
    "toggleColumns": "Toggle columns"
  },
  "actions": {
    "addNew": "Add New"
  }
}
```

### Option 4: With react-i18next

```tsx
import { useTranslation } from "react-i18next";
import { DataTable, createReactI18nextAdapter } from "@/components/data-table";

function MyComponent() {
  const { t } = useTranslation("dataTable");
  const i18n = createReactI18nextAdapter(t);

  return <DataTable i18n={i18n} {...props} />;
}
```

### Option 5: Custom Adapter

```tsx
import { DataTable, type DataTableI18nAdapter } from "@/components/data-table";

const frenchAdapter: DataTableI18nAdapter = {
  table: {
    noResults: "Aucun résultat.",
  },
  pagination: {
    rowsSelected: count => {
      if (count === 0) return "Aucune ligne sélectionnée";
      if (count === 1) return "1 ligne sélectionnée";
      return `${count} lignes sélectionnées`;
    },
    rowsPerPage: "Lignes par page",
    pageOf: (current, total) => `Page ${current} sur ${total}`,
    goToFirstPage: "Aller à la première page",
    goToPreviousPage: "Aller à la page précédente",
    goToNextPage: "Aller à la page suivante",
    goToLastPage: "Aller à la dernière page",
  },
  // ... rest of the translations
};

<DataTable i18n={frenchAdapter} {...props} />;
```

## Architecture

### Type System

All translatable strings are defined in the `DataTableI18nAdapter` interface in [types.ts](./types.ts).

This ensures:

- ✅ Type safety - TypeScript checks all translations at compile time
- ✅ Completeness - You can't miss any strings
- ✅ IDE autocomplete - Full IntelliSense support

### Default Adapters

- **[adapters/en.ts](./adapters/en.ts)** - English (default)
- **[adapters/es.ts](./adapters/es.ts)** - Spanish

### Framework Helpers

- **[adapters/next-intl.ts](./adapters/next-intl.ts)** - `createNextIntlAdapter()` factory
- **[adapters/react-i18next.ts](./adapters/react-i18next.ts)** - `createReactI18nextAdapter()` factory

## Benefits

### ✅ Framework Agnostic

Works with next-intl, react-i18next, FormatJS, or any custom i18n solution.

### ✅ Zero Dependencies

No i18n library required for basic usage. The library works standalone with English defaults.

### ✅ Type Safe

TypeScript ensures all strings are translated and prevents typos.

### ✅ Tree Shakeable

Only import what you use. Unused adapters won't bloat your bundle.

### ✅ Backward Compatible

Existing code continues to work with English defaults.

### ✅ NPM Package Ready

Perfect for publishing as a standalone component library.

## Adding New Languages

1. Create a new adapter file: `adapters/fr.ts`
2. Implement the `DataTableI18nAdapter` interface
3. Export it from `index.ts`
4. Use it: `<DataTable i18n={frAdapter} />`

Example:

```typescript
// adapters/fr.ts
import type { DataTableI18nAdapter } from "../types";

export const frAdapter: DataTableI18nAdapter = {
  table: {
    noResults: "Aucun résultat.",
  },
  // ... implement all properties
};
```

## Migration Guide

If you're migrating from hardcoded strings:

**Before:**

```tsx
<DataTable {...props} />
// All strings were hardcoded in English
```

**After (with next-intl):**

```tsx
const t = useTranslations("dataTable");
<DataTable i18n={createNextIntlAdapter(t)} {...props} />;
```

**After (with Spanish):**

```tsx
import { esAdapter } from "@/components/data-table";
<DataTable i18n={esAdapter} {...props} />;
```

## Testing

When writing tests, you can use the default English adapter or provide a custom mock:

```tsx
import { enAdapter } from "@/components/data-table";

it("should render with custom translations", () => {
  const mockI18n = {
    ...enAdapter,
    table: { noResults: "Custom message" },
  };

  render(<DataTable i18n={mockI18n} {...props} />);
  expect(screen.getByText("Custom message")).toBeInTheDocument();
});
```
