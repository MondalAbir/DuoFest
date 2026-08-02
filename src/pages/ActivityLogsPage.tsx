import { useMemo, useState } from "react";
import { useActivityLogs } from "@/lib/hooks";
import { adaptActivityLog } from "@/lib/adapters";
import type { ActivityLogItem, DashboardStat } from "@/types";
import { searchInArray, filterByStatus } from "@/utils/filter";
import { formatDateTime } from "@/utils/format";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { TableToolbar } from "@/components/common/TableToolbar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UserAvatar } from "@/components/common/UserAvatar";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { getAvatarColor } from "@/utils/constants";

const columns: DataTableColumn<ActivityLogItem>[] = [
  {
    key: "actor",
    header: "Actor",
    cell: (log) => (
      <div className="flex items-center gap-3">
        <UserAvatar
          name={log.actor}
          color={getAvatarColor(log.actor.length)}
          size="sm"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {log.actor}
          </p>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            {log.actorRole}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "action",
    header: "Action",
    cell: (log) => (
      <div className="min-w-0">
        <p className="text-sm text-foreground">{log.action}</p>
        <p className="truncate text-xs text-muted-foreground">{log.target}</p>
      </div>
    ),
  },
  {
    key: "timestamp",
    header: "Timestamp",
    sortable: true,
    sortValue: (log) => new Date(log.timestamp).getTime(),
    hideBelow: "md",
    cell: (log) => (
      <span className="text-sm text-muted-foreground">
        {formatDateTime(log.timestamp)}
      </span>
    ),
  },
  {
    key: "ip",
    header: "IP Address",
    hideBelow: "lg",
    cell: (log) => (
      <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
        {log.ip}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (log) => <StatusBadge status={log.status} dot />,
  },
];

export default function ActivityLogsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const { data, isLoading } = useActivityLogs({ perPage: 100 });
  const activityLogs = (data?.items ?? []).map(adaptActivityLog);

  const stats = useMemo<DashboardStat[]>(() => [
    {
      id: "log-today",
      title: "Events Today",
      value: 342,
      delta: { value: 8.4, direction: "up", label: "vs yesterday" },
      icon: "sparkles",
      tint: "primary",
    },
    {
      id: "log-suspicious",
      title: "Flagged Actions",
      value: activityLogs.filter((log) => log.status !== "success").length,
      delta: { value: 1.1, direction: "down", label: "vs last month" },
      icon: "shield",
      tint: "danger",
    },
    {
      id: "log-sessions",
      title: "Active Sessions",
      value: 128,
      delta: { value: 5.6, direction: "up", label: "vs last week" },
      icon: "users",
      tint: "success",
    },
    {
      id: "log-uptime",
      title: "Platform Uptime",
      value: 99.99,
      decimals: 2,
      suffix: "%",
      delta: { value: 0.01, direction: "up", label: "vs last month" },
      icon: "check-circle",
      tint: "info",
    },
  ], [activityLogs]);

  const filtered = useMemo(() => {
    const searched = searchInArray(activityLogs, query, [
      "actor",
      "action",
      "target",
      "ip",
    ]);
    return filterByStatus(searched, "status", status);
  }, [query, status, activityLogs]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Logs"
        subtitle="Audit trail of every action on the platform"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.id} stat={stat} index={index} />
        ))}
      </div>

      <TableToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search by actor, action or IP…"
        filterValue={status}
        onFilterChange={setStatus}
        filterOptions={[
          { value: "all", label: "All statuses" },
          { value: "success", label: "Success" },
          { value: "warning", label: "Warning" },
          { value: "danger", label: "Danger" },
        ]}
        total={filtered.length}
      />

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(log) => log.id}
        pageSize={8}
        emptyMessage="No activity found"
        loading={isLoading}
      />
    </div>
  );
}
