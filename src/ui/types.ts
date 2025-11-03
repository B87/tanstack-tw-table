import type * as React from "react";

// Generic component type with props
type ComponentWithProps<T> = React.ComponentType<T>;

// Table Parts
export interface TableParts {
  Table: ComponentWithProps<any>;
  TableHeader: ComponentWithProps<any>;
  TableBody: ComponentWithProps<any>;
  TableRow: ComponentWithProps<any>;
  TableHead: ComponentWithProps<any>;
  TableCell: ComponentWithProps<any>;
}

// Form Parts
export interface FormParts {
  Button: ComponentWithProps<any>;
  Input: ComponentWithProps<any>;
  Checkbox: ComponentWithProps<any>;
  Label: ComponentWithProps<any>;
  Textarea: ComponentWithProps<any>;
}

// Overlay Parts
export interface OverlayParts {
  Dialog: ComponentWithProps<any>;
  DialogTrigger: ComponentWithProps<any>;
  DialogContent: ComponentWithProps<any>;
  DialogHeader: ComponentWithProps<any>;
  DialogTitle: ComponentWithProps<any>;
  DialogDescription: ComponentWithProps<any>;
  DialogFooter: ComponentWithProps<any>;
  DialogClose: ComponentWithProps<any>;
  DialogOverlay: ComponentWithProps<any>;
  DialogPortal: ComponentWithProps<any>;
  DropdownMenu: ComponentWithProps<any>;
  DropdownMenuTrigger: ComponentWithProps<any>;
  DropdownMenuContent: ComponentWithProps<any>;
  DropdownMenuItem: ComponentWithProps<any>;
  DropdownMenuCheckboxItem: ComponentWithProps<any>;
  DropdownMenuRadioItem: ComponentWithProps<any>;
  DropdownMenuLabel: ComponentWithProps<any>;
  DropdownMenuSeparator: ComponentWithProps<any>;
  DropdownMenuShortcut: ComponentWithProps<any>;
  DropdownMenuGroup: ComponentWithProps<any>;
  DropdownMenuPortal: ComponentWithProps<any>;
  DropdownMenuSub: ComponentWithProps<any>;
  DropdownMenuSubContent: ComponentWithProps<any>;
  DropdownMenuSubTrigger: ComponentWithProps<any>;
  DropdownMenuRadioGroup: ComponentWithProps<any>;
  Popover: ComponentWithProps<any>;
  PopoverTrigger: ComponentWithProps<any>;
  PopoverContent: ComponentWithProps<any>;
  Command: ComponentWithProps<any>;
  CommandInput: ComponentWithProps<any>;
  CommandList: ComponentWithProps<any>;
  CommandEmpty: ComponentWithProps<any>;
  CommandGroup: ComponentWithProps<any>;
  CommandItem: ComponentWithProps<any>;
  CommandSeparator: ComponentWithProps<any>;
}

// Display Parts
export interface DisplayParts {
  Badge: ComponentWithProps<any>;
  Separator: ComponentWithProps<any>;
  Calendar: ComponentWithProps<any>;
  Select: ComponentWithProps<any>;
  SelectGroup: ComponentWithProps<any>;
  SelectValue: ComponentWithProps<any>;
  SelectTrigger: ComponentWithProps<any>;
  SelectContent: ComponentWithProps<any>;
  SelectLabel: ComponentWithProps<any>;
  SelectItem: ComponentWithProps<any>;
  SelectSeparator: ComponentWithProps<any>;
  SelectScrollUpButton: ComponentWithProps<any>;
  SelectScrollDownButton: ComponentWithProps<any>;
}

// Union of all UI parts
export type DataTableUI = TableParts & FormParts & OverlayParts & DisplayParts;

// Partial overrides for UI customization
export type DataTableUIOverrides = Partial<DataTableUI>;
