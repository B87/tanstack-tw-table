"use client";

import * as React from "react";
import { useState } from "react";
import { PlusIcon, BookmarkIcon, TrashIcon, EditIcon } from "lucide-react";

import { useDataTableUI } from "./DataTableContext";
import { DataTableView, ViewManagerProps } from "../types";
import { DataTableI18nAdapter } from "../i18n/types";
import { enAdapter } from "../i18n/adapters/en";
import { toast } from "sonner";

interface SaveViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentView: Partial<DataTableView>;
  onSave: (view: Omit<DataTableView, "id" | "createdAt" | "updatedAt">) => void;
  i18n?: DataTableI18nAdapter;
}

function SaveViewDialog({ open, onOpenChange, currentView, onSave, i18n = enAdapter }: SaveViewDialogProps) {
  const ui = useDataTableUI();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error(i18n.views.saveViewDialog.nameRequired);
      return;
    }

    const viewToSave = {
      name: name.trim(),
      description: description.trim() || undefined,
      isDefault,
      columnFilters: currentView.columnFilters || [],
      sorting: currentView.sorting || [],
      columnVisibility: currentView.columnVisibility || {},
      pagination: currentView.pagination || { pageIndex: 0, pageSize: 10 },
      globalFilter: currentView.globalFilter || "",
    };

    onSave(viewToSave);
    onOpenChange(false);
    setName("");
    setDescription("");
    setIsDefault(false);
    toast.success(i18n.views.saved);
  };

  return (
    <ui.Dialog open={open} onOpenChange={onOpenChange}>
      <ui.DialogContent>
        <ui.DialogHeader>
          <ui.DialogTitle>{i18n.views.saveViewDialog.title}</ui.DialogTitle>
          <ui.DialogDescription>{i18n.views.saveViewDialog.description}</ui.DialogDescription>
        </ui.DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <ui.Label htmlFor="view-name">{i18n.views.saveViewDialog.nameLabel}</ui.Label>
            <ui.Input
              id="view-name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              placeholder={i18n.views.saveViewDialog.namePlaceholder}
            />
          </div>
          <div className="grid gap-2">
            <ui.Label htmlFor="view-description">{i18n.views.saveViewDialog.descriptionLabel}</ui.Label>
            <ui.Textarea
              id="view-description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder={i18n.views.saveViewDialog.descriptionPlaceholder}
              rows={3}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              id="view-default"
              type="checkbox"
              checked={isDefault}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsDefault(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <ui.Label htmlFor="view-default" className="text-sm">
              {i18n.views.saveViewDialog.setAsDefault}
            </ui.Label>
          </div>
        </div>
        <ui.DialogFooter>
          <ui.Button variant="outline" onClick={() => onOpenChange(false)}>
            {i18n.views.saveViewDialog.cancel}
          </ui.Button>
          <ui.Button onClick={handleSave}>{i18n.views.saveViewDialog.save}</ui.Button>
        </ui.DialogFooter>
      </ui.DialogContent>
    </ui.Dialog>
  );
}

export function ViewManager({
  tableId,
  currentView,
  onViewChange,
  onViewSave,
  onViewDelete,
  onViewLoad,
  i18n = enAdapter,
}: ViewManagerProps) {
  const ui = useDataTableUI();
  const [savedViews, setSavedViews] = useState<DataTableView[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [currentViewId, setCurrentViewId] = useState<string | null>(null);

  React.useEffect(() => {
    const loadViews = async () => {
      try {
        const views = JSON.parse(localStorage.getItem(`data-table-views:${tableId}`) || "[]");
        setSavedViews(views);
      } catch (error) {
        console.error("Failed to load views:", error);
      }
    };
    loadViews();
  }, [tableId]);

  const handleSaveView = async (viewData: Omit<DataTableView, "id" | "createdAt" | "updatedAt">) => {
    try {
      await onViewSave(viewData);
      // Reload views after saving
      const views = JSON.parse(localStorage.getItem(`data-table-views:${tableId}`) || "[]");
      setSavedViews(views);
    } catch (error) {
      toast.error(i18n.views.saveFailed);
    }
  };

  const handleLoadView = (view: DataTableView) => {
    onViewLoad(view);
    setCurrentViewId(view.id);
    toast.success(i18n.views.loaded(view.name));
  };

  const handleDeleteView = async (viewId: string) => {
    try {
      await onViewDelete(viewId);
      setSavedViews(views => views.filter(v => v.id !== viewId));
      if (currentViewId === viewId) {
        setCurrentViewId(null);
      }
      toast.success(i18n.views.deleted);
    } catch (error) {
      toast.error(i18n.views.deleteFailed);
    }
  };

  const hasActiveFilters =
    (currentView.columnFilters && currentView.columnFilters.length > 0) ||
    (currentView.globalFilter && currentView.globalFilter.length > 0) ||
    (currentView.sorting && currentView.sorting.length > 0);

  return (
    <div className="flex items-center gap-2">
      <ui.DropdownMenu>
        <ui.DropdownMenuTrigger asChild>
          <ui.Button variant="outline" size="sm">
            <BookmarkIcon className="mr-2 h-4 w-4" />
            {i18n.views.views}
            {savedViews.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs">{savedViews.length}</span>
            )}
          </ui.Button>
        </ui.DropdownMenuTrigger>
        <ui.DropdownMenuContent align="end" className="w-[200px]">
          {savedViews.length === 0 ? (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">{i18n.views.noSavedViews}</div>
          ) : (
            savedViews.map(view => (
              <div key={view.id} className="flex items-center">
                <ui.DropdownMenuItem className="flex-1 cursor-pointer" onClick={() => handleLoadView(view)}>
                  <div className="flex-1">
                    <div className="font-medium">{view.name}</div>
                    {view.description && <div className="text-xs text-muted-foreground">{view.description}</div>}
                    {view.isDefault && <div className="text-xs text-blue-600">{i18n.views.default}</div>}
                  </div>
                </ui.DropdownMenuItem>
                <ui.Button
                  variant="ghost"
                  size="sm"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    handleDeleteView(view.id);
                  }}
                  className="ml-1 h-6 w-6 p-0"
                >
                  <TrashIcon className="h-3 w-3" />
                </ui.Button>
              </div>
            ))
          )}
          {savedViews.length > 0 && <ui.DropdownMenuSeparator />}
          <ui.DropdownMenuItem
            onClick={() => setSaveDialogOpen(true)}
            disabled={!hasActiveFilters}
            className="cursor-pointer"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            {i18n.views.saveCurrentView}
          </ui.DropdownMenuItem>
        </ui.DropdownMenuContent>
      </ui.DropdownMenu>

      <SaveViewDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        currentView={currentView}
        onSave={handleSaveView}
        i18n={i18n}
      />

      {currentViewId && (
        <div className="text-sm text-muted-foreground">
          {i18n.views.current(savedViews.find(v => v.id === currentViewId)?.name || "")}
        </div>
      )}
    </div>
  );
}
