/**
 * Internationalization (i18n) support for DataTable components
 *
 * This module provides a framework-agnostic i18n adapter pattern that allows
 * the DataTable component library to work with any i18n solution.
 *
 * @example Basic usage with default English
 * ```tsx
 * import { DataTable } from '@b87/tanstack-tw-table';
 * import { enAdapter } from '@b87/tanstack-tw-table/i18n';
 *
 * <DataTable i18n={enAdapter} {...props} />
 * ```
 *
 * @example With next-intl
 * ```tsx
 * import { useTranslations } from 'next-intl';
 * import { DataTable } from '@b87/tanstack-tw-table';
 * import { createNextIntlAdapter } from '@b87/tanstack-tw-table/i18n';
 *
 * const t = useTranslations('dataTable');
 * <DataTable i18n={createNextIntlAdapter(t)} {...props} />
 * ```
 *
 * @example With react-i18next
 * ```tsx
 * import { useTranslation } from 'react-i18next';
 * import { DataTable } from '@b87/tanstack-tw-table';
 * import { createReactI18nextAdapter } from '@b87/tanstack-tw-table/i18n';
 *
 * const { t } = useTranslation('dataTable');
 * <DataTable i18n={createReactI18nextAdapter(t)} {...props} />
 * ```
 */

export type { DataTableI18nAdapter } from "./types";
export { enAdapter } from "./adapters/en";
export { esAdapter } from "./adapters/es";
export { createNextIntlAdapter } from "./adapters/next-intl";
export { createReactI18nextAdapter } from "./adapters/react-i18next";
