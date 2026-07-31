import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { users } from "@/data/users";
import type { DashboardStat, PlatformUser } from "@/types";
import { searchInArray, filterByStatus } from "@/utils/filter";
import { formatDate } from "@/utils/format";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { TableToolbar } from "@/components/common/TableToolbar";
import { UserAvatar } from "@/components/common/UserAvatar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ROLE_STYLES: Record<PlatformUser["role"], string> = {
  Student: "bg-primary/10 text-primary",
  Organizer: "bg-warning/10 text-warning",
  Admin: "bg-success/10 text-success",
};

const columns: DataTableColumn<PlatformUser>[] = [
  {
    key: "user",
    header: "User",
    cell: (user) => (
      <div className="flex items-center gap-3">
        <UserAvatar name={user.name} color={user.avatarColor} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {user.name}
          </p>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            {user.email}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "college",
    header: "College",
    hideBelow: "md",
    cell: (user) => (
      <span className="text-sm text-muted-foreground">{user.collegeName}</span>
    ),
  },
  {
    key: "role",
    header: "Role",
    cell: (user) => (
      <Badge className={ROLE_STYLES[user.role]}>{user.role}</Badge>
    ),
  },
  {
    key: "registeredAt",
    header: "Joined",
    sortable: true,
    sortValue: (user) => new Date(user.registeredAt).getTime(),
    hideBelow: "lg",
    cell: (user) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(user.registeredAt)}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (user) => <StatusBadge status={user.status} dot />,
  },
];

export default function UsersPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const stats = useMemo<DashboardStat[]>(() => [
    {
      id: "users-total",
      title: "Total Users",
      value: users.length,
      delta: { value: 14.7, direction: "up", label: "vs last month" },
      icon: "users",
      tint: "primary",
    },
    {
      id: "users-students",
      title: "Students",
      value: users.filter((u) => u.role === "Student").length,
      delta: { value: 11.2, direction: "up", label: "vs last month" },
      icon: "ticket",
      tint: "info",
    },
    {
      id: "users-organizers",
      title: "Organizers",
      value: users.filter((u) => u.role === "Organizer").length,
      delta: { value: 7.8, direction: "up", label: "vs last month" },
      icon: "sparkles",
      tint: "success",
    },
    {
      id: "users-blocked",
      title: "Blocked",
      value: users.filter((u) => u.status === "blocked").length,
      delta: { value: 0.5, direction: "down", label: "vs last month" },
      icon: "shield",
      tint: "danger",
    },
  ], []);

  const filtered = useMemo(() => {
    const searched = searchInArray(users, query, ["name", "email", "collegeName", "role"]);
    return filterByStatus(searched, "status", status);
  }, [query, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle="Every student, organizer and admin on DuoFest"
        actions={
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export Users
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.id} stat={stat} index={index} />
        ))}
      </div>

      <TableToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search by name, email or college…"
        filterValue={status}
        onFilterChange={setStatus}
        filterOptions={[
          { value: "all", label: "All statuses" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
          { value: "blocked", label: "Blocked" },
        ]}
        total={filtered.length}
      />

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(user) => user.id}
        pageSize={8}
        emptyMessage="No users found"
      />
    </div>
  );
}
