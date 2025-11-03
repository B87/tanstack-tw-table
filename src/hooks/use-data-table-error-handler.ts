"use client";

import * as React from "react";

// Hook for easier error boundary usage
export function useDataTableErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    console.error("DataTable Error:", error);
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      // Auto-reset error after 10 seconds
      const timeout = setTimeout(resetError, 10000);
      return () => clearTimeout(timeout);
    }
  }, [error, resetError]);

  return {
    error,
    hasError: !!error,
    resetError,
    handleError,
  };
}
