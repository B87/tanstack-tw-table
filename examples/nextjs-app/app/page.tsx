"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@b87/tanstack-tw-table";
import { createNextRouter } from "@b87/tanstack-tw-table/routing";

interface User {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  role: string;
  createdAt: Date;
}

const sampleData: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    status: "active",
    role: "admin",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    status: "active",
    role: "user",
    createdAt: new Date("2024-01-02"),
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    status: "inactive",
    role: "user",
    createdAt: new Date("2024-01-03"),
  },
  {
    id: "4",
    name: "Alice Williams",
    email: "alice@example.com",
    status: "active",
    role: "moderator",
    createdAt: new Date("2024-01-04"),
  },
];

export default function HomePage() {
  const router = createNextRouter();

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        meta: { searchable: true },
      },
      {
        accessorKey: "email",
        header: "Email",
        meta: { searchable: true },
      },
      {
        accessorKey: "status",
        header: "Status",
        meta: {
          filterable: {
            options: [
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ],
          },
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        meta: {
          filterable: {
            options: [
              { label: "Admin", value: "admin" },
              { label: "User", value: "user" },
              { label: "Moderator", value: "moderator" },
            ],
          },
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        },
      },
    ],
    []
  );

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold">Client-Side Table Example</h1>
          <a
            href="/server-side"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            View Server-Side Example →
          </a>
        </div>
        <p className="text-gray-600">
          This example uses client-side filtering, sorting, and pagination with URL synchronization.
        </p>
      </div>
      <DataTable
        data={sampleData}
        columns={columns}
        pageCount={1}
        tableId="nextjs-example"
        router={router}
        features={{
          viewManagement: true,
          rowSelection: true,
          urlSync: true, // Enable URL synchronization for deep linking
        }}
        server={{
          mode: "client", // Enable client-side filtering for this example
        }}
      />
    </div>
  );
}
