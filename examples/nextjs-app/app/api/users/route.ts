import { NextRequest, NextResponse } from "next/server";

interface User {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  role: string;
  createdAt: string;
}

// Mock database of users
const users: User[] = [
  { id: "1", name: "John Doe", email: "john@example.com", status: "active", role: "admin", createdAt: "2024-01-15" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", status: "active", role: "user", createdAt: "2024-01-20" },
  { id: "3", name: "Bob Johnson", email: "bob@example.com", status: "inactive", role: "user", createdAt: "2024-02-01" },
  { id: "4", name: "Alice Williams", email: "alice@example.com", status: "active", role: "moderator", createdAt: "2024-02-10" },
  { id: "5", name: "Charlie Brown", email: "charlie@example.com", status: "active", role: "user", createdAt: "2024-02-15" },
  { id: "6", name: "Diana Prince", email: "diana@example.com", status: "inactive", role: "admin", createdAt: "2024-03-01" },
  { id: "7", name: "Ethan Hunt", email: "ethan@example.com", status: "active", role: "moderator", createdAt: "2024-03-05" },
  { id: "8", name: "Fiona Apple", email: "fiona@example.com", status: "active", role: "user", createdAt: "2024-03-10" },
  { id: "9", name: "George Lucas", email: "george@example.com", status: "inactive", role: "user", createdAt: "2024-03-15" },
  { id: "10", name: "Hannah Montana", email: "hannah@example.com", status: "active", role: "admin", createdAt: "2024-03-20" },
  { id: "11", name: "Ian Malcolm", email: "ian@example.com", status: "active", role: "user", createdAt: "2024-04-01" },
  { id: "12", name: "Jessica Jones", email: "jessica@example.com", status: "inactive", role: "moderator", createdAt: "2024-04-05" },
  { id: "13", name: "Kevin Hart", email: "kevin@example.com", status: "active", role: "user", createdAt: "2024-04-10" },
  { id: "14", name: "Laura Croft", email: "laura@example.com", status: "active", role: "admin", createdAt: "2024-04-15" },
  { id: "15", name: "Michael Scott", email: "michael@example.com", status: "inactive", role: "user", createdAt: "2024-04-20" },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Extract pagination parameters
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  // Extract sorting parameters
  const sortBy = searchParams.get("sort_by") || "createdAt";
  const sortOrder = searchParams.get("sort_order") || "desc";

  // Extract filter parameters
  const statusFilter = searchParams.get("status");
  const roleFilter = searchParams.get("role");
  const searchTerm = searchParams.get("search") || "";

  // Start with all users
  let filteredUsers = [...users];

  // Apply search filter
  if (searchTerm) {
    const lowerSearch = searchTerm.toLowerCase();
    filteredUsers = filteredUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerSearch) ||
        user.email.toLowerCase().includes(lowerSearch)
    );
  }

  // Apply status filter
  if (statusFilter) {
    const statuses = statusFilter.split(",");
    filteredUsers = filteredUsers.filter((user) => statuses.includes(user.status));
  }

  // Apply role filter
  if (roleFilter) {
    const roles = roleFilter.split(",");
    filteredUsers = filteredUsers.filter((user) => roles.includes(user.role));
  }

  // Apply sorting
  filteredUsers.sort((a, b) => {
    const aValue = a[sortBy as keyof User];
    const bValue = b[sortBy as keyof User];

    if (typeof aValue === "string" && typeof bValue === "string") {
      const comparison = aValue.localeCompare(bValue);
      return sortOrder === "asc" ? comparison : -comparison;
    }

    return 0;
  });

  // Calculate pagination
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Calculate statistics
  const statistics = {
    total: users.length,
    filtered: filteredUsers.length,
    activeUsers: users.filter((u) => u.status === "active").length,
    inactiveUsers: users.filter((u) => u.status === "inactive").length,
    admins: users.filter((u) => u.role === "admin").length,
    moderators: users.filter((u) => u.role === "moderator").length,
    regularUsers: users.filter((u) => u.role === "user").length,
  };

  // Simulate network delay (optional - remove in production)
  await new Promise((resolve) => setTimeout(resolve, 300));

  return NextResponse.json({
    data: paginatedUsers,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
    statistics,
  });
}
