import { motion } from "framer-motion";
import { CalendarDays, Sparkles } from "lucide-react";
import type { CollegeStat } from "@/data/college/dashboard";
import { useAuth } from "@/context/AuthContext";
import { useEvents } from "@/lib/hooks";
import { adaptEvent } from "@/lib/adapters";
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
  const { user } = useAuth();
  const currentUserCollegeId = user?.college_id ?? undefined;
  const { data: eventsData, isLoading } = useEvents({
    college_id: currentUserCollegeId,
    perPage: 100,
  });

  const events = (eventsData?.items ?? []).map(adaptEvent);
  const now = new Date();

  const collegeStats: CollegeStat[] = [
    {
      id: "cs-total-events",
      label: "Total Events",
      value: events.length,
      growth: 0,
      icon: "calendar",
      tileGradient: "from-indigo-500 to-violet-500",
      softGradient: "from-indigo-500/[0.07]",
      tint: "text-indigo-500",
    },
    {
      id: "cs-upcoming-events",
      label: "Upcoming Events",
      value: events.filter(
        (event) => event.status === "upcoming" || new Date(event.date) > now,
      ).length,
      growth: 0,
      icon: "sparkles",
      tileGradient: "from-sky-500 to-blue-500",
      softGradient: "from-sky-500/[0.07]",
      tint: "text-sky-500",
    },
    {
      id: "cs-registrations",
      label: "Total Registrations",
      value: events.reduce((sum, event) => sum + event.registrations, 0),
      growth: 0,
      icon: "ticket",
      tileGradient: "from-fuchsia-500 to-purple-500",
      softGradient: "from-fuchsia-500/[0.07]",
      tint: "text-fuchsia-500",
    },
    {
      id: "cs-checkins",
      label: "Today's Check-ins",
      value: 0,
      growth: 0,
      icon: "qr",
      tileGradient: "from-emerald-500 to-teal-500",
      softGradient: "from-emerald-500/[0.07]",
      tint: "text-emerald-500",
    },
    {
      id: "cs-volunteers",
      label: "Total Volunteers",
      value: 0,
      growth: 0,
      icon: "users",
      tileGradient: "from-amber-500 to-orange-500",
      softGradient: "from-amber-500/[0.07]",
      tint: "text-amber-500",
    },
    {
      id: "cs-revenue",
      label: "Total Revenue",
      value: 0,
      prefix: "$",
      growth: 0,
      icon: "wallet",
      tileGradient: "from-rose-500 to-pink-500",
      softGradient: "from-rose-500/[0.07]",
      tint: "text-rose-500",
    },
  ];

  if (isLoading) return <DashboardSkeleton />;

  const firstName = user?.name?.split(" ")[0] ?? "there";

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
          Welcome back, {firstName}!
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
