import {
  Building2,
  CreditCard,
  CalendarDays,
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Server,
  type LucideIcon,
} from "lucide-react";
import type { ActivityEntry } from "@/types";
import { timeAgo } from "@/utils/format";
import { cn } from "@/utils/cn";

const TYPE_STYLES: Record<
  ActivityEntry["type"],
  { icon: LucideIcon; classes: string }
> = {
  college: { icon: Building2, classes: "bg-primary/10 text-primary" },
  admin: { icon: ShieldCheck, classes: "bg-violet-500/10 text-violet-500" },
  payment: { icon: CreditCard, classes: "bg-success/10 text-success" },
  event: { icon: CalendarDays, classes: "bg-info/10 text-info" },
  volunteer: { icon: UserCheck, classes: "bg-warning/10 text-warning" },
  student: { icon: GraduationCap, classes: "bg-rose-500/10 text-rose-500" },
  system: { icon: Server, classes: "bg-muted text-muted-foreground" },
};

interface PlatformTimelineProps {
  items: ActivityEntry[];
}

export function PlatformTimeline({ items }: PlatformTimelineProps) {
  return (
    <ol className="relative space-y-5 pl-1 pr-1 pt-1">
      {items.map((item, index) => {
        const config = TYPE_STYLES[item.type];
        const Icon = config.icon;
        const isLast = index === items.length - 1;
        return (
          <li key={item.id} className="relative flex gap-3.5">
            {!isLast && (
              <span
                className="absolute left-[15px] top-9 h-[calc(100%-8px)] w-px bg-border"
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-background",
                config.classes,
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-foreground">
                {item.title}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {item.description}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground/70">
                {timeAgo(item.time)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
