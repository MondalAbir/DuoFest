import { Link } from "react-router";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Presentation,
  Users,
} from "lucide-react";
import type { LandingEvent } from "@/types/landing";
import { formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";

interface EventCardProps {
  event: LandingEvent;
  className?: string;
}

const MODE_ICONS: Record<LandingEvent["mode"], typeof Presentation> = {
  Offline: Presentation,
  Online: Presentation,
  Hybrid: Presentation,
};

export function EventCard({ event, className }: EventCardProps) {
  const ModeIcon = MODE_ICONS[event.mode];
  const progress = Math.min((event.registered / event.capacity) * 100, 100);

  return (
    <Link
      to={`/events/${event.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-card-hover",
        className,
      )}
    >
      <div className={cn("relative bg-gradient-to-br p-5", event.gradient)}>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-foreground">
            {event.category}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
            <ModeIcon className="h-3.5 w-3.5" />
            {event.mode}
          </span>
        </div>
        <div className="mt-6 flex items-end justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(event.date)}
          </span>
          {event.fee === 0 ? (
            <span className="text-sm font-bold text-white">Free</span>
          ) : (
            <span className="text-sm font-bold text-white">
              ₹{event.fee.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
          {event.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {event.tagline}
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {event.college}, {event.city}
        </p>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {event.registered.toLocaleString("en-IN")} /
              {event.capacity.toLocaleString("en-IN")} spots
            </span>
            <span className="text-primary">{Math.round(progress)}% full</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full bg-gradient-to-r", event.gradient)}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          View details
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
