import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  CalendarDays,
  Globe,
  HeartHandshake,
  IndianRupee,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Ticket,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import type { College } from "@/types";
import { cn } from "@/utils/cn";
import { initials, formatCompact, formatNumber, formatDate } from "@/utils/format";
import { getCollegeDetails } from "@/data/collegeDetails";
import { StatusBadge } from "@/components/common/StatusBadge";
import { SectionHeading } from "@/components/colleges/SectionHeading";
import { InviteCollegeAdminDialog } from "@/components/colleges/InviteCollegeAdminDialog";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";

interface CollegeDetailsDrawerProps {
  college: College | null;
  onOpenChange: (open: boolean) => void;
  onEdit?: (college: College) => void;
}

const formatInr = (value: number) =>
  `₹${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(value)}`;

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card px-3.5 py-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="block truncate text-sm font-medium text-foreground underline-offset-2 hover:text-primary hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="truncate text-sm font-medium text-foreground">
            {value}
          </p>
        )}
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

export function CollegeDetailsDrawer({
  college,
  onOpenChange,
  onEdit,
}: CollegeDetailsDrawerProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!college) return null;

  const details = getCollegeDetails(college.id);
  const open = Boolean(college);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full gap-0 p-0 sm:max-w-[420px]"
        >
          <SheetTitle className="sr-only">{college.name}</SheetTitle>
          <SheetDescription className="sr-only">
            Details for {college.name}
          </SheetDescription>

          <div className="flex h-full flex-col">
            <div
              className="relative h-28 shrink-0"
              style={{
                backgroundImage: `linear-gradient(135deg, ${college.logoColor} 0%, ${college.logoColor}99 100%)`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            <div className="shrink-0 border-b border-border px-6 pb-5">
              <div className="-mt-8 flex items-end gap-3">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-4 border-card text-base font-bold text-white shadow-card"
                  style={{ backgroundColor: college.logoColor }}
                >
                  {initials(college.name)}
                </div>
                <div className="min-w-0 pb-0.5">
                  <h3 className="truncate text-lg font-bold tracking-tight text-foreground">
                    {college.name}
                  </h3>
                  <p className="truncate text-sm text-muted-foreground">
                    {details?.university ?? `${college.name} University`}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <StatusBadge status={college.status} dot />
                <Badge variant="secondary">{college.plan} plan</Badge>
                <span className="text-xs text-muted-foreground">
                  Joined {formatDate(college.joinedAt)}
                </span>
              </div>
            </div>

            <div className="scrollbar-thin min-h-0 flex-1 space-y-7 overflow-y-auto px-6 py-5">
              <section className="space-y-4">
                <SectionHeading
                  icon={Building2}
                  title="College Information"
                  description="Contact and location details"
                />
                <div className="space-y-2">
                  <InfoRow
                    icon={UserRound}
                    label="College Admin"
                    value={college.adminName}
                  />
                  <InfoRow
                    icon={Mail}
                    label="Official Email"
                    value={details?.officialEmail ?? college.adminEmail}
                  />
                  <InfoRow
                    icon={Phone}
                    label="Phone"
                    value={details?.phone ?? "+91 00000 00000"}
                  />
                  <InfoRow
                    icon={Globe}
                    label="Website"
                    value={details?.website ?? `https://www.${college.name.toLowerCase().replace(/[^a-z0-9]+/g, "")}.edu`}
                    href={details?.website}
                  />
                  <InfoRow
                    icon={MapPin}
                    label="Address"
                    value={
                      details?.address ??
                      `${college.city}, ${college.state}`
                    }
                  />
                </div>
              </section>

              <section className="space-y-4">
                <SectionHeading
                  icon={BarChart3}
                  title="College Statistics"
                  description="Activity and performance overview"
                />
                <div className="grid grid-cols-2 gap-3">
                  <StatTile
                    icon={Users}
                    label="Total Students"
                    value={formatNumber(college.students)}
                    tint="text-primary"
                  />
                  <StatTile
                    icon={CalendarDays}
                    label="Total Events"
                    value={formatNumber(college.events)}
                    tint="text-info"
                  />
                  <StatTile
                    icon={Ticket}
                    label="Registrations"
                    value={formatCompact(details?.registrations ?? college.students * 2)}
                    tint="text-warning"
                  />
                  <StatTile
                    icon={HeartHandshake}
                    label="Volunteers"
                    value={formatCompact(details?.volunteers ?? 0)}
                    tint="text-success"
                  />
                  <StatTile
                    icon={IndianRupee}
                    label="Revenue"
                    value={formatInr(details?.revenue ?? 0)}
                    tint="text-danger"
                    className="col-span-2 border-primary/30 bg-primary/5"
                  />
                </div>
              </section>
            </div>

            <div className="shrink-0 border-t border-border bg-muted/20 px-6 py-4">
              <Button
                variant="ghost"
                className="w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete College
              </Button>

              <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => onEdit?.(college)}
                >
                  <Pencil className="h-4 w-4" />
                  Edit College
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={() => setInviteOpen(true)}
                >
                  <UserRound className="h-4 w-4" />
                  Invite Admin
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <InviteCollegeAdminDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        defaultCollegeId={college.id}
      />

      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => onOpenChange(false)}
      />
    </>
  );
}
