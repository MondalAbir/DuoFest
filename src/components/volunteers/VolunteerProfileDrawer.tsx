import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  Building2,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  History,
  Mail,
  MapPin,
  Pencil,
  Phone,
  QrCode,
  Sparkles,
  TrendingUp,
  UserX,
} from "lucide-react";
import type { Volunteer } from "@/types";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format";
import { getVolunteerDetails, type VolunteerActivityItem } from "@/data/volunteerDetails";
import { UserAvatar } from "@/components/common/UserAvatar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { SectionHeading } from "@/components/colleges/SectionHeading";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";

interface VolunteerProfileDrawerProps {
  volunteer: Volunteer | null;
  onOpenChange: (open: boolean) => void;
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card px-3.5 py-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  tint,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tint: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card px-3.5 py-3",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className={cn("h-3.5 w-3.5", tint)} />
        {label}
      </div>
      <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}

const ACTIVITY_ICONS: Record<VolunteerActivityItem["type"], LucideIcon> = {
  event: CalendarDays,
  scan: QrCode,
  shift: Clock3,
  reward: Award,
  system: Sparkles,
};

const ACTIVITY_TINTS: Record<VolunteerActivityItem["type"], string> = {
  event: "bg-primary/10 text-primary",
  scan: "bg-success/10 text-success",
  shift: "bg-info/10 text-info",
  reward: "bg-warning/10 text-warning",
  system: "bg-muted text-muted-foreground",
};

function ProgressBar({
  value,
  tint,
}: {
  value: number;
  tint?: string;
}) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn("h-full rounded-full bg-gradient-to-r from-primary to-info", tint)}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function VolunteerProfileDrawer({
  volunteer,
  onOpenChange,
}: VolunteerProfileDrawerProps) {
  const [editing, setEditing] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  if (!volunteer) return null;

  const details = getVolunteerDetails(volunteer);
  const open = Boolean(volunteer);

  const handleEdit = async () => {
    if (editing) return;
    setEditing(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    // Dummy action – replace with an API call later.
    console.log("Volunteer edit (dummy):", volunteer.name);
    setEditing(false);
  };

  const handleDeactivate = async () => {
    if (deactivating) return;
    setDeactivating(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    // Dummy action – replace with an API call later.
    console.log("Volunteer deactivated (dummy):", volunteer.name);
    setDeactivating(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 sm:max-w-[540px]"
      >
        <SheetTitle className="sr-only">{volunteer.name}</SheetTitle>
        <SheetDescription className="sr-only">
          Profile for {volunteer.name}
        </SheetDescription>

        <div className="flex h-full flex-col">
          <div
            className="relative h-28 shrink-0"
            style={{
              backgroundImage: `linear-gradient(135deg, ${volunteer.avatarColor} 0%, ${volunteer.avatarColor}99 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          <div className="shrink-0 border-b border-border px-6 pb-5">
            <div className="-mt-8 flex items-end gap-3">
              <UserAvatar
                name={volunteer.name}
                color={volunteer.avatarColor}
                size="lg"
                className="h-16 w-16 border-4 border-card text-lg shadow-card"
              />
              <div className="min-w-0 pb-0.5">
                <h3 className="truncate text-lg font-bold tracking-tight text-foreground">
                  {volunteer.name}
                </h3>
                <p className="truncate text-sm text-muted-foreground">
                  {volunteer.email}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusBadge status={volunteer.status} dot />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                {volunteer.collegeName}
              </span>
              <span className="text-xs text-muted-foreground">
                Joined {formatDate(details.joinedAt)}
              </span>
            </div>
          </div>

          <div className="scrollbar-thin min-h-0 flex-1 space-y-7 overflow-y-auto px-6 py-5">
            <section className="space-y-3">
              <SectionHeading
                icon={CalendarDays}
                title="Assigned Events"
                description="Events the volunteer is part of the crew for"
              />
              <div className="space-y-2">
                {details.assignedEvents.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3.5 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {assignment.eventName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {assignment.role} · {formatDate(assignment.date)}
                      </p>
                    </div>
                    <StatusBadge status={assignment.status} dot />
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <SectionHeading
                icon={CalendarClock}
                title="Today's Shift"
                description="Current scheduled duty for today"
              />
              {details.todayShift ? (
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-lg",
                          details.todayShift.onDuty
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        <Clock3 className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {details.todayShift.startTime} – {details.todayShift.endTime}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {details.todayShift.venue}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                        details.todayShift.onDuty
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {details.todayShift.onDuty ? "On duty" : "Off duty"}
                    </span>
                  </div>
                  <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
                    Duty: {details.todayShift.duty}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-muted/40 px-3.5 py-4 text-center text-sm text-muted-foreground">
                  No shift scheduled for today
                </div>
              )}
            </section>

            <section className="space-y-3">
              <SectionHeading
                icon={QrCode}
                title="QR Scans"
                description="Attendee check-ins verified via QR"
              />
              <div className="grid grid-cols-3 gap-3">
                <StatTile
                  icon={QrCode}
                  label="Total scans"
                  value={details.qrScans.total.toLocaleString("en-US")}
                  tint="text-primary"
                />
                <StatTile
                  icon={CheckCircle2}
                  label="Unique"
                  value={details.qrScans.unique.toLocaleString("en-US")}
                  tint="text-success"
                />
                <StatTile
                  icon={TrendingUp}
                  label="This week"
                  value={String(details.qrScans.thisWeek)}
                  tint="text-info"
                />
              </div>
            </section>

            <section className="space-y-3">
              <SectionHeading
                icon={CheckCircle2}
                title="Attendance"
                description="Event attendance record"
              />
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Attendance rate
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    {details.attendance.rate}%
                  </span>
                </div>
                <div className="mt-3">
                  <ProgressBar value={details.attendance.rate} />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {details.attendance.attended} of {details.attendance.total} assigned
                  events attended
                </p>
              </div>
            </section>

            <section className="space-y-3">
              <SectionHeading
                icon={TrendingUp}
                title="Performance"
                description="Reliability and contribution summary"
              />
              <div className="grid grid-cols-2 gap-3">
                <StatTile
                  icon={Award}
                  label="Rating"
                  value={`${details.performance.rating.toFixed(1)} / 5`}
                  tint="text-warning"
                />
                <StatTile
                  icon={CalendarDays}
                  label="Shifts done"
                  value={String(details.performance.completedShifts)}
                  tint="text-primary"
                />
                <StatTile
                  icon={Clock3}
                  label="On-time"
                  value={`${details.performance.onTimeRate}%`}
                  tint="text-success"
                />
                <StatTile
                  icon={Sparkles}
                  label="Rewards"
                  value={String(details.performance.rewards)}
                  tint="text-info"
                />
              </div>
            </section>

            <section className="space-y-3">
              <SectionHeading
                icon={History}
                title="Recent Activity"
                description="Latest actions and check-ins"
              />
              <div className="space-y-1">
                {details.recentActivity.map((activity) => {
                  const Icon = ACTIVITY_ICONS[activity.type];
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted/50"
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          ACTIVITY_TINTS[activity.type],
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {activity.title}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {activity.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="shrink-0 border-t border-border bg-muted/20 px-6 py-4">
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                disabled={editing}
                onClick={handleEdit}
              >
                {editing && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={deactivating || volunteer.status === "inactive"}
                onClick={handleDeactivate}
              >
                {deactivating && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                <UserX className="h-4 w-4" />
                Deactivate
              </Button>
            </div>
            <Button
              className="mt-2 w-full"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
