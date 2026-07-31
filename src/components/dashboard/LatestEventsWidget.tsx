import { useState } from "react";
import { Link } from "react-router";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { events } from "@/data/events";
import { EventCard } from "@/components/cards/EventCard";
import type { FestEvent } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function EventQuickView({
  event,
  onClose,
}: {
  event: FestEvent | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={event !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {event && (
          <>
            <DialogHeader>
              <DialogTitle>{event.name}</DialogTitle>
              <DialogDescription>
                {event.collegeName} · {event.category}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
                  <p className="text-lg font-bold text-foreground">
                    {event.registrations.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Registrations
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
                  <p className="text-lg font-bold text-foreground">
                    ${(event.revenue / 1000).toFixed(1)}k
                  </p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
                  <p className="text-lg font-bold capitalize text-foreground">
                    {event.status}
                  </p>
                  <p className="text-xs text-muted-foreground">Status</p>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function LatestEventsWidget() {
  const [selected, setSelected] = useState<FestEvent | null>(null);

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card transition-shadow duration-300 hover:shadow-card-hover">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            Latest Events
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Happening across colleges
          </p>
        </div>
        <Link
          to="/admin/events"
          className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          View all
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto pr-1">
        {events.slice(0, 5).map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onQuickView={setSelected}
          />
        ))}
      </div>
      <EventQuickView event={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
