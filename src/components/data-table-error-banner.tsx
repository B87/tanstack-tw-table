"use client";

import { AlertCircle, X } from "lucide-react";
import { useDataTableUI } from "./DataTableContext";

import { DataTableI18nAdapter } from "../types";
import { enAdapter } from "../i18n/adapters/en";

interface DataTableErrorBannerProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  i18n?: DataTableI18nAdapter;
}

export function DataTableErrorBanner({ error, onRetry, onDismiss, i18n = enAdapter }: DataTableErrorBannerProps) {
  const ui = useDataTableUI();
  return (
    <div className="border border-destructive/20 bg-destructive/10 px-4 py-3 rounded-md mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive">{error}</span>
        </div>
        <div className="flex items-center gap-2">
          {onRetry && (
            <ui.Button variant="ghost" size="sm" onClick={onRetry}>
              {i18n.errors.retry}
            </ui.Button>
          )}
          {onDismiss && (
            <ui.Button variant="ghost" size="sm" onClick={onDismiss} aria-label="Dismiss error">
              <X className="h-4 w-4" />
            </ui.Button>
          )}
        </div>
      </div>
    </div>
  );
}
