import { useState } from "react";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Megaphone,
  AlertTriangle,
} from "lucide-react";
import type { CollegeNotificationItem } from "@/data/college/dashboard";
import { collegeNotifications } from "@/data/college/dashboard";
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
  CollegeNotificationItem["kind"],
  { icon: typeof Bell; classes: string }
> = {
  event: { icon: CalendarDays, classes: "bg-info/10 text-info" },
  registration: { icon: CheckCircle2, classes: "bg-success/10 text-success" },
  announcement: { icon: Megaphone, classes: "bg-primary/10 text-primary" },
  alert: { icon: AlertTriangle, classes: "bg-warning/10 text-warning" },
};

export function CollegeNotificationsMenu() {
  const [items, setItems] = useState<CollegeNotificationItem[]>(collegeNotifications);
  const unreadCount = items.filter((item) => !item.read).length;

  const markAllRead = () => {
    setItems((current) => current.map((item) => ({ ...item, read: true })));
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
      <DropdownMenuContent align="end" className="w-[340px] p-0">
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
          {items.map((item) => {
            const { icon: Icon, classes } = KIND_STYLES[item.kind];
            return (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-muted",
                  !item.read && "bg-primary/[0.03]",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    classes,
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
                    {item.time}
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
