import type { DataTableRouter } from "../types";

type ReactRouterDomModule = typeof import("react-router-dom");

let cachedReactRouterDom: ReactRouterDomModule | null = null;

const getReactRouterDom = (): ReactRouterDomModule => {
  if (cachedReactRouterDom) {
    return cachedReactRouterDom;
  }

  try {
    cachedReactRouterDom = require("react-router-dom") as ReactRouterDomModule;
    return cachedReactRouterDom;
  } catch (error) {
    throw new Error(
      "react-router-dom is not installed. Install it to use createReactRouterAdapter().",
    );
  }
};

/**
 * React Router adapter for DataTable routing
 *
 * Provides URL synchronization for DataTable state using React Router's
 * useSearchParams hook.
 *
 * @example
 * ```tsx
 * import { DataTable } from "@b87/tanstack-tw-table";
 * import { createReactRouterAdapter } from "@b87/tanstack-tw-table/routing";
 *
 * export function UsersTable() {
 *   return (
 *     <DataTable
 *       data={users}
 *       columns={columns}
 *       tableId="users"
 *       router={createReactRouterAdapter()}
 *     />
 *   );
 * }
 * ```
 *
 * @returns DataTableRouter instance for React Router
 */
export function createReactRouterAdapter(): DataTableRouter {
  const { useSearchParams } = getReactRouterDom();
  const [searchParams, setSearchParams] = useSearchParams();

  return {
    searchParams,
    updateSearchParams: (params: URLSearchParams) => {
      setSearchParams(params);
    },
  };
}
