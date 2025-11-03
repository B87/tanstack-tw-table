"use client";

import type { DataTableStatistics } from "../types";

/**
 * Simple utility functions for calculating statistics
 * Focuses on server-side statistics with minimal client-side fallbacks
 */

/**
 * Create statistics from server response data
 * Prioritizes server-provided statistics over client calculations
 */
export function createStatisticsFromResponse<TData = any>(
  data: TData[],
  pagination?: { totalItems: number },
  serverStatistics?: Partial<DataTableStatistics>
): DataTableStatistics {
  // Use server statistics if available, otherwise calculate from current data
  const stats: DataTableStatistics = {
    total: serverStatistics?.total ?? pagination?.totalItems ?? data.length,
    filtered: serverStatistics?.filtered ?? data.length,
    ...serverStatistics, // Include any custom server statistics
  };

  return stats;
}

/**
 * Common statistics calculators for fallback scenarios
 */
export const StatisticsCalculators = {
  /**
   * Count items matching a condition
   */
  count: <TData>(data: TData[], predicate: (item: TData) => boolean): number => data.filter(predicate).length,

  /**
   * Sum numeric values
   */
  sum: <TData>(data: TData[], getValue: (item: TData) => number): number =>
    data.reduce((sum, item) => sum + getValue(item), 0),

  /**
   * Calculate percentage
   */
  percentage: (value: number, total: number): number => (total > 0 ? Math.round((value / total) * 100) : 0),
};

/**
 * Format statistics for display
 */
export function formatStatistic(value: number): string {
  return value.toLocaleString();
}

/**
 * Check if statistics are stale (for potential refresh indicators)
 */
export function areStatisticsStale(
  statistics?: DataTableStatistics,
  maxAge: number = 5 * 60 * 1000 // 5 minutes
): boolean {
  if (!statistics) return true;

  // Since we removed lastUpdated for simplicity,
  // this could be enhanced to track timestamps if needed
  return false;
}
