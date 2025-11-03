"use client";

import { useMemo, useCallback } from "react";
import type { DataTableRouter } from "../types";

// Import directly from next/navigation
// This will be tree-shaken when not used in Next.js projects
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Next.js App Router adapter for DataTable routing
 *
 * Provides URL synchronization for DataTable state using Next.js App Router's
 * useRouter and useSearchParams hooks.
 *
 * @example
 * ```tsx
 * import { DataTable } from "@b87/tanstack-tw-table";
 * import { createNextRouter } from "@b87/tanstack-tw-table/routing";
 *
 * export function UsersTable() {
 *   return (
 *     <DataTable
 *       data={users}
 *       columns={columns}
 *       tableId="users"
 *       router={createNextRouter()}
 *     />
 *   );
 * }
 * ```
 *
 * @returns DataTableRouter instance for Next.js
 */
export function createNextRouter(): DataTableRouter {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Memoize updateSearchParams to keep stable reference
  const updateSearchParams = useCallback(
    (params: URLSearchParams) => {
      const url = new URL(window.location.href);
      url.search = params.toString();
      router.replace(url.pathname + url.search);
    },
    [router]
  );

  // Memoize the router object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      searchParams: new URLSearchParams(searchParams.toString()),
      updateSearchParams,
    }),
    [searchParams, updateSearchParams]
  );
}
