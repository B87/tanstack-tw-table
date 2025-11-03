"use client";

import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "../utils/cn";

interface SortIconProps {
  direction: false | "asc" | "desc";
  className?: string;
}

export function SortIcon({ direction, className }: SortIconProps) {
  if (direction === "asc") {
    return <ArrowUp className={cn("h-3 w-3", className)} />;
  }

  if (direction === "desc") {
    return <ArrowDown className={cn("h-3 w-3", className)} />;
  }

  return <ArrowUpDown className={cn("h-3 w-3", className)} />;
}
