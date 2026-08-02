import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import {
  BadgeCheck,
  CalendarDays,
  Clock4,
  DoorOpen,
  LogOut,
  LockKeyhole,
  Mail,
  Phone,
  Ticket,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useVolunteerProfile, useAssignedEvents } from "@/lib/hooks";
import { getAvatarColor } from "@/utils/constants";
import { formatDate, formatDateTime } from "@/utils/format";
import { useCountUp } from "@/hooks/use-count-up";
import { PageHeader } from "@/components/common/PageHeader";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChangePasswordDialog } from "@/components/volunteer/ChangePasswordDialog";

function CountValue({ value }: { value: number }) {
  const animated = useCountUp(value, { duration: 900 });
  return <>{Math.round(animated).toLocaleString("en-US")}</>;
}

function InfoTile({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 shadow-card">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tint}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

function formatTimeRange(start: string | null, end: string | null): string {
  if (!start && !end) return "—";
  if (!start) return formatDateTime(end ?? "");
  if (!end) return formatDateTime(start);
  const formatTime = (value: string) =>
    new Date(value).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export default function VolunteerProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: profile } = useVolunteerProfile();
  const { data: assignedEvents } = useAssignedEvents();
  const [changeOpen, setChangeOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);

  const assignment = assignedEvents?.[0];
  const event = assignment?.event;

  const name = profile?.user?.name ?? user?.name ?? "";
  const email = profile?.user?.email ?? user?.email ?? "";
  const phone = profile?.user?.phone ?? "—";
  const userId = profile?.user?.id ?? user?.id ?? 0;
  const todayScans = profile?.today_entries_count ?? 0;
  const assignedCount = profile?.assigned_events_count ?? 0;

  const handleLogout = async () => {
    setLogoutOpen(false);
    await logout();
    setLoggedOut(true);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="My Profile"
        subtitle="Your assignment and account information"
      />

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-card sm:flex-row sm:items-center sm:p-6"
      >
        <UserAvatar
          name={name}
          color={getAvatarColor(userId)}
          size="lg"
          className="h-20 w-20 text-2xl"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-bold tracking-tight text-foreground">
              {name}
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              <BadgeCheck className="h-3 w-3" />
              Volunteer
            </span>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            VLD-{String(userId).padStart(4, "0")}
          </p>
          <div className="mt-3 flex flex-col gap-1.5 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-5">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              {email}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              {phone}
            </span>
          </div>
        </div>
        <div className="grid shrink-0 grid-cols-2 gap-3 text-center">
          <div className="rounded-xl bg-success/10 px-4 py-3">
            <p className="text-xl font-bold tracking-tight text-success">
              <CountValue value={todayScans} />
            </p>
            <p className="text-[11px] font-medium text-muted-foreground">
              Today's Scans
            </p>
          </div>
          <div className="rounded-xl bg-info/10 px-4 py-3">
            <p className="text-xl font-bold tracking-tight text-info">
              <CountValue value={assignedCount} />
            </p>
            <p className="text-[11px] font-medium text-muted-foreground">
              Assigned Events
            </p>
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoTile
          icon={Ticket}
          label="Assigned Event"
          value={event?.title ?? "—"}
          tint="bg-primary/10 text-primary"
        />
        <InfoTile
          icon={DoorOpen}
          label="Assigned Gate"
          value={assignment?.role ?? "—"}
          tint="bg-warning/10 text-warning"
        />
        <InfoTile
          icon={Clock4}
          label="Shift"
          value={
            assignment?.shift_start_at
              ? formatTimeRange(assignment.shift_start_at, assignment.shift_end_at)
              : "—"
          }
          tint="bg-info/10 text-info"
        />
        <InfoTile
          icon={CalendarDays}
          label="Joined"
          value={formatDate(profile?.user?.created_at ?? user?.created_at ?? "")}
          tint="bg-success/10 text-success"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        <Button
          size="lg"
          className="h-12 gap-2"
          onClick={() => setChangeOpen(true)}
        >
          <LockKeyhole className="h-4 w-4" />
          Change Password
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-12 gap-2 text-destructive hover:bg-danger/10 hover:text-destructive"
          onClick={() => setLogoutOpen(true)}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </motion.div>

      <p className="text-center text-xs text-muted-foreground">
        Assigned for {event?.title ?? "your events"}
      </p>

      <ChangePasswordDialog open={changeOpen} onOpenChange={setChangeOpen} />

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Log out of DuoFest?</DialogTitle>
            <DialogDescription>
              You'll need to sign back in to scan student QR codes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>
              Cancel
            </Button>
            <Button
              className="gap-2 bg-danger text-white hover:bg-danger/90"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={loggedOut}
        onOpenChange={(next) => {
          if (!next) navigate("/");
        }}
      >
        <DialogContent className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success">
            <LogOut className="h-8 w-8" />
          </div>
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-lg">Logged Out</DialogTitle>
            <DialogDescription>
              You have been signed out of the volunteer portal.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button onClick={() => navigate("/")}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
