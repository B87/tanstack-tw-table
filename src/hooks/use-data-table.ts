"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";

import type {
  DataTableView,
  DataTableViewStorage,
  ServerSortParams,
  ServerFilterParams,
  ServerPaginationParams,
} from "../types";
import { localStorageProvider } from "../storage/local-storage-provider";
import type { DataTableRouter } from "../routing/types";
import { serializeTableState, deserializeTableState } from "../utils/url-sync";

interface UseDataTableProps<TData, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  pageCount: number;
  tableId: string;
  router?: DataTableRouter; // NEW: Optional router for URL sync
  storageProvider?: DataTableViewStorage;
  defaultView?: Partial<DataTableView>;
  manualPagination?: boolean;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  enableRowSelection?: boolean;
  onSortingChange?: (params: ServerSortParams) => Promise<void>;
  onFilterChange?: (params: ServerFilterParams) => Promise<void>;
  onPaginationChange?: (params: ServerPaginationParams) => Promise<void>;
  urlSync?: boolean | {
    filters?: boolean;
    sorting?: boolean;
    pagination?: boolean;
    search?: boolean;
  };
}

export function useDataTable<TData, TValue>({
  data,
  columns,
  pageCount,
  tableId,
  router, // NEW: Optional router
  storageProvider = localStorageProvider,
  defaultView,
  manualPagination = true,
  manualSorting = true,
  manualFiltering = true,
  enableRowSelection = true,
  onSortingChange,
  onFilterChange,
  onPaginationChange,
  urlSync,
}: UseDataTableProps<TData, TValue>) {

  // Normalize urlSync config
  const urlSyncConfig = useMemo(() => {
    if (!urlSync || !router) return null;
    if (urlSync === true) {
      return { filters: true, sorting: true, pagination: true, search: true };
    }
    return {
      filters: urlSync.filters ?? false,
      sorting: urlSync.sorting ?? false,
      pagination: urlSync.pagination ?? false,
      search: urlSync.search ?? false,
    };
  }, [urlSync, router]);

  // Read initial state from URL (only on mount)
  const initialUrlState = useMemo(() => {
    if (!urlSyncConfig || !router) return null;
    return deserializeTableState(router.searchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount

  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(defaultView?.columnVisibility ?? {});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    initialUrlState?.filters ?? defaultView?.columnFilters ?? []
  );
  const [sorting, setSorting] = useState<SortingState>(
    initialUrlState?.sorting ?? defaultView?.sorting ?? []
  );
  const [pagination, setPagination] = useState<PaginationState>(
    initialUrlState?.pagination ?? defaultView?.pagination ?? {
      pageIndex: 0,
      pageSize: 10,
    }
  );
  const [globalFilter, setGlobalFilter] = useState(
    initialUrlState?.globalFilter ?? defaultView?.globalFilter ?? ""
  );
  const [savedViews, setSavedViews] = useState<DataTableView[]>([]);

  // Initialize currentViewId from router if available
  const [currentViewId, setCurrentViewId] = useState<string | null>(() => {
    if (!router) return null;
    return router.searchParams.get("view");
  });

  // Refs to track current state without causing re-renders
  const columnFiltersRef = useRef(columnFilters);
  const sortingRef = useRef(sorting);
  const paginationRef = useRef(pagination);
  const globalFilterRef = useRef(globalFilter);

  // Keep refs in sync with state
  useEffect(() => {
    columnFiltersRef.current = columnFilters;
  }, [columnFilters]);

  useEffect(() => {
    sortingRef.current = sorting;
  }, [sorting]);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  useEffect(() => {
    globalFilterRef.current = globalFilter;
  }, [globalFilter]);

  // Custom sorting handler for server-side sorting
  const handleSortingChange = useCallback(
    async (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
      const newSortingState = typeof updaterOrValue === "function" ? updaterOrValue(sortingRef.current) : updaterOrValue;

      setSorting(newSortingState);

      if (onSortingChange && manualSorting) {
        try {
          await onSortingChange({
            sorting: newSortingState,
            state: {
              columnFilters: columnFiltersRef.current,
              sorting: newSortingState,
              pagination: paginationRef.current,
              globalFilter: globalFilterRef.current,
            },
            resetPagination: true,
          });
        } catch (error) {
          console.error("Server-side sorting failed:", error);
          // Revert sorting state on error
          setSorting(defaultView?.sorting ?? []);
        }
      }
    },
    [onSortingChange, manualSorting, defaultView?.sorting]
  );

  // Custom filter handler for server-side filtering
  const handleColumnFiltersChange = useCallback(
    async (updaterOrValue: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => {
      const newFiltersState = typeof updaterOrValue === "function" ? updaterOrValue(columnFiltersRef.current) : updaterOrValue;

      setColumnFilters(newFiltersState);

      if (onFilterChange && manualFiltering) {
        try {
          await onFilterChange({
            columnFilters: newFiltersState,
            globalFilter: globalFilterRef.current,
            state: {
              columnFilters: newFiltersState,
              sorting: sortingRef.current,
              pagination: paginationRef.current,
              globalFilter: globalFilterRef.current,
            },
          });
        } catch (error) {
          console.error("Server-side filtering failed:", error);
          // Revert filter state on error
          setColumnFilters(defaultView?.columnFilters ?? []);
        }
      }
    },
    [onFilterChange, manualFiltering, defaultView?.columnFilters]
  );

  // Custom global filter handler for server-side search
  const handleGlobalFilterChange = useCallback(
    async (updaterOrValue: string | ((old: string) => string)) => {
      const newGlobalFilter = typeof updaterOrValue === "function" ? updaterOrValue(globalFilterRef.current) : updaterOrValue;

      setGlobalFilter(newGlobalFilter);

      if (onFilterChange && manualFiltering) {
        try {
          await onFilterChange({
            columnFilters: columnFiltersRef.current,
            globalFilter: newGlobalFilter,
            state: {
              columnFilters: columnFiltersRef.current,
              sorting: sortingRef.current,
              pagination: paginationRef.current,
              globalFilter: newGlobalFilter,
            },
          });
        } catch (error) {
          console.error("Server-side search failed:", error);
          // Revert global filter state on error
          setGlobalFilter(defaultView?.globalFilter ?? "");
        }
      }
    },
    [onFilterChange, manualFiltering, defaultView?.globalFilter]
  );

  // Custom pagination handler for server-side pagination
  const handlePaginationChange = useCallback(
    async (updaterOrValue: PaginationState | ((old: PaginationState) => PaginationState)) => {
      const newPaginationState = typeof updaterOrValue === "function" ? updaterOrValue(paginationRef.current) : updaterOrValue;

      setPagination(newPaginationState);

      if (onPaginationChange && manualPagination) {
        try {
          await onPaginationChange({
            pagination: newPaginationState,
            state: {
              columnFilters: columnFiltersRef.current,
              sorting: sortingRef.current,
              pagination: newPaginationState,
              globalFilter: globalFilterRef.current,
            },
          });
        } catch (error) {
          console.error("Server-side pagination failed:", error);
          // Revert pagination state on error
          setPagination(defaultView?.pagination ?? { pageIndex: 0, pageSize: 10 });
        }
      }
    },
    [onPaginationChange, manualPagination, defaultView?.pagination]
  );

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount ?? -1,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
      globalFilter,
    },
    enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    onGlobalFilterChange: handleGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination,
    manualSorting,
    manualFiltering,
    enableMultiSort: false, // Disable multi-column sorting for predictable UX
    enableSortingRemoval: true, // Allow clearing sort by clicking third time
  });

  // Function to update URL with current view ID (only if router is provided)
  const updateUrlWithViewId = useCallback(
    (viewId: string | null) => {
      if (!router) return; // No router = no URL sync

      const params = new URLSearchParams(router.searchParams);
      if (viewId) {
        params.set("view", viewId);
      } else {
        params.delete("view");
      }
      router.updateSearchParams(params);
    },
    [router]
  );

  const loadViews = useCallback(async () => {
    try {
      const views = await storageProvider.loadViews(tableId);
      setSavedViews(views);
    } catch (error) {
      console.error("Failed to load views:", error);
    }
  }, [tableId, storageProvider]);

  const saveView = useCallback(
    async (viewData: Omit<DataTableView, "id" | "createdAt" | "updatedAt">) => {
      try {
        const view: DataTableView = {
          ...viewData,
          id: `${tableId}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await storageProvider.saveView(tableId, view);
        await loadViews();
        setCurrentViewId(view.id);
        updateUrlWithViewId(view.id);
      } catch (error) {
        console.error("Failed to save view:", error);
        throw error;
      }
    },
    [tableId, storageProvider, loadViews, updateUrlWithViewId]
  );

  const loadView = useCallback(
    (view: DataTableView) => {
      setColumnFilters(view.columnFilters);
      setSorting(view.sorting);
      setColumnVisibility(view.columnVisibility);
      setPagination(view.pagination);
      setGlobalFilter(view.globalFilter);
      setCurrentViewId(view.id);
      updateUrlWithViewId(view.id);
    },
    [updateUrlWithViewId]
  );

  const deleteView = useCallback(
    async (viewId: string) => {
      try {
        await storageProvider.deleteView(tableId, viewId);
        await loadViews();
        if (currentViewId === viewId) {
          setCurrentViewId(null);
          updateUrlWithViewId(null);
        }
      } catch (error) {
        console.error("Failed to delete view:", error);
        throw error;
      }
    },
    [tableId, storageProvider, loadViews, currentViewId, updateUrlWithViewId]
  );

  const resetFilters = useCallback(() => {
    setColumnFilters([]);
    setSorting([]);
    setColumnVisibility({});
    setPagination({ pageIndex: 0, pageSize: 10 });
    setGlobalFilter("");
    setCurrentViewId(null);
    updateUrlWithViewId(null);
  }, [updateUrlWithViewId]);

  const getCurrentViewState = useCallback((): Partial<DataTableView> => {
    return {
      columnFilters,
      sorting,
      columnVisibility,
      pagination,
      globalFilter,
    };
  }, [columnFilters, sorting, columnVisibility, pagination, globalFilter]);

  useEffect(() => {
    loadViews();
  }, [loadViews]);

  // URL Sync: Debounced sync of table state to URL
  const updateUrlTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastUrlStateRef = useRef<string>("");

  useEffect(() => {
    // Skip if URL sync is not enabled or if a view is loaded
    if (!urlSyncConfig || currentViewId || !router) return;

    // Clear existing timeout
    if (updateUrlTimeoutRef.current) {
      clearTimeout(updateUrlTimeoutRef.current);
    }

    // Debounce URL updates (300ms) to avoid excessive history entries
    updateUrlTimeoutRef.current = setTimeout(() => {
      const searchParams = serializeTableState({
        filters: urlSyncConfig.filters ? columnFilters : undefined,
        sorting: urlSyncConfig.sorting ? sorting : undefined,
        pagination: urlSyncConfig.pagination ? pagination : undefined,
        globalFilter: urlSyncConfig.search ? globalFilter : undefined,
      });

      const newUrlState = searchParams.toString();

      // Only update if the URL state has actually changed
      if (newUrlState !== lastUrlStateRef.current) {
        lastUrlStateRef.current = newUrlState;
        router.updateSearchParams(searchParams);
      }
    }, 300);

    return () => {
      if (updateUrlTimeoutRef.current) {
        clearTimeout(updateUrlTimeoutRef.current);
      }
    };
  }, [columnFilters, sorting, pagination, globalFilter, urlSyncConfig, currentViewId]);
  // Note: router is intentionally not in dependencies to prevent infinite loops

  // Load view from URL when views are loaded (only if router is provided)
  useEffect(() => {
    if (!router) return; // Skip if no router

    const viewIdFromUrl = router.searchParams.get("view");
    if (viewIdFromUrl && savedViews.length > 0) {
      const viewToLoad = savedViews.find(view => view.id === viewIdFromUrl);
      if (viewToLoad) {
        // Load the view without updating URL (since it's already in URL)
        setColumnFilters(viewToLoad.columnFilters);
        setSorting(viewToLoad.sorting);
        setColumnVisibility(viewToLoad.columnVisibility);
        setPagination(viewToLoad.pagination);
        setGlobalFilter(viewToLoad.globalFilter);
        setCurrentViewId(viewToLoad.id);
      } else {
        // View ID in URL doesn't exist, clear it
        updateUrlWithViewId(null);
      }
    }
  }, [savedViews, router, updateUrlWithViewId]);

  return {
    table,
    savedViews,
    currentViewId,
    actions: {
      saveView,
      loadView,
      deleteView,
      resetFilters,
      getCurrentViewState,
      loadViews,
    },
  };
}
