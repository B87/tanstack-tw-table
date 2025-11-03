import type { ColumnFiltersState, SortingState, PaginationState } from "@tanstack/react-table";

/**
 * Serialize table state to URL search params
 */
export function serializeTableState(params: {
  filters?: ColumnFiltersState;
  sorting?: SortingState;
  pagination?: PaginationState;
  globalFilter?: string;
}): URLSearchParams {
  const searchParams = new URLSearchParams();

  // Serialize filters: f=columnId:value1,value2
  if (params.filters && params.filters.length > 0) {
    params.filters.forEach((filter) => {
      const value = Array.isArray(filter.value) ? filter.value.join(",") : String(filter.value);
      searchParams.append("f", `${filter.id}:${value}`);
    });
  }

  // Serialize sorting: s=columnId:asc or s=columnId:desc
  if (params.sorting && params.sorting.length > 0) {
    params.sorting.forEach((sort) => {
      searchParams.append("s", `${sort.id}:${sort.desc ? "desc" : "asc"}`);
    });
  }

  // Serialize pagination: p=pageIndex and ps=pageSize
  if (params.pagination) {
    if (params.pagination.pageIndex > 0) {
      searchParams.set("p", String(params.pagination.pageIndex));
    }
    if (params.pagination.pageSize !== 10) {
      // Only include if different from default
      searchParams.set("ps", String(params.pagination.pageSize));
    }
  }

  // Serialize global filter/search: q=searchTerm
  if (params.globalFilter && params.globalFilter.trim()) {
    searchParams.set("q", params.globalFilter);
  }

  return searchParams;
}

/**
 * Deserialize URL search params to table state
 */
export function deserializeTableState(searchParams: URLSearchParams): {
  filters: ColumnFiltersState;
  sorting: SortingState;
  pagination: PaginationState;
  globalFilter: string;
} {
  const filters: ColumnFiltersState = [];
  const sorting: SortingState = [];
  let pagination: PaginationState = { pageIndex: 0, pageSize: 10 };
  let globalFilter = "";

  // Deserialize filters
  const filterParams = searchParams.getAll("f");
  filterParams.forEach((param) => {
    const [id, ...valueParts] = param.split(":");
    if (id && valueParts.length > 0) {
      const value = valueParts.join(":");
      // Try to parse as array (comma-separated)
      const parsedValue = value.includes(",") ? value.split(",") : value;
      filters.push({ id, value: parsedValue });
    }
  });

  // Deserialize sorting
  const sortParams = searchParams.getAll("s");
  sortParams.forEach((param) => {
    const [id, direction] = param.split(":");
    if (id && direction) {
      sorting.push({ id, desc: direction === "desc" });
    }
  });

  // Deserialize pagination
  const pageIndex = searchParams.get("p");
  const pageSize = searchParams.get("ps");
  if (pageIndex !== null) {
    pagination.pageIndex = parseInt(pageIndex, 10);
  }
  if (pageSize !== null) {
    pagination.pageSize = parseInt(pageSize, 10);
  }

  // Deserialize global filter
  const q = searchParams.get("q");
  if (q) {
    globalFilter = q;
  }

  return { filters, sorting, pagination, globalFilter };
}

/**
 * Merge URL state with default state, preserving saved view state
 */
export function mergeUrlStateWithDefaults(
  urlState: ReturnType<typeof deserializeTableState>,
  defaultState?: {
    filters?: ColumnFiltersState;
    sorting?: SortingState;
    pagination?: PaginationState;
    globalFilter?: string;
  }
): {
  filters: ColumnFiltersState;
  sorting: SortingState;
  pagination: PaginationState;
  globalFilter: string;
} {
  return {
    filters: urlState.filters.length > 0 ? urlState.filters : defaultState?.filters || [],
    sorting: urlState.sorting.length > 0 ? urlState.sorting : defaultState?.sorting || [],
    pagination:
      urlState.pagination.pageIndex > 0 || urlState.pagination.pageSize !== 10
        ? urlState.pagination
        : defaultState?.pagination || { pageIndex: 0, pageSize: 10 },
    globalFilter: urlState.globalFilter || defaultState?.globalFilter || "",
  };
}
