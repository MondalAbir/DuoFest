import { CalendarClock, Pin, Users2 } from "lucide-react";
import type { Announcement } from "@/types";
import { formatDateTime } from "@/utils/format";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

interface AnnouncementCardProps {
  announcement: Announcement;
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover",
        announcement.pinned && "border-primary/25 bg-gradient-to-br from-primary/[0.03] to-transparent",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {announcement.pinned && (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Pin className="h-4 w-4" />
            </span>
          )}
          <h3 className="truncate text-sm font-semibold text-foreground">
            {announcement.title}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge status={announcement.status} />
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {announcement.summary}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-3.5 text-xs text-muted-foreground">
        <Badge variant="secondary" className="gap-1.5">
          <Users2 className="h-3 w-3" />
          {announcement.audience}
        </Badge>
        <span className="inline-flex items-center gap-1">
          <CalendarClock className="h-3.5 w-3.5" />
          {formatDateTime(announcement.createdAt)}
        </span>
        <span className="ml-auto hidden font-medium text-foreground/80 sm:inline">
          {announcement.author}
        </span>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs sm:hidden">
          View
        </Button>
      </div>
    </article>
  );
}
