import { useMemo, useState } from "react";
import {
  CalendarClock,
  Megaphone,
  Rocket,
  Send,
  Users2,
  Zap,
} from "lucide-react";
import {
  collegeAnnouncementPlans,
  collegeAnnouncements,
  type CollegeAnnouncement,
  type CollegeAnnouncementPlan,
} from "@/data/college/announcements";
import { formatDateTime } from "@/utils/format";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/cn";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const toneStyles: Record<CollegeAnnouncement["tone"], { dot: string; icon: string; chip: string }> = {
  event: { dot: "bg-primary", icon: "text-primary", chip: "bg-primary/10 text-primary" },
  info: { dot: "bg-info", icon: "text-info", chip: "bg-info/10 text-info" },
  reward: { dot: "bg-warning", icon: "text-warning", chip: "bg-warning/10 text-warning" },
  alert: { dot: "bg-danger", icon: "text-danger", chip: "bg-danger/10 text-danger" },
};

const toneLabels: Record<CollegeAnnouncement["tone"], string> = {
  event: "Event Update",
  info: "General",
  reward: "Recognition",
  alert: "Urgent",
};

export default function CollegeAnnouncementsPage() {
  const [tab, setTab] = useState<"feed" | "plans">("feed");

  const stats = useMemo(
    () => [
      {
        label: "Total Sent",
        value: collegeAnnouncementPlans.filter((plan) => plan.status === "sent")
          .length + collegeAnnouncements.length,
        icon: Send,
        tint: "text-primary",
      },
      {
        label: "Scheduled",
        value: collegeAnnouncementPlans.filter((plan) => plan.status === "scheduled")
          .length,
        icon: CalendarClock,
        tint: "text-warning",
      },
      {
        label: "Audience Reach",
        value: "2.4k",
        icon: Users2,
        tint: "text-success",
      },
      {
        label: "Avg. Read Rate",
        value: "78%",
        icon: Zap,
        tint: "text-info",
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        subtitle="Broadcast updates to participants and volunteers"
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Megaphone className="h-4 w-4" />
                <span className="hidden sm:inline">New Announcement</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>Compose Announcement</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="ann-title">
                    Title
                  </label>
                  <Input id="ann-title" placeholder="e.g. Venue map is now live" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="ann-message">
                    Message
                  </label>
                  <Textarea
                    id="ann-message"
                    rows={4}
                    placeholder="Write your announcement…"
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="ann-audience">
                      Audience
                    </label>
                    <Select defaultValue="All Participants">
                      <SelectTrigger id="ann-audience" className="w-full rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Participants">
                          All Participants
                        </SelectItem>
                        <SelectItem value="Volunteers">Volunteers</SelectItem>
                        <SelectItem value="Registered Students">
                          Registered Students
                        </SelectItem>
                        <SelectItem value="Specific Event">Specific Event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="ann-tone">
                      Type
                    </label>
                    <Select defaultValue="event">
                      <SelectTrigger id="ann-tone" className="w-full rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="event">Event Update</SelectItem>
                        <SelectItem value="info">General</SelectItem>
                        <SelectItem value="reward">Recognition</SelectItem>
                        <SelectItem value="alert">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Schedule</Button>
                <Button className="gap-2">
                  <Send className="h-4 w-4" />
                  Send Now
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-card p-5 shadow-card"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
              <stat.icon className={`h-5 w-5 ${stat.tint}`} />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 rounded-full bg-muted p-1 sm:w-fit">
        {(["feed", "plans"] as const).map((value) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={cn(
              "flex-1 rounded-full px-5 py-2 text-sm font-medium transition-colors sm:flex-none",
              tab === value
                ? "bg-card text-foreground shadow-card"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {value === "feed" ? "Activity Feed" : "Scheduled & Sent"}
          </button>
        ))}
      </div>

      {tab === "feed" ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {collegeAnnouncements.map((announcement) => {
            const styles = toneStyles[announcement.tone];
            return (
              <article
                key={announcement.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={cn(
                        "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                        styles.dot,
                      )}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {announcement.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {announcement.description}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {announcement.time}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                      styles.chip,
                    )}
                  >
                    {toneLabels[announcement.tone]}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {collegeAnnouncementPlans.map((plan) => (
            <PlanRow key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlanRow({ plan }: { plan: CollegeAnnouncementPlan }) {
  const [sent, setSent] = useState(plan.status === "sent");

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            toneStyles[plan.tone].icon,
            toneStyles[plan.tone].chip,
          )}
        >
          <Rocket className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {plan.title}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {plan.audience}
            {plan.event ? ` · ${plan.event}` : ""} ·{" "}
            {formatDateTime(plan.scheduledAt)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:shrink-0">
        <StatusBadge status={sent ? "sent" : "scheduled"} dot />
        {!sent && (
          <Button size="sm" className="gap-2" onClick={() => setSent(true)}>
            <Send className="h-3.5 w-3.5" />
            Send Now
          </Button>
        )}
      </div>
    </div>
  );
}
