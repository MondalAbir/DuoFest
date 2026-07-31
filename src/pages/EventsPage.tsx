import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Eye, MoreHorizontal, Plus } from "lucide-react";
import { events } from "@/data/events";
import type { DashboardStat, FestEvent } from "@/types";
import { searchInArray, filterByStatus } from "@/utils/filter";
import { formatDate, formatNumber } from "@/utils/format";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { TableToolbar } from "@/components/common/TableToolbar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/utils/cn";

const buildColumns = (
  onView: (event: FestEvent) => void,
): DataTableColumn<FestEvent>[] => [
  {
    key: "event",
    header: "Event",
    cell: (event) => (
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white",
            event.gradient,
          )}
        >
          {event.name
            .split(" ")
            .slice(0, 2)
            .map((word) => word[0])
            .join("")}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {event.name}
          </p>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            {event.collegeName}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "category",
    header: "Category",
    hideBelow: "md",
    cell: (event) => (
      <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
        {event.category}
      </span>
    ),
  },
  {
    key: "date",
    header: "Date",
    sortable: true,
    sortValue: (event) => new Date(event.date).getTime(),
    cell: (event) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(event.date)}
      </span>
    ),
  },
  {
    key: "registrations",
    header: "Registrations",
    align: "right",
    sortable: true,
    sortValue: (event) => event.registrations,
    hideBelow: "lg",
    cell: (event) => (
      <span className="text-sm font-medium text-foreground">
        {formatNumber(event.registrations)}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (event) => <StatusBadge status={event.status} dot />,
  },
  {
    key: "actions",
    header: "",
    align: "right",
    cell: (event) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Row actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => onView(event)}
          >
            <Eye className="h-4 w-4" />
            View details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function EventsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const stats = useMemo<DashboardStat[]>(() => [
    {
      id: "events-total",
      title: "Total Events",
      value: events.length,
      delta: { value: 23.1, direction: "up", label: "vs last month" },
      icon: "sparkles",
      tint: "primary",
    },
    {
      id: "events-upcoming",
      title: "Upcoming",
      value: events.filter((e) => e.status === "upcoming").length,
      delta: { value: 12.4, direction: "up", label: "vs last month" },
      icon: "ticket",
      tint: "info",
    },
    {
      id: "events-live",
      title: "Live Now",
      value: events.filter((e) => e.status === "live").length,
      delta: { value: 5.2, direction: "up", label: "vs last month" },
      icon: "sparkles",
      tint: "success",
    },
    {
      id: "events-completed",
      title: "Completed",
      value: events.filter((e) => e.status === "completed").length,
      delta: { value: 8.7, direction: "up", label: "vs last month" },
      icon: "check-circle",
      tint: "warning",
    },
  ], []);

  const filtered = useMemo(() => {
    const searched = searchInArray(events, query, ["name", "collegeName", "category"]);
    return filterByStatus(searched, "status", status);
  }, [query, status]);

  const columns = useMemo(
    () => buildColumns((event) => navigate(`/admin/events/${event.id}`)),
    [navigate],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Events"
        subtitle="Browse every fest event across all colleges"
        actions={
          <Button className="gap-2" onClick={() => navigate("/admin/events/create")}>
            <Plus className="h-4 w-4" />
            Create Event
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
        searchPlaceholder="Search events, colleges or categories…"
        filterValue={status}
        onFilterChange={setStatus}
        filterOptions={[
          { value: "all", label: "All statuses" },
          { value: "upcoming", label: "Upcoming" },
          { value: "live", label: "Live" },
          { value: "completed", label: "Completed" },
          { value: "cancelled", label: "Cancelled" },
        ]}
        total={filtered.length}
      />

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(event) => event.id}
        pageSize={8}
        emptyMessage="No events found"
      />
    </div>
  );
}
