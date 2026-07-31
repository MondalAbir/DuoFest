import { Badge } from "@/components/ui/badge";
import type { StatusKey } from "@/utils/filter";

type Variant = "success" | "warning" | "danger" | "info" | "muted" | "default";

const STATUS_MAP: Record<StatusKey, { variant: Variant; label: string }> = {
  active: { variant: "success", label: "Active" },
  pending: { variant: "warning", label: "Pending" },
  suspended: { variant: "danger", label: "Suspended" },
  blocked: { variant: "danger", label: "Blocked" },
  inactive: { variant: "muted", label: "Inactive" },
  paid: { variant: "success", label: "Paid" },
  failed: { variant: "danger", label: "Failed" },
  live: { variant: "info", label: "Live" },
  upcoming: { variant: "info", label: "Upcoming" },
  completed: { variant: "muted", label: "Completed" },
  cancelled: { variant: "danger", label: "Cancelled" },
  confirmed: { variant: "success", label: "Confirmed" },
  refunded: { variant: "muted", label: "Refunded" },
  assigned: { variant: "info", label: "Assigned" },
  "checked-in": { variant: "success", label: "Checked in" },
  late: { variant: "warning", label: "Late" },
  duplicate: { variant: "warning", label: "Duplicate" },
  rejected: { variant: "danger", label: "Rejected" },
  attended: { variant: "success", label: "Attended" },
  eligible: { variant: "info", label: "Eligible" },
  generated: { variant: "success", label: "Generated" },
  sent: { variant: "info", label: "Sent" },
  downloaded: { variant: "muted", label: "Downloaded" },
  current: { variant: "success", label: "Current" },
  published: { variant: "success", label: "Published" },
  draft: { variant: "muted", label: "Draft" },
  scheduled: { variant: "info", label: "Scheduled" },
  ready: { variant: "success", label: "Ready" },
  generating: { variant: "info", label: "Generating" },
  onboarding: { variant: "info", label: "Onboarding" },
  trial: { variant: "info", label: "Trial" },
  expired: { variant: "danger", label: "Expired" },
  success: { variant: "success", label: "Success" },
  warning: { variant: "warning", label: "Warning" },
  danger: { variant: "danger", label: "Danger" },
};

export function StatusBadge({
  status,
  dot = false,
}: {
  status: StatusKey;
  dot?: boolean;
}) {
  const config = STATUS_MAP[status] ?? {
    variant: "muted" as const,
    label: String(status),
  };

  return (
    <Badge variant={config.variant}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {config.label}
    </Badge>
  );
}
