import React from "react";
import { render, type RenderResult } from "@testing-library/react";

// Simple test data
export interface TestUser {
  id: string;
  name: string;
  email: string;
}

export const mockUsers: TestUser[] = [
  { id: "1", name: "John Doe", email: "john@example.com" },
  { id: "2", name: "Jane Smith", email: "jane@example.com" },
];

// Simple render function
export function renderComponent(ui: React.ReactElement): RenderResult {
  return render(ui);
}

export * from "@testing-library/react";
