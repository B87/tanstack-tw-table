import * as React from "react";
import { useContext } from "react";
import type { DataTableUI } from "../ui/types";
import { shadcnUI } from "../ui/shadcn";

const DataTableContext = React.createContext<DataTableUI>(shadcnUI);

export function useDataTableUI(): DataTableUI {
  const context = useContext(DataTableContext);
  if (!context) {
    throw new Error("useDataTableUI must be used within a DataTableUIProvider");
  }
  return context;
}

export const DataTableUIProvider = DataTableContext.Provider;
