import { useMemo, useState } from "react";
import { Download, MoreHorizontal, Plus, ShieldCheck } from "lucide-react";
import { admins } from "@/data/admins";
import type { AdminUser, DashboardStat } from "@/types";
import { searchInArray, filterByStatus } from "@/utils/filter";
import { formatDate, timeAgo } from "@/utils/format";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { TableToolbar } from "@/components/common/TableToolbar";
import { UserAvatar } from "@/components/common/UserAvatar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { InviteCollegeAdminDialog } from "@/components/colleges/InviteCollegeAdminDialog";
import { AdminProfileDrawer } from "@/components/colleges/AdminProfileDrawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const buildColumns = (
  onView: (admin: AdminUser) => void,
): DataTableColumn<AdminUser>[] => [
  {
    key: "admin",
    header: "Admin",
    cell: (admin) => (
      <div className="flex items-center gap-3">
        <UserAvatar name={admin.name} color={admin.avatarColor} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {admin.name}
          </p>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            {admin.email}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "college",
    header: "College",
    hideBelow: "md",
    cell: (admin) => (
      <span className="text-sm text-foreground">{admin.collegeName}</span>
    ),
  },
  {
    key: "lastActive",
    header: "Last Active",
    sortable: true,
    sortValue: (admin) => new Date(admin.lastActive).getTime(),
    hideBelow: "lg",
    cell: (admin) => (
      <span className="text-sm text-muted-foreground">
        {timeAgo(admin.lastActive)}
      </span>
    ),
  },
  {
    key: "joinedAt",
    header: "Joined",
    hideBelow: "lg",
    cell: (admin) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(admin.joinedAt)}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (admin) => <StatusBadge status={admin.status} dot />,
  },
  {
    key: "actions",
    header: "",
    align: "right",
    cell: (admin) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Row actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => onView(admin)}
          >
            View profile
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            Resend invitation
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer text-danger focus:bg-danger/10 focus:text-danger">
            Revoke access
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function CollegeAdminsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);

  const columns = useMemo(() => buildColumns(setSelectedAdmin), []);

  const stats = useMemo<DashboardStat[]>(() => [
    {
      id: "admins-total",
      title: "Total Admins",
      value: admins.length,
      delta: { value: 6.4, direction: "up", label: "vs last month" },
      icon: "shield",
      tint: "primary",
    },
    {
      id: "admins-active",
      title: "Active Admins",
      value: admins.filter((a) => a.status === "active").length,
      delta: { value: 4.1, direction: "up", label: "vs last month" },
      icon: "check-circle",
      tint: "success",
    },
    {
      id: "admins-inactive",
      title: "Inactive",
      value: admins.filter((a) => a.status === "inactive").length,
      delta: { value: 1.2, direction: "down", label: "vs last month" },
      icon: "users",
      tint: "warning",
    },
    {
      id: "admins-blocked",
      title: "Blocked",
      value: admins.filter((a) => a.status === "blocked").length,
      delta: { value: 0.8, direction: "down", label: "vs last month" },
      icon: "ticket",
      tint: "danger",
    },
  ], []);

  const filtered = useMemo(() => {
    const searched = searchInArray(admins, query, [
      "name",
      "email",
      "collegeName",
    ]);
    return filterByStatus(searched, "status", status);
  }, [query, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="College Admins"
        subtitle="Oversee administrators across all colleges"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button className="gap-2" onClick={() => setInviteOpen(true)}>
              <Plus className="h-4 w-4" />
              Invite Admin
            </Button>
          </>
        }
      />

      <InviteCollegeAdminDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />

      <AdminProfileDrawer
        admin={selectedAdmin}
        onOpenChange={(open) => {
          if (!open) setSelectedAdmin(null);
        }}
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
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Role-based access enabled
          </span>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(admin) => admin.id}
        pageSize={8}
        emptyMessage="No admins found"
      />
    </div>
  );
}
