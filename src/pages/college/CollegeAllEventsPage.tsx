import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Copy, Download, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import type { CollegeEvent } from "@/data/college/events";
import { useAuth } from "@/context/AuthContext";
import { useDeleteEvent, useEvents } from "@/lib/hooks";
import { adaptCollegeEvent } from "@/lib/adapters";
import { toastApiError, toastSuccess } from "@/lib/toast";
import { searchInArray, filterByStatus } from "@/utils/filter";
import { formatCompact, formatCurrency, formatDate } from "@/utils/format";
import { PageHeader } from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/PageLoader";
import { TableToolbar } from "@/components/common/TableToolbar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";

function EventBanner({ event }: { event: CollegeEvent }) {
  return (
    <span
      className={cn(
        "flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white",
        event.gradient,
      )}
      aria-hidden="true"
    >
      <span className="text-[9px] font-bold uppercase tracking-wider opacity-90">
        {event.name.slice(0, 3).toUpperCase()}
      </span>
    </span>
  );
}

const buildColumns = (
  onView: (event: CollegeEvent) => void,
  onDuplicate: (event: CollegeEvent) => void,
  onDelete: (event: CollegeEvent) => void,
): DataTableColumn<CollegeEvent>[] => [
  {
    key: "event",
    header: "Event",
    cell: (event) => (
      <div className="flex items-center gap-3">
        <EventBanner event={event} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {event.name}
          </p>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            {event.id} · {event.venue}
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
      <span className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
        {event.category}
      </span>
    ),
  },
  {
    key: "date",
    header: "Date",
    sortable: true,
    sortValue: (event) => new Date(event.date).getTime(),
    hideBelow: "sm",
    cell: (event) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(event.date)}
      </span>
    ),
  },
  {
    key: "registrations",
    header: "Registrations",
    sortable: true,
    sortValue: (event) => event.registrations,
    align: "right",
    cell: (event) => (
      <span className="text-sm font-medium text-foreground">
        {formatCompact(event.registrations)}
        <span className="text-xs font-normal text-muted-foreground">
          {" "}
          / {formatCompact(event.capacity)}
        </span>
      </span>
    ),
  },
  {
    key: "revenue",
    header: "Revenue",
    sortable: true,
    sortValue: (event) => event.revenue,
    align: "right",
    hideBelow: "md",
    cell: (event) => (
      <span className="text-sm font-medium text-foreground">
        {formatCurrency(event.revenue)}
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
            View details
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Pencil className="h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => onDuplicate(event)}
          >
            <Copy className="h-4 w-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-danger focus:bg-danger/10 focus:text-danger"
            onClick={() => onDelete(event)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function CollegeAllEventsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [overrides, setOverrides] = useState<CollegeEvent[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<CollegeEvent | null>(null);

  const deleteMutation = useDeleteEvent();
  const { data: eventsData, isLoading } = useEvents({
    college_id: user?.college_id ?? undefined,
    perPage: 100,
  });

  const events = useMemo(
    () => [...overrides, ...(eventsData?.items ?? []).map(adaptCollegeEvent)],
    [overrides, eventsData],
  );

  const columns = useMemo(
    () =>
      buildColumns(
        (event) => navigate(`/admin/college/events/${event.id}`),
        (event) =>
          setOverrides((current) => [
            {
              ...event,
              id: `${event.id}-copy`,
              name: `${event.name} (Copy)`,
              registrations: 0,
              revenue: 0,
              status: "draft",
            },
            ...current,
          ]),
        setDeleteTarget,
      ),
    [navigate],
  );

  const filtered = useMemo(() => {
    const searched = searchInArray(events, query, [
      "name",
      "id",
      "venue",
      "category",
    ]);
    return filterByStatus(searched, "status", status);
  }, [events, query, status]);

  const revenue = useMemo(
    () => events.reduce((sum, event) => sum + event.revenue, 0),
    [events],
  );

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Events"
        subtitle="Every event created by this college"
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
            <Button
              className="gap-2"
              onClick={() => navigate("/admin/college/events/create")}
            >
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="text-sm font-medium text-muted-foreground">Total Events</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            {events.length}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="text-sm font-medium text-muted-foreground">Live Now</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-success">
            {events.filter((event) => event.status === "live").length}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-info">
            {events.filter((event) => event.status === "upcoming").length}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(revenue)}
          </p>
        </div>
      </div>

      <TableToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search by name, venue or category…"
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

      <DeleteConfirmationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete event"
        description={`This will permanently delete “${deleteTarget?.name}” and its registrations. This action cannot be undone.`}
        confirmText={deleteTarget?.name ?? ""}
        confirmLabel="Delete Event"
        onConfirm={async () => {
          if (!deleteTarget) return;
          const target = deleteTarget;
          if (target.id.endsWith("-copy")) {
            setOverrides((current) =>
              current.filter((event) => event.id !== target.id),
            );
            setDeleteTarget(null);
            return;
          }
          try {
            await deleteMutation.mutateAsync(Number(target.id));
            toastSuccess("Event deleted.");
          } catch (error) {
            toastApiError(error, "Unable to delete event.");
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
