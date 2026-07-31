import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Sparkles } from "lucide-react";
import { collegeStats } from "@/data/college/dashboard";
import { formatDate } from "@/utils/format";
import { StatisticsCard } from "@/components/college/StatisticsCard";
import { DashboardChart } from "@/components/college/DashboardChart";
import { RegistrationOverviewChart } from "@/components/college/RegistrationOverviewChart";
import { EventStatusDonutChart } from "@/components/college/EventStatusDonutChart";
import { CategoryBarList } from "@/components/college/CategoryBarList";
import { UpcomingEventsWidget } from "@/components/college/UpcomingEventCard";
import { AnnouncementsWidget } from "@/components/college/AnnouncementCard";
import { RegistrationList } from "@/components/college/RegistrationList";
import { CheckInList } from "@/components/college/CheckInList";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-36 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
      <Skeleton className="h-72 rounded-2xl" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}

export default function CollegeDashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timeout);
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-col gap-2"
      >
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {formatDate(new Date().toISOString())}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Live activity
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Welcome back, Rahul!
        </h1>
        <p className="text-sm text-muted-foreground sm:text-[15px]">
          Here's what's happening in your college today.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {collegeStats.map((stat, index) => (
          <StatisticsCard key={stat.id} stat={stat} index={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DashboardChart
          title="Registration Overview"
          subtitle="New registrations over the selected period"
          className="lg:col-span-2"
        >
          <RegistrationOverviewChart />
        </DashboardChart>

        <DashboardChart
          title="Event Status"
          subtitle="Distribution across your events"
        >
          <EventStatusDonutChart />
        </DashboardChart>
      </div>

      <DashboardChart
        title="Registrations by Category"
        subtitle="Share of registrations by event category"
      >
        <CategoryBarList />
      </DashboardChart>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <UpcomingEventsWidget />
        <RegistrationList />
        <CheckInList />
        <AnnouncementsWidget />
      </div>
    </div>
  );
}
