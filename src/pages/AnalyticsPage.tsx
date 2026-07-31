import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import type { DashboardStat } from "@/types";
import { revenueTrend, audienceMix, topPerformingColleges } from "@/data/charts";
import { formatCurrencyCompact, formatNumber } from "@/utils/format";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { ChartCard } from "@/components/charts/ChartCard";
import { RegistrationAreaChart } from "@/components/charts/RegistrationAreaChart";
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

export default function AnalyticsPage() {
  const [range, setRange] = useState("quarter");

  const stats = useMemo<DashboardStat[]>(() => [
    {
      id: "an-views",
      title: "Page Views",
      value: 482000,
      delta: { value: 21.6, direction: "up", label: "vs last month" },
      icon: "users",
      tint: "primary",
    },
    {
      id: "an-conversion",
      title: "Conversion Rate",
      value: 3.8,
      decimals: 1,
      suffix: "%",
      delta: { value: 0.6, direction: "up", label: "vs last month" },
      icon: "ticket",
      tint: "success",
    },
    {
      id: "an-bounce",
      title: "Bounce Rate",
      value: 32.4,
      decimals: 1,
      suffix: "%",
      delta: { value: 1.2, direction: "down", label: "vs last month" },
      icon: "sparkles",
      tint: "warning",
    },
    {
      id: "an-avg",
      title: "Avg. Session",
      value: 4.6,
      decimals: 1,
      suffix: "m",
      delta: { value: 0.3, direction: "up", label: "vs last month" },
      icon: "dollar",
      tint: "info",
    },
  ], []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Deep insights into platform performance"
        actions={
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-36" aria-label="Analytics time range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
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
            title="Revenue Trend"
            subtitle="Monthly revenue across the platform"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={revenueTrend}
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
                  tickFormatter={(value: number) => `$${value / 1000}k`}
                />
                <Tooltip
                  content={<ChartTooltip valueFormatter={formatCurrencyCompact} />}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Revenue"
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
          <ChartCard title="Audience Mix" subtitle="Users by role">
            <RevenueDonutChart
              data={audienceMix}
              centerLabel="Total users"
              valueFormatter={(value) => `${value}%`}
            />
          </ChartCard>
        </div>
      </div>

      <ChartCard
        title="Top Performing Colleges"
        subtitle="Ranked by registrations this quarter"
        action={
          <Button variant="outline" size="sm" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Full report
          </Button>
        }
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            {topPerformingColleges.map((college, index) => (
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
                      {college.events} events
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {formatNumber(college.registrations)}
                  </p>
                  <p className="inline-flex items-center gap-0.5 text-xs text-success">
                    <TrendingUp className="h-3 w-3" />
                    +{college.trend}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex flex-col justify-center rounded-xl border border-border bg-muted/30 p-5">
            <h3 className="text-sm font-semibold text-foreground">
              Monthly snapshot
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              The top 5 colleges drive{" "}
              <span className="font-semibold text-foreground">61%</span> of all
              registrations. Technical and Music categories see the highest
              conversion from visit to ticket.
            </p>
            <div className="mt-4 space-y-2.5">
              {[
                { label: "Registrations", value: 78, color: CHART_COLORS.primary },
                { label: "Revenue", value: 64, color: CHART_COLORS.info },
                { label: "Student retention", value: 52, color: CHART_COLORS.success },
              ].map((bar) => (
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
