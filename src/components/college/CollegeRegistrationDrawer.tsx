import { Banknote, CalendarClock, Phone, QrCode, ShieldAlert, UserRound } from "lucide-react";
import type { CollegeRegistration } from "@/data/college/registrations";
import { formatDateTime } from "@/utils/format";
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

interface CollegeRegistrationDrawerProps {
  registration: CollegeRegistration | null;
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

function QRCodePlaceholder({ value }: { value: string }) {
  const cells = useMemoGrid(value);
  return (
    <div className="inline-flex flex-col items-center gap-2 rounded-2xl border border-border bg-white p-4">
      <div className="grid grid-cols-9 gap-[3px]" aria-hidden="true">
        {cells.map((filled, index) => (
          <span
            key={index}
            className={filled ? "h-2 w-2 rounded-[2px] bg-slate-900" : "h-2 w-2 rounded-[2px] bg-slate-200"}
          />
        ))}
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-900">
        {value}
      </p>
    </div>
  );
}

function useMemoGrid(value: string): boolean[] {
  let seed = 0;
  for (let index = 0; index < value.length; index += 1) {
    seed = (seed * 31 + value.charCodeAt(index)) % 100000;
  }
  return Array.from({ length: 81 }, (_, index) => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return (seed & 3) !== 0;
  });
}

export function CollegeRegistrationDrawer({
  registration,
  onOpenChange,
}: CollegeRegistrationDrawerProps) {
  if (!registration) return null;

  const open = Boolean(registration);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 sm:max-w-[520px]"
      >
        <SheetTitle className="sr-only">{registration.studentName}</SheetTitle>
        <SheetDescription className="sr-only">
          Registration profile for {registration.studentName}
        </SheetDescription>

        <div className="flex h-full flex-col">
          <div
            className="relative h-28 shrink-0"
            style={{
              backgroundImage: `linear-gradient(135deg, ${registration.avatarColor} 0%, ${registration.avatarColor}99 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          <div className="shrink-0 border-b border-border px-6 pb-5">
            <div className="-mt-8 flex items-end gap-3">
              <UserAvatar
                name={registration.studentName}
                color={registration.avatarColor}
                size="lg"
                className="h-16 w-16 border-4 border-card text-lg shadow-card"
              />
              <div className="min-w-0 pb-0.5">
                <h3 className="truncate text-lg font-bold tracking-tight text-foreground">
                  {registration.studentName}
                </h3>
                <p className="truncate text-sm text-muted-foreground">
                  {registration.course} · {registration.semester} semester
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusBadge status={registration.status} dot />
              <StatusBadge status={registration.payment} dot />
              <StatusBadge status={registration.attendance} dot />
              <span className="text-xs text-muted-foreground">
                {registration.eventName}
              </span>
            </div>
          </div>

          <div className="scrollbar-thin min-h-0 flex-1 space-y-7 overflow-y-auto px-6 py-5">
            <section className="space-y-4">
              <SectionHeading
                icon={UserRound}
                title="Full Profile"
                description="Personal and academic information"
              />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <InfoRow label="College" value={registration.college} />
                <InfoRow label="Course" value={registration.course} />
                <InfoRow label="Semester" value={registration.semester} />
                <InfoRow label="Phone" value={registration.phone} />
                <InfoRow label="Email" value={registration.email} />
                <InfoRow label="Event" value={registration.eventName} />
              </div>
            </section>

            <section className="space-y-4">
              <SectionHeading
                icon={QrCode}
                title="QR Ticket"
                description="Scan at the gate for entry"
              />
              <div className="flex justify-center">
                <QRCodePlaceholder value={registration.id} />
              </div>
            </section>

            <section className="space-y-4">
              <SectionHeading
                icon={ShieldAlert}
                title="Emergency Contact"
                description="Shared by the student during registration"
              />
              <div className="flex items-start gap-3 rounded-xl border border-border bg-card px-3.5 py-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
                  <Phone className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Emergency contact</p>
                  <p className="truncate text-sm font-medium text-foreground">
                    {registration.emergencyContact}
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <SectionHeading
                icon={Banknote}
                title="Payment"
                description="Fee and payment status"
              />
              <div className="grid grid-cols-2 gap-2">
                <InfoRow
                  label="Amount"
                  value={`₹${registration.amount.toLocaleString("en-IN")}`}
                />
                <InfoRow
                  label="Payment status"
                  value={registration.payment}
                />
              </div>
            </section>

            <section className="space-y-4">
              <SectionHeading
                icon={CalendarClock}
                title="Attendance & Registration Time"
                description="Entry and signup timestamps"
              />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <InfoRow label="Attendance" value={registration.attendance} />
                <InfoRow
                  label="Registered at"
                  value={formatDateTime(registration.registeredAt)}
                />
              </div>
            </section>
          </div>

          <div className="shrink-0 border-t border-border bg-muted/20 px-6 py-4">
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button variant="outline" className="flex-1 gap-2">
                <QrCode className="h-4 w-4" />
                Download Ticket
              </Button>
              <Button className="flex-1" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
