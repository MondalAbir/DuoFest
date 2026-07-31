import { useMemo } from "react";
import { Download, IndianRupee, Ticket, TrendingUp, UsersRound } from "lucide-react";
import { collegeEvents } from "@/data/college/events";
import { categoryShares } from "@/data/college/analytics";
import { formatCompact, formatCurrency } from "@/utils/format";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ChartCard } from "@/components/charts/ChartCard";
import { RegistrationOverviewChart } from "@/components/college/RegistrationOverviewChart";
import { EventStatusDonutChart } from "@/components/college/EventStatusDonutChart";
import { RevenueDonutChart } from "@/components/charts/RevenueDonutChart";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import type { DonutSlice } from "@/types";

const buildColumns: DataTableColumn<(typeof collegeEvents)[number]>[] = [
  {
    key: "name",
    header: "Event",
    cell: (event) => (
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{event.name}</p>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">
          {event.category} · {event.venue}
        </p>
      </div>
    ),
  },
  {
    key: "registrations",
    header: "Registrations",
    sortable: true,
    sortValue: (event) => event.registrations,
    hideBelow: "sm",
    cell: (event) => (
      <span className="text-sm font-medium text-foreground">
        {event.registrations.toLocaleString("en-US")}
      </span>
    ),
  },
  {
    key: "revenue",
    header: "Revenue",
    sortable: true,
    sortValue: (event) => event.revenue,
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
];

export default function CollegeReportsPage() {
  const totals = useMemo(
    () => ({
      registrations: collegeEvents.reduce(
        (sum, event) => sum + event.registrations,
        0,
      ),
      revenue: collegeEvents.reduce((sum, event) => sum + event.revenue, 0),
      volunteers: collegeEvents.reduce(
        (sum, event) => sum + event.volunteers,
        0,
      ),
    }),
    [],
  );

  const revenueSlices = useMemo<DonutSlice[]>(() => {
    const grouped = new Map<string, number>();
    collegeEvents.forEach((event) => {
      grouped.set(
        event.category,
        (grouped.get(event.category) ?? 0) + event.revenue,
      );
    });
    const palette = ["#5B5CEB", "#8B5CF6", "#F59E0B", "#06B6D4", "#10B981", "#EC4899"];
    return Array.from(grouped.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], index) => ({
        name,
        value,
        color: palette[index % palette.length],
      }));
  }, []);

  const stats = useMemo(
    () => [
      {
        label: "Total Events",
        value: collegeEvents.length,
        icon: Ticket,
        tint: "text-primary",
      },
      {
        label: "Total Registrations",
        value: formatCompact(totals.registrations),
        icon: UsersRound,
        tint: "text-success",
      },
      {
        label: "Total Revenue",
        value: formatCurrency(totals.revenue),
        icon: IndianRupee,
        tint: "text-warning",
      },
      {
        label: "Volunteers Engaged",
        value: totals.volunteers,
        icon: TrendingUp,
        tint: "text-info",
      },
    ],
    [totals],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Performance overview across all events"
        actions={
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export Report</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-card p-5 shadow-card"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
              <stat.icon className={`h-5 w-5 ${stat.tint}`} />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard
          title="Registration Overview"
          subtitle="Weekly registration volume"
          className="xl:col-span-2"
        >
          <RegistrationOverviewChart />
        </ChartCard>

        <ChartCard
          title="Event Status"
          subtitle="Distribution by event lifecycle"
        >
          <EventStatusDonutChart />
        </ChartCard>

        <ChartCard
          title="Revenue by Category"
          subtitle="Contribution across categories"
        >
          <RevenueDonutChart data={revenueSlices} centerLabel="Revenue" />
        </ChartCard>
      </div>

      <ChartCard title="Category Share" subtitle="Registrations by event category">
        <div className="space-y-5">
          {categoryShares.map((share) => (
            <div key={share.id} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: share.color }}
                  />
                  <span className="text-sm text-foreground">{share.category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">
                    {formatCompact(share.value)}
                  </span>
                  <span className="w-11 text-right text-xs text-muted-foreground">
                    {share.percent}%
                  </span>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${share.percent}%`,
                    backgroundColor: share.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard title="Event Performance" subtitle="Ranked by registrations and revenue">
        <DataTable
          columns={buildColumns}
          data={collegeEvents}
          rowKey={(event) => event.id}
          pageSize={8}
          compact
          emptyMessage="No events"
        />
      </ChartCard>
    </div>
  );
}
