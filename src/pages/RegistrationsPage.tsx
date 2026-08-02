import { useMemo, useState } from "react";
import { Download, Ticket } from "lucide-react";
import { useRegistrations } from "@/lib/hooks";
import { adaptRegistration } from "@/lib/adapters";
import type { DashboardStat, Registration } from "@/types";
import { searchInArray, filterByStatus } from "@/utils/filter";
import { formatCurrency, formatDate } from "@/utils/format";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { TableToolbar } from "@/components/common/TableToolbar";
import { UserAvatar } from "@/components/common/UserAvatar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { getAvatarColor } from "@/utils/constants";

const columns: DataTableColumn<Registration>[] = [
  {
    key: "student",
    header: "Student",
    cell: (registration) => (
      <div className="flex items-center gap-3">
        <UserAvatar
          name={registration.studentName}
          color={getAvatarColor(registration.studentName.length)}
          size="sm"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {registration.studentName}
          </p>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            {registration.email}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "event",
    header: "Event",
    hideBelow: "md",
    cell: (registration) => (
      <div className="min-w-0">
        <p className="truncate text-sm text-foreground">
          {registration.eventName}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {registration.collegeName}
        </p>
      </div>
    ),
  },
  {
    key: "date",
    header: "Date",
    hideBelow: "lg",
    cell: (registration) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(registration.date)}
      </span>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    sortable: true,
    sortValue: (registration) => registration.amount,
    hideBelow: "sm",
    cell: (registration) => (
      <span className="text-sm font-medium text-foreground">
        {formatCurrency(registration.amount)}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (registration) => (
      <StatusBadge status={registration.status} dot />
    ),
  },
];

export default function RegistrationsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const { data, isLoading } = useRegistrations({ perPage: 100 });
  const registrations = (data?.items ?? []).map(adaptRegistration);

  const stats = useMemo<DashboardStat[]>(() => {
    const confirmed = registrations.filter(
      (r) => r.status === "confirmed",
    ).length;
    const pending = registrations.filter((r) => r.status === "pending").length;
    const revenue = registrations.reduce(
      (sum, registration) =>
        registration.status !== "refunded" ? sum + registration.amount : sum,
      0,
    );
    return [
      {
        id: "reg-total",
        title: "Total Registrations",
        value: registrations.length,
        delta: { value: 18.9, direction: "up", label: "vs last month" },
        icon: "ticket",
        tint: "primary",
      },
      {
        id: "reg-confirmed",
        title: "Confirmed",
        value: confirmed,
        delta: { value: 14.2, direction: "up", label: "vs last month" },
        icon: "check-circle",
        tint: "success",
      },
      {
        id: "reg-pending",
        title: "Pending Payment",
        value: pending,
        delta: { value: 3.1, direction: "up", label: "vs last month" },
        icon: "sparkles",
        tint: "warning",
      },
      {
        id: "reg-revenue",
        title: "Registration Revenue",
        value: revenue,
        prefix: "$",
        delta: { value: 9.4, direction: "up", label: "vs last month" },
        icon: "dollar",
        tint: "danger",
      },
    ];
  }, [registrations]);

  const filtered = useMemo(() => {
    const searched = searchInArray(registrations, query, [
      "studentName",
      "email",
      "eventName",
      "collegeName",
    ]);
    return filterByStatus(searched, "status", status);
  }, [query, status, registrations]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registrations"
        subtitle="Track student registrations across all events"
        actions={
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.id} stat={stat} index={index} />
        ))}
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-info/20 bg-info/5 px-4 py-3 text-sm text-muted-foreground">
        <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-info" />
        <p>
          Registrations with a <span className="font-medium text-foreground">pending</span>{" "}
          status are awaiting payment confirmation. Confirmed registrations are
          synced to event check-in in real time.
        </p>
      </div>

      <TableToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search by student, event or college…"
        filterValue={status}
        onFilterChange={setStatus}
        filterOptions={[
          { value: "all", label: "All statuses" },
          { value: "confirmed", label: "Confirmed" },
          { value: "pending", label: "Pending" },
          { value: "cancelled", label: "Cancelled" },
          { value: "refunded", label: "Refunded" },
        ]}
        total={filtered.length}
      />

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(registration) => registration.id}
        pageSize={8}
        emptyMessage="No registrations found"
        loading={isLoading}
      />
    </div>
  );
}
