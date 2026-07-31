import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Ban,
  BarChart3,
  Building2,
  CalendarClock,
  CalendarDays,
  Clock,
  KeyRound,
  Mail,
  Phone,
  Ticket,
  UserX,
} from "lucide-react";
import type { AdminUser } from "@/types";
import { cn } from "@/utils/cn";
import {
  formatCompact,
  formatDate,
  formatDateTime,
  formatNumber,
} from "@/utils/format";
import { getAdminDetails } from "@/data/adminDetails";
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

interface AdminProfileDrawerProps {
  admin: AdminUser | null;
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

export function AdminProfileDrawer({
  admin,
  onOpenChange,
}: AdminProfileDrawerProps) {
  const [suspendLoading, setSuspendLoading] = useState(false);
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  if (!admin) return null;

  const details = getAdminDetails(admin.id);
  const open = Boolean(admin);

  const handleResetPassword = () => {
    setResetOpen(true);
  };

  const handleSuspend = async () => {
    if (suspendLoading) return;
    setSuspendLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    // Dummy action – replace with an API call later.
    console.log("Admin suspended (dummy):", admin.name);
    setSuspendLoading(false);
  };

  const handleDeactivate = async () => {
    if (deactivateLoading) return;
    setDeactivateLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    // Dummy action – replace with an API call later.
    console.log("Admin deactivated (dummy):", admin.name);
    setDeactivateLoading(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 sm:max-w-[520px]"
      >
        <SheetTitle className="sr-only">{admin.name}</SheetTitle>
        <SheetDescription className="sr-only">
          Profile for {admin.name}
        </SheetDescription>

        <div className="flex h-full flex-col">
          <div
            className="relative h-28 shrink-0"
            style={{
              backgroundImage: `linear-gradient(135deg, ${admin.avatarColor} 0%, ${admin.avatarColor}99 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          <div className="shrink-0 border-b border-border px-6 pb-5">
            <div className="-mt-8 flex items-end gap-3">
              <UserAvatar
                name={admin.name}
                color={admin.avatarColor}
                size="lg"
                className="h-16 w-16 border-4 border-card text-lg shadow-card"
              />
              <div className="min-w-0 pb-0.5">
                <h3 className="truncate text-lg font-bold tracking-tight text-foreground">
                  {admin.name}
                </h3>
                <p className="truncate text-sm text-muted-foreground">
                  {admin.email}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusBadge status={admin.status} dot />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                {admin.role}
              </span>
              <span className="text-xs text-muted-foreground">
                Joined {formatDate(admin.joinedAt)}
              </span>
            </div>
          </div>

          <div className="scrollbar-thin min-h-0 flex-1 space-y-7 overflow-y-auto px-6 py-5">
            <section className="space-y-4">
              <SectionHeading
                icon={CalendarClock}
                title="Account Details"
                description="Contact and access information"
              />
              <div className="space-y-2">
                <InfoRow icon={Mail} label="Email" value={admin.email} />
                <InfoRow
                  icon={Phone}
                  label="Phone"
                  value={details?.phone ?? "+91 00000 00000"}
                />
                <InfoRow
                  icon={Building2}
                  label="College"
                  value={admin.collegeName}
                />
                <InfoRow icon={BadgeCheck} label="Role" value={admin.role} />
                <InfoRow
                  icon={Clock}
                  label="Last Login"
                  value={formatDateTime(admin.lastActive)}
                />
                <InfoRow
                  icon={CalendarDays}
                  label="Created Date"
                  value={formatDate(admin.joinedAt)}
                />
              </div>
            </section>

            <section className="space-y-4">
              <SectionHeading
                icon={BarChart3}
                title="Activity Overview"
                description="Events and registration performance"
              />
              <div className="grid grid-cols-2 gap-3">
                <StatTile
                  icon={CalendarDays}
                  label="Managed Events"
                  value={formatNumber(details?.managedEvents ?? 0)}
                  tint="text-primary"
                />
                <StatTile
                  icon={Ticket}
                  label="Registrations"
                  value={formatCompact(details?.registrations ?? 0)}
                  tint="text-success"
                />
              </div>
            </section>
          </div>

          <div className="shrink-0 border-t border-border bg-muted/20 px-6 py-4">
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleResetPassword}
              >
                <KeyRound className="h-4 w-4" />
                Reset Password
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2"
                disabled={suspendLoading || admin.status !== "active"}
                onClick={handleSuspend}
              >
                {suspendLoading && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                <Ban className="h-4 w-4" />
                Suspend
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={deactivateLoading}
                onClick={handleDeactivate}
              >
                {deactivateLoading && (
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
        adminName={admin.name}
        adminEmail={admin.email}
      />
    </Sheet>
  );
}
