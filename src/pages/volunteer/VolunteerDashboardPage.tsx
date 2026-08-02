import { motion } from "framer-motion";
import { CalendarDays, QrCode } from "lucide-react";
import { Link } from "react-router";
import { useVolunteerProfile, useAssignedEvents, useTodayEntries } from "@/lib/hooks";
import { adaptVolunteerEntry } from "@/lib/adapters";
import type { VolunteerDashboardStat } from "@/data/volunteer/dashboard";
import { formatDate, formatDateTime } from "@/utils/format";
import { VolunteerStatCard } from "@/components/volunteer/VolunteerStatCard";
import { TodayEventCard } from "@/components/volunteer/TodayEventCard";
import { RecentEntryList } from "@/components/volunteer/RecentEntryList";
import { Button } from "@/components/ui/button";

function formatTimeRange(start: string | null, end: string | null): string {
  if (!start && !end) return "Time TBA";
  if (!start) return formatDateTime(end ?? "");
  if (!end) return formatDateTime(start);
  const formatTime = (value: string) =>
    new Date(value).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export default function VolunteerDashboardPage() {
  const { data: profile, isLoading: profileLoading } = useVolunteerProfile();
  const { data: assignedEvents } = useAssignedEvents();
  const { data: todayEntries } = useTodayEntries();

  const firstName = profile?.user?.name?.split(" ")[0] ?? "there";
  const assignment = assignedEvents?.[0];
  const event = assignment?.event;

  const entered = profile?.today_entries_count ?? 0;
  const capacity = event?.capacity ?? 0;

  const eventDate = event?.starts_at
    ? formatDate(event.starts_at)
    : "Date TBA";

  const stats: VolunteerDashboardStat[] = [
    {
      id: "vs-event",
      label: "Today's Event",
      value: event?.title ?? (profileLoading ? "Loading…" : "No event assigned"),
      icon: "calendar",
      tint: "primary",
      format: "text",
      hint: event?.status ?? "Live now",
    },
    {
      id: "vs-entered",
      label: "Students Entered",
      value: entered,
      icon: "users",
      tint: "success",
      format: "number",
      hint: capacity ? `of ${capacity.toLocaleString()} tickets` : "via your gate",
    },
    {
      id: "vs-remaining",
      label: "Remaining Entries",
      value: capacity ? Math.max(0, capacity - entered) : entered,
      icon: "ticket",
      tint: "info",
      format: "number",
      hint: capacity ? `of ${capacity.toLocaleString()} tickets` : "capacity not set",
    },
    {
      id: "vs-gate",
      label: "Assigned Gate",
      value: assignment?.role ?? "—",
      icon: "gate",
      tint: "warning",
      format: "text",
      hint: assignment?.shift_start_at
        ? formatTimeRange(assignment.shift_start_at, assignment.shift_end_at)
        : "—",
    },
  ];

  const todayEvent = event
    ? {
        name: event.title,
        shortName: event.title.split(" ").slice(0, 2).join(" "),
        venue: [event.college?.name, event.venue].filter(Boolean).join(" · ") || "Venue TBA",
        date: eventDate,
        time: formatTimeRange(event.starts_at, event.ends_at),
        gate: assignment?.role ?? "Main Gate",
        shift: assignment?.shift_start_at
          ? formatTimeRange(assignment.shift_start_at, assignment.shift_end_at)
          : "—",
        gradient: "from-[#5B5CEB] via-[#7C3AED] to-[#DB2777]",
        capacity: capacity || entered || 1,
        entered,
      }
    : null;

  const recentEntries = (todayEntries ?? []).slice(0, 5).map(adaptVolunteerEntry);

  return (
    <div className="space-y-5 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            {eventDate}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Hi {firstName}, ready to scan?
          </h1>
          <p className="text-sm text-muted-foreground">
            {assignment?.role ?? "No gate assigned"} ·{" "}
            {assignment?.shift_start_at
              ? formatTimeRange(assignment.shift_start_at, assignment.shift_end_at)
              : "—"}
          </p>
        </div>
        <Button asChild size="lg" className="h-12 gap-2 px-6">
          <Link to="/admin/volunteer/scan">
            <QrCode className="h-5 w-5" />
            Open Scanner
          </Link>
        </Button>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <VolunteerStatCard key={stat.id} stat={stat} index={index} />
        ))}
      </div>

      {todayEvent && <TodayEventCard event={todayEvent} />}

      {!todayEvent && !profileLoading && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
          You have no assigned events today. Contact your college admin for an
          assignment.
        </div>
      )}

      <RecentEntryList entries={recentEntries} />
    </div>
  );
}
