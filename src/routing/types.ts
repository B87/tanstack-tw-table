/**
 * Router abstraction for DataTable URL synchronization
 * Allows framework-agnostic routing support
 */
export interface DataTableRouter {
  /**
   * Current URL search parameters
   */
  searchParams: URLSearchParams;

  /**
   * Update URL search parameters
   * @param params - New search parameters to set
   */
  updateSearchParams: (params: URLSearchParams) => void;
}

/**
 * Configuration options for router behavior
 */
export interface DataTableRouterOptions {
  /**
   * Whether routing is enabled
   * @default true if router is provided, false otherwise
   */
  enabled?: boolean;

  /**
   * Whether to sync table state to URL
   * @default true
   */
  syncToUrl?: boolean;

  /**
   * Prefix for URL parameters (e.g., "table_")
   * Useful when multiple tables are on the same page
   * @default ""
   */
  paramPrefix?: string;
}
