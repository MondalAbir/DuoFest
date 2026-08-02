import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  FileBarChart2,
  FileSpreadsheet,
  FileText,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import type { DashboardStat } from "@/types";
import { useAnalytics, useReport, type ReportType } from "@/lib/hooks";
import { adaptAnalytics } from "@/lib/adapters";
import apiClient from "@/lib/api/client";
import { formatNumber } from "@/utils/format";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

const REPORT_TYPES: Array<{
  type: ReportType;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}> = [
  {
    type: "revenue",
    title: "Revenue",
    description: "Billing, payouts and earnings summary",
    icon: FileBarChart2,
    color: "bg-success/10 text-success",
  },
  {
    type: "events",
    title: "Event Performance",
    description: "Engagement and activity per event",
    icon: FileText,
    color: "bg-primary/10 text-primary",
  },
  {
    type: "registrations",
    title: "Registration Analytics",
    description: "Deep-dive into registration trends",
    icon: FileSpreadsheet,
    color: "bg-info/10 text-info",
  },
  {
    type: "volunteers",
    title: "Volunteer Ledger",
    description: "Hours and allocation across events",
    icon: FileSpreadsheet,
    color: "bg-warning/10 text-warning",
  },
];

type ReportRow = Record<string, string | number | null>;

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>("registrations");

  const { data: analyticsData } = useAnalytics();
  const { data: report, isLoading } = useReport(activeReport);

  const analytics = useMemo(
    () => (analyticsData ? adaptAnalytics(analyticsData) : null),
    [analyticsData],
  );

  const stats = useMemo<DashboardStat[]>(() => {
    const byId = Object.fromEntries(
      (analytics?.stats ?? []).map((stat) => [stat.id, stat]),
    );
    return [
      byId["stat-total-registrations"] ?? null,
      byId["stat-total-revenue"] ?? null,
      byId["stat-total-events"] ?? null,
      byId["stat-total-colleges"] ?? null,
    ].filter(Boolean) as DashboardStat[];
  }, [analytics]);

  const columns: DataTableColumn<ReportRow>[] = useMemo(
    () =>
      (report?.columns ?? []).map((column) => ({
        key: column.key,
        header: column.label,
        cell: (row) => (
          <span className="text-sm text-muted-foreground">
            {row[column.key] ?? "—"}
          </span>
        ),
      })),
    [report],
  );

  const handleDownload = async (type: ReportType) => {
    const response = await apiClient.get(`/reports/${type}/export`, {
      responseType: "blob",
    });
    const url = URL.createObjectURL(response.data as Blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${type}-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const summary = report?.summary ?? {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Generate and download operational reports"
        actions={
          <Button
            className="gap-2"
            disabled={isLoading}
            onClick={() => handleDownload(activeReport)}
          >
            <ArrowDownToLine className="h-4 w-4" />
            Download CSV
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.id} stat={stat} index={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {REPORT_TYPES.map(({ type, title, description, icon: Icon, color }) => (
          <button
            key={type}
            type="button"
            onClick={() => setActiveReport(type)}
            className={cn(
              "group rounded-2xl border bg-card p-5 text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover",
              activeReport === type
                ? "border-primary/60 ring-1 ring-primary/40"
                : "border-border",
            )}
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
              {title}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
            <span className="mt-3 inline-flex h-7 items-center text-xs font-medium text-primary">
              {isLoading && activeReport === type ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Generate now"
              )}
            </span>
          </button>
        ))}
      </div>

      {Object.keys(summary).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(summary).map(([key, value]) => (
            <div
              key={key}
              className="rounded-xl border border-border bg-card px-4 py-2 text-xs text-muted-foreground shadow-card"
            >
              <span className="font-semibold text-foreground">
                {formatNumber(Number(value ?? 0))}
              </span>{" "}
              {key.replace(/_/g, " ")}
            </div>
          ))}
        </div>
      )}

      <DataTable
        columns={columns}
        data={report?.rows ?? []}
        rowKey={(row) => String(row[report?.columns[0]?.key ?? "id"] ?? "")}
        pageSize={8}
        loading={isLoading}
        emptyMessage="No report data available"
      />
    </div>
  );
}
