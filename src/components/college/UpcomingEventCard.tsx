import { Link } from "react-router";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import type { CollegeEvent } from "@/data/college/events";
import { useEvents } from "@/lib/hooks";
import { adaptCollegeEvent } from "@/lib/adapters";
import { useAuth } from "@/context/AuthContext";
import { formatDateShort } from "@/utils/format";
import { cn } from "@/utils/cn";
import { DashboardChart } from "./DashboardChart";

interface UpcomingEventCardProps {
  event: CollegeEvent;
  index?: number;
}

export function UpcomingEventCard({ event, index = 0 }: UpcomingEventCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-card-hover">
      <div className={cn("relative h-24 bg-gradient-to-br", event.gradient)}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute left-3 top-3 rounded-full bg-black/30 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
          {event.category}
        </div>
        <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-xs font-medium text-white">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDateShort(event.date)}
        </div>
      </div>
      <div className="p-3.5">
        <p className="truncate text-sm font-semibold text-foreground">
          {event.name}
        </p>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {event.venue} · {event.registrations.toLocaleString("en-US")} registrations
        </p>
      </div>
    </div>
  );
}

export function UpcomingEventsWidget() {
  const { user } = useAuth();
  const { data } = useEvents({
    college_id: user?.college_id ?? undefined,
    perPage: 100,
  });

  const upcoming = (data?.items ?? [])
    .map(adaptCollegeEvent)
    .filter((event) => event.status === "upcoming")
    .slice(0, 4);

  return (
    <DashboardChart
      title="Upcoming Events"
      subtitle="What's next on your campus"
      action={
        <Link
          to="/admin/college/my-events"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          View all
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      }
    >
      <div className="grid grid-cols-1 gap-3 min-[460px]:grid-cols-2">
        {upcoming.map((event, index) => (
          <UpcomingEventCard key={event.id} event={event} index={index} />
        ))}
      </div>
    </DashboardChart>
  );
}
