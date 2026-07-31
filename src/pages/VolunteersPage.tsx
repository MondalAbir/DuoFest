import { useMemo, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { volunteers } from "@/data/admins";
import type { DashboardStat, Volunteer } from "@/types";
import { searchInArray, filterByStatus } from "@/utils/filter";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { TableToolbar } from "@/components/common/TableToolbar";
import { UserAvatar } from "@/components/common/UserAvatar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VolunteerProfileDrawer } from "@/components/volunteers/VolunteerProfileDrawer";

const buildColumns = (
  onView: (volunteer: Volunteer) => void,
): DataTableColumn<Volunteer>[] => [
  {
    key: "volunteer",
    header: "Volunteer",
    cell: (volunteer) => (
      <div className="flex items-center gap-3">
        <UserAvatar
          name={volunteer.name}
          color={volunteer.avatarColor}
          size="sm"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {volunteer.name}
          </p>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            {volunteer.email}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "college",
    header: "College",
    hideBelow: "md",
    cell: (volunteer) => (
      <span className="text-sm text-muted-foreground">
        {volunteer.collegeName}
      </span>
    ),
  },
  {
    key: "event",
    header: "Assigned Event",
    hideBelow: "lg",
    cell: (volunteer) => (
      <Badge variant="secondary">{volunteer.eventName}</Badge>
    ),
  },
  {
    key: "hours",
    header: "Hours Logged",
    align: "right",
    sortable: true,
    sortValue: (volunteer) => volunteer.hours,
    cell: (volunteer) => (
      <span className="text-sm font-semibold text-foreground">
        {volunteer.hours}h
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (volunteer) => <StatusBadge status={volunteer.status} dot />,
  },
  {
    key: "actions",
    header: "",
    align: "right",
    cell: (volunteer) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Row actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => onView(volunteer)}
          >
            View profile
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function VolunteersPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(
    null,
  );

  const columns = useMemo(
    () => buildColumns(setSelectedVolunteer),
    [],
  );

  const stats = useMemo<DashboardStat[]>(() => [
    {
      id: "vol-total",
      title: "Total Volunteers",
      value: volunteers.length,
      delta: { value: 11.3, direction: "up", label: "vs last month" },
      icon: "users",
      tint: "primary",
    },
    {
      id: "vol-active",
      title: "Active",
      value: volunteers.filter((v) => v.status === "active").length,
      delta: { value: 8.9, direction: "up", label: "vs last month" },
      icon: "check-circle",
      tint: "success",
    },
    {
      id: "vol-onboarding",
      title: "Onboarding",
      value: volunteers.filter((v) => v.status === "onboarding").length,
      delta: { value: 2.4, direction: "up", label: "vs last month" },
      icon: "sparkles",
      tint: "info",
    },
    {
      id: "vol-hours",
      title: "Hours Logged",
      value: volunteers.reduce((sum, volunteer) => sum + volunteer.hours, 0),
      delta: { value: 16.2, direction: "up", label: "vs last month" },
      icon: "ticket",
      tint: "warning",
    },
  ], []);

  const filtered = useMemo(() => {
    const searched = searchInArray(volunteers, query, [
      "name",
      "email",
      "collegeName",
      "eventName",
    ]);
    return filterByStatus(searched, "status", status);
  }, [query, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Volunteers"
        subtitle="Coordinate the volunteer network across colleges"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.id} stat={stat} index={index} />
        ))}
      </div>

      <TableToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search by name, college or event…"
        filterValue={status}
        onFilterChange={setStatus}
        filterOptions={[
          { value: "all", label: "All statuses" },
          { value: "active", label: "Active" },
          { value: "onboarding", label: "Onboarding" },
          { value: "inactive", label: "Inactive" },
        ]}
        total={filtered.length}
      />

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(volunteer) => volunteer.id}
        pageSize={8}
        emptyMessage="No volunteers found"
      />

      <VolunteerProfileDrawer
        volunteer={selectedVolunteer}
        onOpenChange={(open) => {
          if (!open) setSelectedVolunteer(null);
        }}
      />
    </div>
  );
}
