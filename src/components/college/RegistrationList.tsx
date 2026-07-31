import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { recentRegistrations } from "@/data/college/registrations";
import { formatCurrency } from "@/utils/format";
import { UserAvatar } from "@/components/common/UserAvatar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DashboardChart } from "./DashboardChart";

export function RegistrationList() {
  return (
    <DashboardChart
      title="Recent Registrations"
      subtitle="Latest students signing up"
      action={
        <Link
          to="/admin/college/registrations"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          View all
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      }
    >
      <div className="space-y-1">
        {recentRegistrations.slice(0, 5).map((registration) => (
          <div
            key={registration.id}
            className="flex items-center gap-3 rounded-xl px-1 py-2.5 transition-colors hover:bg-muted/50"
          >
            <UserAvatar
              name={registration.studentName}
              color={registration.avatarColor}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {registration.studentName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {registration.eventName} · {formatCurrency(registration.amount)}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <StatusBadge status={registration.status} dot />
              <span className="text-[11px] text-muted-foreground">
                {registration.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </DashboardChart>
  );
}
