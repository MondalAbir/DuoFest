import { useState } from "react";
import { Bell, CreditCard, Building2, CalendarDays, AlertTriangle } from "lucide-react";
import type { NotificationItem } from "@/types";
import { useActivityLogs } from "@/lib/hooks";
import { adaptActivityEntry } from "@/lib/adapters";
import { timeAgo } from "@/utils/format";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

const KIND_STYLES: Record<
  NotificationItem["kind"],
  { icon: typeof Bell; classes: string }
> = {
  payment: { icon: CreditCard, classes: "bg-success/10 text-success" },
  college: { icon: Building2, classes: "bg-primary/10 text-primary" },
  event: { icon: CalendarDays, classes: "bg-info/10 text-info" },
  alert: { icon: AlertTriangle, classes: "bg-danger/10 text-danger" },
};

const KIND_MAP: Record<string, NotificationItem["kind"]> = {
  payment: "payment",
  college: "college",
  event: "event",
  admin: "alert",
  system: "alert",
};

export function NotificationsMenu() {
  const { data, isLoading } = useActivityLogs({ perPage: 8 });
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const display: NotificationItem[] = (data?.items ?? []).map((log) => {
    const entry = adaptActivityEntry(log);
    return {
      id: entry.id,
      title: entry.title,
      description: entry.description,
      time: entry.time,
      read: readIds.has(entry.id),
      kind: KIND_MAP[entry.type] ?? "alert",
    };
  });
  const unreadCount = display.filter((item) => !item.read).length;

  const markAllRead = () => {
    setReadIds(new Set(display.map((item) => item.id)));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications, ${unreadCount} unread`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white ring-2 ring-card">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[340px] p-0"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <DropdownMenuLabel className="px-0 py-0 text-sm font-semibold text-foreground">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
            >
              Mark all as read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="scrollbar-thin max-h-[380px] overflow-y-auto px-1.5 py-1.5">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-14 animate-pulse rounded-xl bg-muted"
                />
              ))
            : display.length === 0 && (
                <p className="px-2.5 py-6 text-center text-sm text-muted-foreground">
                  No recent activity
                </p>
              )}
          {!isLoading && display.map((item) => {
            const config = KIND_STYLES[item.kind];
            const Icon = config.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-muted",
                  !item.read && "bg-primary/[0.03]",
                )}
              >                <span
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    config.classes,
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {item.title}
                    </span>
                    {!item.read && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {item.description}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground/70">
                    {timeAgo(item.time)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
