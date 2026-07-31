import { motion } from "framer-motion";
import { Clock4, DoorOpen, MapPin, Users } from "lucide-react";
import type { VolunteerTodayEvent } from "@/data/volunteer/dashboard";
import { useCountUp } from "@/hooks/use-count-up";

function EventCapacity({ event }: { event: VolunteerTodayEvent }) {
  const animated = useCountUp(event.entered, { duration: 1000 });
  return (
    <>
      {Math.round(animated).toLocaleString("en-US")} /{" "}
      {event.capacity.toLocaleString("en-US")}
    </>
  );
}

export function TodayEventCard({ event }: { event: VolunteerTodayEvent }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
    >
      <div className={`bg-gradient-to-r ${event.gradient} px-5 py-5 text-white`}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
            Today's Event
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            Live
          </span>
        </div>
        <h2 className="mt-1.5 text-xl font-bold tracking-tight sm:text-2xl">
          {event.name}
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-white/90 sm:grid-cols-2">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock4 className="h-4 w-4 shrink-0" />
            {event.time}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-border">
        <div className="px-5 py-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <DoorOpen className="h-3.5 w-3.5 text-primary" />
            Assigned Gate
          </p>
          <p className="mt-1 text-base font-bold tracking-tight text-foreground">
            {event.gate}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{event.shift}</p>
        </div>
        <div className="px-5 py-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Users className="h-3.5 w-3.5 text-success" />
            Capacity
          </p>
          <p className="mt-1 text-base font-bold tracking-tight text-foreground">
            <EventCapacity event={event} />
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            students checked in
          </p>
        </div>
      </div>
    </motion.section>
  );
}
