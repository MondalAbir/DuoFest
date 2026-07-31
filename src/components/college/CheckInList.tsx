import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import type { CollegeCheckIn } from "@/data/college/dashboard";
import { todayCheckIns } from "@/data/college/dashboard";
import { UserAvatar } from "@/components/common/UserAvatar";
import { cn } from "@/utils/cn";
import { DashboardChart } from "./DashboardChart";

const STATUS_STYLES: Record<CollegeCheckIn["status"], { label: string; classes: string }> = {
  "checked-in": { label: "Checked in", classes: "bg-success/10 text-success" },
  pending: { label: "Pending", classes: "bg-warning/10 text-warning" },
  late: { label: "Late", classes: "bg-danger/10 text-danger" },
};

export function CheckInList() {
  return (
    <DashboardChart
      title="Today's Check-ins"
      subtitle="QR entry activity for today"
      action={
        <Link
          to="/admin/college/check-in"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          View all
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      }
    >
      <div className="space-y-1">
        {todayCheckIns.map((checkIn) => {
          const status = STATUS_STYLES[checkIn.status];
          return (
            <div
              key={checkIn.id}
              className="flex items-center gap-3 rounded-xl px-1 py-2.5 transition-colors hover:bg-muted/50"
            >
              <UserAvatar
                name={checkIn.studentName}
                color={checkIn.avatarColor}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {checkIn.studentName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {checkIn.eventName}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                    status.classes,
                  )}
                >
                  {status.label}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {checkIn.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardChart>
  );
}
