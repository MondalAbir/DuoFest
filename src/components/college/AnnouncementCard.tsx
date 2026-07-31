import { Link } from "react-router";
import { ArrowUpRight, CalendarDays, Info, Megaphone, Sparkles, AlertTriangle } from "lucide-react";
import type { CollegeAnnouncement, CollegeAnnouncementTone } from "@/data/college/announcements";
import { collegeAnnouncements } from "@/data/college/announcements";
import { cn } from "@/utils/cn";
import { DashboardChart } from "./DashboardChart";

const TONE_STYLES: Record<
  CollegeAnnouncementTone,
  { icon: typeof Info; classes: string }
> = {
  event: { icon: Megaphone, classes: "bg-primary/10 text-primary" },
  info: { icon: Info, classes: "bg-info/10 text-info" },
  reward: { icon: Sparkles, classes: "bg-warning/10 text-warning" },
  alert: { icon: AlertTriangle, classes: "bg-danger/10 text-danger" },
};

interface AnnouncementCardProps {
  announcement: CollegeAnnouncement;
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const { icon: Icon, classes } = TONE_STYLES[announcement.tone];

  return (
    <div className="flex items-start gap-3 rounded-xl px-1 py-3 transition-colors hover:bg-muted/50">
      <span
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          classes,
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {announcement.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {announcement.description}
        </p>
      </div>
      <span className="mt-0.5 shrink-0 text-[11px] text-muted-foreground">
        {announcement.time}
      </span>
    </div>
  );
}

export function AnnouncementsWidget() {
  return (
    <DashboardChart
      title="Recent Announcements"
      subtitle="Latest updates shared with students"
      action={
        <Link
          to="/admin/college/announcements"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          View all
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      }
    >
      <div className="space-y-0.5">
        {collegeAnnouncements.slice(0, 4).map((announcement) => (
          <AnnouncementCard key={announcement.id} announcement={announcement} />
        ))}
      </div>
    </DashboardChart>
  );
}
