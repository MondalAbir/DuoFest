import { ArrowUpRight, CalendarDays, Users } from "lucide-react";
import type { FestEvent } from "@/types";
import { cn } from "@/utils/cn";
import { formatDateShort, formatNumber } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EventCardProps {
  event: FestEvent;
  onQuickView?: (event: FestEvent) => void;
}

export function EventCard({ event, onQuickView }: EventCardProps) {
  return (
    <article className="group flex gap-3.5 rounded-xl border border-border bg-card p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div
        className={cn(
          "relative flex h-[72px] w-16 shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br",
          event.gradient,
        )}
        aria-hidden="true"
      >
        <span className="text-[10px] font-medium text-white/80">
          {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
        </span>
        <span className="text-xl font-bold leading-none text-white">
          {new Date(event.date).getDate()}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="truncate text-sm font-semibold text-foreground">
            {event.name}
          </h4>
          <Badge variant="secondary" className="shrink-0 capitalize">
            {event.category}
          </Badge>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {event.collegeName}
        </p>
        <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDateShort(event.date)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {formatNumber(event.registrations)}
          </span>
          <span className="ml-auto">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary"
              onClick={() => onQuickView?.(event)}
            >
              Quick view
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </span>
        </div>
      </div>
    </article>
  );
}
