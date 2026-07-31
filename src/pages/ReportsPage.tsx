import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  FileBarChart2,
  FileSpreadsheet,
  FileText,
  Loader2,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { reports } from "@/data/announcements";
import type { DashboardStat, Report } from "@/types";
import { searchInArray } from "@/utils/filter";
import { formatDateTime, formatNumber } from "@/utils/format";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { SearchInput } from "@/components/common/SearchInput";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

const REPORT_TYPES: Array<{
  type: string;
  description: string;
  icon: LucideIcon;
  color: string;
}> = [
  {
    type: "Revenue",
    description: "Billing, payouts and earnings summary",
    icon: FileBarChart2,
    color: "bg-success/10 text-success",
  },
  {
    type: "College Performance",
    description: "Engagement and activity per college",
    icon: FileText,
    color: "bg-primary/10 text-primary",
  },
  {
    type: "Registration Analytics",
    description: "Deep-dive into registration trends",
    icon: FileSpreadsheet,
    color: "bg-info/10 text-info",
  },
  {
    type: "Volunteer Ledger",
    description: "Hours and allocation across events",
    icon: FileSpreadsheet,
    color: "bg-warning/10 text-warning",
  },
];

const columns: DataTableColumn<Report>[] = [
  {
    key: "report",
    header: "Report",
    cell: (report) => (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <FileText className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {report.title}
          </p>
          <p className="text-xs text-muted-foreground">{report.type}</p>
        </div>
      </div>
    ),
  },
  {
    key: "generatedAt",
    header: "Generated",
    sortable: true,
    sortValue: (report) => new Date(report.generatedAt).getTime(),
    hideBelow: "md",
    cell: (report) => (
      <span className="text-sm text-muted-foreground">
        {formatDateTime(report.generatedAt)}
      </span>
    ),
  },
  {
    key: "rows",
    header: "Rows",
    align: "right",
    sortable: true,
    sortValue: (report) => report.rows,
    hideBelow: "sm",
    cell: (report) => (
      <span className="text-sm text-muted-foreground">
        {formatNumber(report.rows)}
      </span>
    ),
  },
  {
    key: "size",
    header: "Size",
    hideBelow: "lg",
    cell: (report) => (
      <span className="text-sm text-muted-foreground">{report.size}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (report) => <StatusBadge status={report.status} dot />,
  },
  {
    key: "actions",
    header: "",
    align: "right",
    cell: (report) => (
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-xs"
        disabled={report.status !== "ready"}
        aria-label={`Download ${report.title}`}
      >
        {report.status === "generating" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : report.status === "ready" ? (
          <ArrowDownToLine className="h-3.5 w-3.5" />
        ) : null}
        {report.status === "ready" ? "Download" : report.status}
      </Button>
    ),
  },
];

export default function ReportsPage() {
  const [query, setQuery] = useState("");

  const stats = useMemo<DashboardStat[]>(() => [
    {
      id: "rep-total",
      title: "Reports Generated",
      value: reports.length,
      delta: { value: 18.4, direction: "up", label: "vs last month" },
      icon: "ticket",
      tint: "primary",
    },
    {
      id: "rep-ready",
      title: "Ready to Download",
      value: reports.filter((r) => r.status === "ready").length,
      delta: { value: 12.1, direction: "up", label: "vs last month" },
      icon: "check-circle",
      tint: "success",
    },
    {
      id: "rep-scheduled",
      title: "Automated Schedules",
      value: 8,
      delta: { value: 2.0, direction: "up", label: "vs last month" },
      icon: "sparkles",
      tint: "info",
    },
    {
      id: "rep-data",
      title: "Data Points Tracked",
      value: 128400,
      delta: { value: 22.7, direction: "up", label: "vs last month" },
      icon: "users",
      tint: "warning",
    },
  ], []);

  const filtered = useMemo(
    () => searchInArray(reports, query, ["title", "type"]),
    [query],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Generate and download operational reports"
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Report
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.id} stat={stat} index={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {REPORT_TYPES.map(({ type, description, icon: Icon, color }) => (
          <div
            key={type}
            className="group rounded-2xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
                color,
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-3.5 text-sm font-semibold text-foreground">
              {type}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 h-7 gap-1 px-0 text-xs font-medium text-primary hover:bg-transparent hover:text-primary/80"
            >
              Generate now
            </Button>
          </div>
        ))}
      </div>

      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search reports…"
        className="w-full sm:max-w-xs"
        ariaLabel="Search reports"
      />

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(report) => report.id}
        pageSize={6}
        emptyMessage="No reports found"
      />
    </div>
  );
}
