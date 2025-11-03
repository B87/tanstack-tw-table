"use client";

import * as React from "react";
import {
  type ColumnDef,
  type Table as TableInstance,
  type Row,
} from "@tanstack/react-table";
import type { CheckedState } from "@radix-ui/react-checkbox";

import {
  type DataTableFilterableColumn,
  type DataTableSearchableColumn,
} from "../types";
import { DataTable } from "./data-table-wrapper";
import { useDataTableUI } from "./DataTableContext";

interface User {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive" | "pending";
  role: "admin" | "user" | "moderator";
  createdAt: string;
}

const users: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    status: "active",
    role: "admin",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    status: "inactive",
    role: "user",
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    name: "Marcus Reid",
    email: "marcus@example.com",
    status: "pending",
    role: "moderator",
    createdAt: "2024-02-05",
  },
];

const filterableColumns: DataTableFilterableColumn<User>[] = [
  {
    id: "status",
    title: "Status",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Pending", value: "pending" },
    ],
  },
  {
    id: "role",
    title: "Role",
    options: [
      { label: "Admin", value: "admin" },
      { label: "User", value: "user" },
      { label: "Moderator", value: "moderator" },
    ],
  },
];

const searchableColumns: DataTableSearchableColumn<User>[] = [
  {
    id: "name",
    title: "Name",
  },
  {
    id: "email",
    title: "Email",
  },
];

const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => <SelectAllCheckbox table={table} />,
    cell: ({ row }) => <RowSelectCheckbox row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="text-muted-foreground">{row.getValue("email")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge status={row.getValue("status") as User["status"]} />
    ),
    filterFn: (row, id, value) => {
      return (value as string[]).includes(row.getValue(id) as string);
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("role")}</div>
    ),
    filterFn: (row, id, value) => {
      return (value as string[]).includes(row.getValue(id) as string);
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt") as string);
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <RowActions row={row} />,
  },
];

export function DataTableExample() {
  const handleDeleteRows = React.useCallback((selected: User[]) => {
    console.log("Delete selected rows", selected.map(user => user.id));
  }, []);

  return (
    <div className="container mx-auto py-10">
      <DataTable
        data={users}
        columns={columns}
        pageCount={1}
        tableId="users-table"
        searchableColumns={searchableColumns}
        filterableColumns={filterableColumns}
        newRowLink="/users/new"
        deleteRowsAction={handleDeleteRows}
      />
    </div>
  );
}

function SelectAllCheckbox({ table }: { table: TableInstance<User> }) {
  const ui = useDataTableUI();

  return (
    <ui.Checkbox
      checked={table.getIsAllPageRowsSelected()}
      onCheckedChange={(value: CheckedState) => table.toggleAllPageRowsSelected(value === true)}
      aria-label="Select all rows"
    />
  );
}

function RowSelectCheckbox({ row }: { row: Row<User> }) {
  const ui = useDataTableUI();

  return (
    <ui.Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value: CheckedState) => row.toggleSelected(value === true)}
      aria-label={`Select row ${row.original.name}`}
    />
  );
}

function StatusBadge({ status }: { status: User["status"] }) {
  const colorClasses: Record<User["status"], string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClasses[status]}`}
    >
      {status}
    </div>
  );
}

function RowActions({ row }: { row: Row<User> }) {
  const ui = useDataTableUI();

  const handleEdit = React.useCallback(() => {
    console.log("Edit row", row.original.id);
  }, [row.original.id]);

  const handleDelete = React.useCallback(() => {
    console.log("Delete row", row.original.id);
  }, [row.original.id]);

  return (
    <div className="flex items-center gap-2">
      <ui.Button type="button" variant="ghost" size="sm" onClick={handleEdit}>
        Edit
      </ui.Button>
      <ui.Button type="button" variant="ghost" size="sm" onClick={handleDelete}>
        Delete
      </ui.Button>
    </div>
  );
}
