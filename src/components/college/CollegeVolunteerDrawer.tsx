import { useState } from "react";
import {
  CalendarDays,
  Clock4,
  DoorOpen,
  KeyRound,
  Mail,
  Phone,
  QrCode,
  UserRound,
  UserX,
} from "lucide-react";
import type { CollegeVolunteer } from "@/data/college/volunteers";
import { formatDate } from "@/utils/format";
import { UserAvatar } from "@/components/common/UserAvatar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { SectionHeading } from "@/components/colleges/SectionHeading";
import { ResetPasswordDialog } from "@/components/colleges/ResetPasswordDialog";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";

interface CollegeVolunteerDrawerProps {
  volunteer: CollegeVolunteer | null;
  onOpenChange: (open: boolean) => void;
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-3.5 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export function CollegeVolunteerDrawer({
  volunteer,
  onOpenChange,
}: CollegeVolunteerDrawerProps) {
  const [deactivating, setDeactivating] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  if (!volunteer) return null;

  const open = Boolean(volunteer);

  const handleDeactivate = async () => {
    if (deactivating) return;
    setDeactivating(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setDeactivating(false);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 sm:max-w-[520px]"
      >
        <SheetTitle className="sr-only">{volunteer.name}</SheetTitle>
        <SheetDescription className="sr-only">
          Volunteer profile for {volunteer.name}
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
              <span className="text-xs text-muted-foreground">
                Joined {formatDate(volunteer.joinedAt)}
              </span>
            </div>
          </div>

          <div className="scrollbar-thin min-h-0 flex-1 space-y-7 overflow-y-auto px-6 py-5">
            <section className="space-y-4">
              <SectionHeading
                icon={UserRound}
                title="Contact"
                description="Personal information"
              />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <InfoRow label="Email" value={volunteer.email} />
                <InfoRow label="Phone" value={volunteer.phone} />
              </div>
            </section>

            <section className="space-y-4">
              <SectionHeading
                icon={DoorOpen}
                title="Assignment"
                description="Event, gate and shift allocation"
              />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <InfoRow label="Assigned event" value={volunteer.eventName} />
                <InfoRow label="Assigned gate" value={volunteer.gate} />
                <InfoRow label="Shift" value={volunteer.shift} />
                <InfoRow label="Status" value={volunteer.status} />
              </div>
            </section>

            <section className="space-y-4">
              <SectionHeading
                icon={CalendarDays}
                title="Performance"
                description="Effort and activity metrics"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-card px-3.5 py-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock4 className="h-3.5 w-3.5 text-primary" />
                    Hours served
                  </div>
                  <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                    {volunteer.hours}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card px-3.5 py-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <QrCode className="h-3.5 w-3.5 text-success" />
                    QR scans
                  </div>
                  <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                    {volunteer.checkInsScanned}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="shrink-0 border-t border-border bg-muted/20 px-6 py-4">
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => setResetOpen(true)}
              >
                <KeyRound className="h-4 w-4" />
                Reset Password
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2 text-destructive hover:bg-danger/10 hover:text-destructive"
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
      <ResetPasswordDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        adminName={volunteer.name}
        adminEmail={volunteer.email}
        subject="volunteer"
      />
    </Sheet>
  );
}
