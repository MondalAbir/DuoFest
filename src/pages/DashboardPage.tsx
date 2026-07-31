import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { motion } from "framer-motion";
import { dashboardStats } from "@/data/dashboard";
import { registrationTrends, revenueBreakdown, collegeGrowth } from "@/data/charts";
import { StatCard } from "@/components/common/StatCard";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { RecentCollegesWidget } from "@/components/dashboard/RecentCollegesWidget";
import { LatestEventsWidget } from "@/components/dashboard/LatestEventsWidget";
import { RecentPaymentsWidget } from "@/components/dashboard/RecentPaymentsWidget";
import { PlatformActivityWidget } from "@/components/dashboard/PlatformActivityWidget";
import { ChartCard } from "@/components/charts/ChartCard";
import { RegistrationAreaChart } from "@/components/charts/RegistrationAreaChart";
import { RevenueDonutChart } from "@/components/charts/RevenueDonutChart";
import { CollegeGrowthBarChart } from "@/components/charts/CollegeGrowthBarChart";
import { StatCardSkeleton, ChartSkeleton, TableSkeleton } from "@/components/common/Skeletons";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RangeKey = keyof typeof registrationTrends;

const RANGE_OPTIONS: Array<{ value: RangeKey; label: string }> = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
];

export default function DashboardPage() {
  const [range, setRange] = useState<RangeKey>("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 750);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="space-y-6">
      <WelcomeBanner />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-1"
      >
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, Super Admin. Here's what's happening today.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <StatCardSkeleton key={index} />
            ))
          : dashboardStats.map((stat, index) => (
              <StatCard key={stat.id} stat={stat} index={index} />
            ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ChartCard
              title="Registration Overview"
              subtitle="Registrations across all colleges"
              action={
                <Select
                  value={range}
                  onValueChange={(value) => setRange(value as RangeKey)}
                >
                  <SelectTrigger
                    className="w-36"
                    aria-label="Registration time range"
                  >
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
            >
              <RegistrationAreaChart data={registrationTrends[range]} />
            </ChartCard>
          )}
        </div>
        <div>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ChartCard
              title="Revenue Overview"
              subtitle="Income distribution this quarter"
            >
              <RevenueDonutChart data={revenueBreakdown} />
            </ChartCard>
          )}
        </div>
      </div>

      <div>
        {loading ? (
          <ChartSkeleton />
        ) : (
          <ChartCard
            title="College Growth"
            subtitle="New colleges and students added per month"
          >
            <CollegeGrowthBarChart data={collegeGrowth} />
          </ChartCard>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <div className="lg:col-span-2 xl:col-span-2">
          {loading ? (
            <TableSkeleton />
          ) : (
            <RecentCollegesWidget />
          )}
        </div>
        <div>
          {loading ? (
            <TableSkeleton rows={4} />
          ) : (
            <LatestEventsWidget />
          )}
        </div>
        <div className="lg:col-span-2 xl:col-span-2">
          {loading ? (
            <TableSkeleton />
          ) : (
            <RecentPaymentsWidget />
          )}
        </div>
        <div>
          {loading ? (
            <TableSkeleton rows={5} />
          ) : (
            <PlatformActivityWidget />
          )}
        </div>
      </div>

      {!loading && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export summary
          </Button>
        </div>
      )}
    </div>
  );
}
