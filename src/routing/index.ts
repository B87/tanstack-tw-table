/**
 * Routing abstractions for framework-agnostic URL synchronization
 *
 * @module routing
 */

export type { DataTableRouter, DataTableRouterOptions } from "./types";
export { createNextRouter } from "./providers/next";
export { createReactRouterAdapter } from "./providers/react-router";
export { createClientSideRouter } from "./providers/client-side";
