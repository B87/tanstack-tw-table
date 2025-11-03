"use client";

import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useDataTableUI } from "./DataTableContext";

interface DataTableErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface DataTableErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<DataTableErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

interface DataTableErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  hasError: boolean;
}

export class DataTableErrorBoundary extends React.Component<DataTableErrorBoundaryProps, DataTableErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: DataTableErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): DataTableErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("DataTable Error Boundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call the error callback if provided
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: DataTableErrorBoundaryProps) {
    const { children, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when props change (useful for data changes)
    if (hasError && resetOnPropsChange && prevProps.children !== children) {
      this.resetErrorBoundary();
    }
  }

  resetErrorBoundary = () => {
    // Clear any existing timeout
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback: Fallback } = this.props;

    if (hasError && error) {
      if (Fallback) {
        return <Fallback error={error} resetErrorBoundary={this.resetErrorBoundary} hasError={hasError} />;
      }

      return <DefaultErrorFallback error={error} resetErrorBoundary={this.resetErrorBoundary} hasError={hasError} />;
    }

    return children;
  }
}

function DefaultErrorFallback({ error, resetErrorBoundary }: DataTableErrorFallbackProps) {
  const ui = useDataTableUI();
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[400px] bg-muted/10 rounded-lg border-2 border-dashed border-muted-foreground/25">
      <div className="flex items-center justify-center w-12 h-12 bg-destructive/10 rounded-full mb-4">
        <AlertCircle className="w-6 h-6 text-destructive" />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">Something went wrong with the data table</h3>

      <p className="text-sm text-muted-foreground text-center mb-4 max-w-md">
        We encountered an error while rendering the table. This might be due to invalid data or a temporary issue.
      </p>

      {process.env.NODE_ENV === "development" && (
        <details className="mb-4 p-3 bg-muted rounded-md text-xs font-mono max-w-2xl overflow-auto">
          <summary className="cursor-pointer text-muted-foreground mb-2">Error Details (Development)</summary>
          <div className="text-destructive whitespace-pre-wrap">
            {error.name}: {error.message}
            {error.stack && <div className="mt-2 pt-2 border-t border-muted-foreground/20">{error.stack}</div>}
          </div>
        </details>
      )}

      <div className="flex gap-2">
        <ui.Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reload Page
        </ui.Button>

        <ui.Button variant="default" size="sm" onClick={resetErrorBoundary} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </ui.Button>
      </div>
    </div>
  );
}
