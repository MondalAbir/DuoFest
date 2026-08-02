import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import type { DashboardStat } from "@/types";
import { useAnalytics, useRegistrations, useTransactions } from "@/lib/hooks";
import { adaptAnalytics, adaptPayment, adaptRegistration } from "@/lib/adapters";
import { formatCurrencyCompact, formatNumber } from "@/utils/format";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { ChartCard } from "@/components/charts/ChartCard";
import { RevenueDonutChart } from "@/components/charts/RevenueDonutChart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS } from "@/utils/constants";
import { ChartTooltip } from "@/components/charts/ChartTooltip";

type RangeKey = "today" | "week" | "month" | "year";

const RANGE_OPTIONS: Array<{ value: RangeKey; label: string }> = [
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 days" },
  { value: "month", label: "Last 30 days" },
  { value: "year", label: "This year" },
];

export default function AnalyticsPage() {
  const [range, setRange] = useState<RangeKey>("month");

  const { data, isLoading } = useAnalytics();
  const { data: registrationsData } = useRegistrations({ perPage: 100 });
  const { data: transactionsData } = useTransactions({ perPage: 100 });

  const analytics = useMemo(() => (data ? adaptAnalytics(data) : null), [data]);
  const registrations = useMemo(
    () => (registrationsData?.items ?? []).map(adaptRegistration),
    [registrationsData],
  );
  const payments = useMemo(
    () => (transactionsData?.items ?? []).map(adaptPayment),
    [transactionsData],
  );

  const stats: DashboardStat[] = analytics?.stats ?? [];

  const topColleges = useMemo(() => {
    const counts = new Map<string, number>();
    for (const registration of registrations) {
      const name = registration.collegeName || "Unknown";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    const total = registrations.length || 1;
    return [...counts.entries()]
      .map(([name, count]) => ({ name, registrations: count, share: (count / total) * 100 }))
      .sort((a, b) => b.registrations - a.registrations)
      .slice(0, 5);
  }, [registrations]);

  const snapshotBars = useMemo(() => {
    const total = registrations.length || 1;
    const confirmed = registrations.filter((r) => r.status === "confirmed").length;
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = payments.reduce(
      (sum, p) => (p.status === "paid" ? sum + p.amount : sum),
      0,
    );
    const totalColleges = stats.find((s) => s.id === "stat-total-colleges")?.value ?? 0;
    const activeColleges = stats.find((s) => s.id === "stat-active-colleges")?.value ?? 0;
    return [
      {
        label: "Confirmed registrations",
        value: Math.round((confirmed / total) * 100),
        color: CHART_COLORS.primary,
      },
      {
        label: "Paid revenue",
        value: totalAmount ? Math.round((paidAmount / totalAmount) * 100) : 0,
        color: CHART_COLORS.info,
      },
      {
        label: "Active colleges",
        value: totalColleges ? Math.round((activeColleges / totalColleges) * 100) : 0,
        color: CHART_COLORS.success,
      },
    ];
  }, [registrations, payments, stats]);

  const trend = analytics?.registrationTrends[range] ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Deep insights into platform performance"
        actions={
          <Select value={range} onValueChange={(value) => setRange(value as RangeKey)}>
            <SelectTrigger className="w-36" aria-label="Analytics time range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.id} stat={stat} index={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard
            title="Registration Trend"
            subtitle="Registrations across the selected range"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={trend}
                margin={{ top: 8, right: 8, bottom: 0, left: -14 }}
              >
                <CartesianGrid
                  stroke={CHART_COLORS.grid}
                  strokeDasharray="4 4"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                  dy={6}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                />
                <Tooltip
                  content={<ChartTooltip valueFormatter={formatNumber} />}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Registrations"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: CHART_COLORS.primary }}
                  animationDuration={900}
                  animationEasing="ease-out"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div>
          <ChartCard title="Revenue Mix" subtitle="Revenue by category">
            <RevenueDonutChart
              data={analytics?.revenueBreakdown ?? []}
              centerLabel="Total revenue"
              valueFormatter={formatCurrencyCompact}
            />
          </ChartCard>
        </div>
      </div>

      <ChartCard
        title="Top Performing Colleges"
        subtitle="Ranked by registrations"
        action={
          <Button variant="outline" size="sm" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Full report
          </Button>
        }
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            {topColleges.length === 0 ? (
              <p className="py-6 text-sm text-muted-foreground">
                No registration data yet.
              </p>
            ) : (
              topColleges.map((college, index) => (
                <motion.div
                  key={college.name}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.06 }}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {college.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {college.registrations} registrations
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatNumber(college.registrations)}
                    </p>
                    <p className="inline-flex items-center gap-0.5 text-xs text-success">
                      <TrendingUp className="h-3 w-3" />
                      {college.share.toFixed(1)}% share
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
          <div className="flex flex-col justify-center rounded-xl border border-border bg-muted/30 p-5">
            <h3 className="text-sm font-semibold text-foreground">
              Platform snapshot
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Live health indicators computed from registrations, payments and
              college activity.
            </p>
            <div className="mt-4 space-y-2.5">
              {snapshotBars.map((bar) => (
                <div key={bar.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{bar.label}</span>
                    <span className="font-semibold text-foreground">
                      {bar.value}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${bar.value}%` }}
                      transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: bar.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ChartCard>
    </div>
  );
}
