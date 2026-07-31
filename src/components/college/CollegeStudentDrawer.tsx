import { useState } from "react";
import {
  Award,
  CalendarDays,
  GraduationCap,
  Mail,
  PencilLine,
  Phone,
  ShieldBan,
  UserRound,
} from "lucide-react";
import type { CollegeStudent } from "@/data/college/students";
import { formatDate } from "@/utils/format";
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

interface CollegeStudentDrawerProps {
  student: CollegeStudent | null;
  onOpenChange: (open: boolean) => void;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3.5 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export function CollegeStudentDrawer({
  student,
  onOpenChange,
}: CollegeStudentDrawerProps) {
  const [toggling, setToggling] = useState(false);

  if (!student) return null;

  const blocked = student.status === "blocked";

  const handleToggleBlock = async () => {
    if (toggling) return;
    setToggling(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setToggling(false);
    onOpenChange(false);
  };

  return (
    <Sheet open={Boolean(student)} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 sm:max-w-[520px]"
      >
        <SheetTitle className="sr-only">{student.name}</SheetTitle>
        <SheetDescription className="sr-only">
          Student profile for {student.name}
        </SheetDescription>

        <div className="flex h-full flex-col">
          <div
            className="relative h-28 shrink-0"
            style={{
              backgroundImage: `linear-gradient(135deg, ${student.avatarColor} 0%, ${student.avatarColor}99 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          <div className="shrink-0 border-b border-border px-6 pb-5">
            <div className="-mt-8 flex items-end gap-3">
              <UserAvatar
                name={student.name}
                color={student.avatarColor}
                size="lg"
                className="h-16 w-16 border-4 border-card text-lg shadow-card"
              />
              <div className="min-w-0 pb-0.5">
                <h3 className="truncate text-lg font-bold tracking-tight text-foreground">
                  {student.name}
                </h3>
                <p className="truncate text-sm text-muted-foreground">
                  {student.course} · {student.semester} semester
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusBadge
                status={blocked ? "blocked" : "active"}
                dot
              />
              <span className="text-xs text-muted-foreground">
                Joined {formatDate(student.joinedAt)}
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
                <InfoRow label="Email" value={student.email} />
                <InfoRow label="Phone" value={student.phone} />
              </div>
            </section>

            <section className="space-y-4">
              <SectionHeading
                icon={GraduationCap}
                title="Academic"
                description="College and course details"
              />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <InfoRow label="College" value={student.college} />
                <InfoRow label="Course" value={student.course} />
                <InfoRow label="Semester" value={`${student.semester} semester`} />
                <InfoRow label="Last event" value={student.lastEvent} />
              </div>
            </section>

            <section className="space-y-4">
              <SectionHeading
                icon={Award}
                title="Participation"
                description="Event engagement overview"
              />
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-border bg-card px-3.5 py-3 text-center">
                  <p className="text-lg font-semibold tracking-tight text-foreground">
                    {student.eventsParticipated}
                  </p>
                  <p className="text-xs text-muted-foreground">Events</p>
                </div>
                <div className="rounded-xl border border-border bg-card px-3.5 py-3 text-center">
                  <p className="text-lg font-semibold tracking-tight text-foreground">
                    {student.certificatesEarned}
                  </p>
                  <p className="text-xs text-muted-foreground">Certificates</p>
                </div>
                <div className="rounded-xl border border-border bg-card px-3.5 py-3 text-center">
                  <p className="text-lg font-semibold tracking-tight text-foreground">
                    {student.attendancePercentage}%
                  </p>
                  <p className="text-xs text-muted-foreground">Attendance</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <SectionHeading
                icon={CalendarDays}
                title="Activity Timeline"
                description="Recent event history"
              />
              <ol className="space-y-0">
                {student.timeline.map((entry, index) => (
                  <li key={`${entry.event}-${index}`} className="relative flex gap-3 pb-4 last:pb-0">
                    {index < student.timeline.length - 1 && (
                      <span className="absolute left-[5px] top-4 h-full w-px bg-border" />
                    )}
                    <span
                      className={`mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-card ${
                        entry.label === "Cancelled" ? "bg-danger" : "bg-primary"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {entry.label}
                        <span className="text-muted-foreground"> · </span>
                        <span className="font-normal text-muted-foreground">
                          {entry.event}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(entry.date)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <div className="shrink-0 border-t border-border bg-muted/20 px-6 py-4">
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button variant="outline" className="flex-1 gap-2">
                <PencilLine className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant={blocked ? "default" : "outline"}
                className={`flex-1 gap-2 ${
                  blocked
                    ? ""
                    : "text-destructive hover:bg-danger/10 hover:text-destructive"
                }`}
                disabled={toggling}
                onClick={handleToggleBlock}
              >
                {toggling && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                <ShieldBan className="h-4 w-4" />
                {blocked ? "Unblock" : "Block"}
              </Button>
            </div>
            <Button className="mt-2 w-full" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
