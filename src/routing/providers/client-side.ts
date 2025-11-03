import { useState, useCallback } from "react";
import type { DataTableRouter } from "../types";

/**
 * Client-side only router (no URL synchronization)
 *
 * Use this when you don't want to sync table state to the URL, or when you're
 * not using a routing library. State is kept in React state only.
 *
 * @example
 * ```tsx
 * import { DataTable } from "@b87/tanstack-tw-table";
 * import { createClientSideRouter } from "@b87/tanstack-tw-table/routing";
 *
 * export function UsersTable() {
 *   return (
 *     <DataTable
 *       data={users}
 *       columns={columns}
 *       tableId="users"
 *       router={createClientSideRouter()}
 *     />
 *   );
 * }
 * ```
 *
 * @returns DataTableRouter instance for client-side only state
 */
export function createClientSideRouter(): DataTableRouter {
  const [params, setParams] = useState<URLSearchParams>(new URLSearchParams());

  return {
    searchParams: params,
    updateSearchParams: useCallback((newParams: URLSearchParams) => {
      setParams(new URLSearchParams(newParams));
    }, []),
  };
}
