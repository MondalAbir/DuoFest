import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock3,
  Copy,
  Download,
  HandCoins,
  Image as ImageIcon,
  LayoutDashboard,
  Loader2,
  MapPin,
  Pencil,
  Ticket,
  Trash2,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { events } from "@/data/events";
import {
  getEventDetails,
  type EventSponsor,
  type EventTimelineItem,
} from "@/data/eventDetails";
import type {
  DashboardStat,
  Registration,
  Volunteer,
} from "@/types";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  initials,
} from "@/utils/format";
import { cn } from "@/utils/cn";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UserAvatar } from "@/components/common/UserAvatar";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { RevenueDonutChart } from "@/components/charts/RevenueDonutChart";
import { ChartCard } from "@/components/charts/ChartCard";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "timeline", label: "Timeline", icon: Clock3 },
  { key: "registrations", label: "Registrations", icon: Ticket },
  { key: "volunteers", label: "Volunteers", icon: Users },
  { key: "revenue", label: "Revenue", icon: Wallet },
  { key: "gallery", label: "Gallery", icon: ImageIcon },
  { key: "sponsors", label: "Sponsors", icon: HandCoins },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const AVATAR_COLORS = [
  "#6366F1",
  "#14B8A6",
  "#F59E0B",
  "#0EA5E9",
  "#10B981",
  "#EC4899",
  "#8B5CF6",
  "#EF4444",
];

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const REG_COLUMNS: DataTableColumn<Registration>[] = [
  {
    key: "student",
    header: "Student",
    cell: (reg) => (
      <div className="flex items-center gap-3">
        <UserAvatar
          name={reg.studentName}
          color={colorFor(reg.studentName)}
          size="sm"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {reg.studentName}
          </p>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            {reg.email}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "college",
    header: "College",
    hideBelow: "md",
    cell: (reg) => (
      <span className="text-sm text-muted-foreground">{reg.collegeName}</span>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    sortable: true,
    sortValue: (reg) => reg.amount,
    cell: (reg) => (
      <span className="text-sm font-medium text-foreground">
        {formatCurrency(reg.amount)}
      </span>
    ),
  },
  {
    key: "date",
    header: "Date",
    sortable: true,
    sortValue: (reg) => new Date(reg.date).getTime(),
    hideBelow: "lg",
    cell: (reg) => (
      <span className="text-sm text-muted-foreground">{formatDate(reg.date)}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (reg) => <StatusBadge status={reg.status} dot />,
  },
];

const VOL_COLUMNS: DataTableColumn<Volunteer>[] = [
  {
    key: "volunteer",
    header: "Volunteer",
    cell: (vol) => (
      <div className="flex items-center gap-3">
        <UserAvatar name={vol.name} color={vol.avatarColor} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{vol.name}</p>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            {vol.email}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "college",
    header: "College",
    hideBelow: "md",
    cell: (vol) => (
      <span className="text-sm text-muted-foreground">{vol.collegeName}</span>
    ),
  },
  {
    key: "hours",
    header: "Hours",
    align: "right",
    sortable: true,
    sortValue: (vol) => vol.hours,
    cell: (vol) => (
      <span className="text-sm font-medium text-foreground">{vol.hours}h</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (vol) => <StatusBadge status={vol.status} dot />,
  },
];

function TimelineList({ items }: { items: EventTimelineItem[] }) {
  return (
    <ol className="relative space-y-0">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <li key={item.id} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                className={cn(
                  "absolute left-[15px] top-8 h-full w-px",
                  item.status === "done" ? "bg-primary/40" : "bg-border",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                item.status === "done" &&
                  "border-primary/60 bg-primary/10 text-primary",
                item.status === "current" &&
                  "border-primary bg-primary text-primary-foreground",
                item.status === "upcoming" &&
                  "border-border bg-muted/40 text-muted-foreground",
              )}
            >
              {item.status === "done" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : item.status === "current" ? (
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-current" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-current" />
              )}
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">
                  {item.title}
                </p>
                <span className="text-xs text-muted-foreground">{item.date}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function SponsorsGrid({ sponsors }: { sponsors: EventSponsor[] }) {
  const tierStyles: Record<EventSponsor["tier"], string> = {
    Platinum: "bg-primary/10 text-primary",
    Gold: "bg-warning/10 text-warning",
    Silver: "bg-muted text-muted-foreground",
  };
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sponsors.map((sponsor) => (
        <div
          key={sponsor.id}
          className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-card transition-shadow duration-300 hover:shadow-card-hover"
        >
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white"
            style={{ backgroundColor: sponsor.color }}
          >
            {initials(sponsor.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {sponsor.name}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatCurrency(sponsor.amount)} · {sponsor.tier} sponsor
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
              tierStyles[sponsor.tier],
            )}
          >
            {sponsor.tier}
          </span>
        </div>
      ))}
    </div>
  );
}

function GalleryGrid({ eventId }: { eventId: string }) {
  const details = getEventDetails(events.find((e) => e.id === eventId)!);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {details.gallery.map((item) => (
        <div
          key={item.id}
          className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-border"
        >
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br transition-transform duration-500 group-hover:scale-105",
              item.gradient,
            )}
          >
            <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white/40">
              {initials(item.label)}
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <p className="text-sm font-medium text-white">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function exportRegistrationsCsv(
  regs: Registration[],
  eventName: string,
): void {
  const header = ["Student", "Email", "College", "Amount", "Date", "Status"];
  const rows = regs.map((reg) => [
    reg.studentName,
    reg.email,
    reg.collegeName,
    String(reg.amount),
    reg.date,
    reg.status,
  ]);
  const csv = [header, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${eventName.replace(/\s+/g, "-").toLowerCase()}-registrations.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function EventDetailsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("overview");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const event = events.find((item) => item.id === eventId);
  const details = useMemo(
    () => (event ? getEventDetails(event) : null),
    [event],
  );

  if (!event || !details) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Event not found"
          subtitle="The event you're looking for doesn't exist."
          actions={
            <Button variant="outline" onClick={() => navigate("/admin/events")}>
              Back to Events
            </Button>
          }
        />
        <div className="rounded-2xl border border-border bg-card shadow-card">
          <EmptyState
            title="Event not found"
            description="It may have been removed or the link is incorrect."
          />
        </div>
      </div>
    );
  }

  const regs = details.registrations;
  const vols = details.volunteers;

  const confirmedRegs = regs.filter((reg) => reg.status === "confirmed");
  const collectedAmount = confirmedRegs.reduce((sum, reg) => sum + reg.amount, 0);
  const activeVols = vols.filter((vol) => vol.status === "active");
  const totalHours = vols.reduce((sum, vol) => sum + vol.hours, 0);
  const capacityRate = Math.min(100, Math.round((event.registrations / details.capacity) * 100));

  const overviewStats: DashboardStat[] = [
    {
      id: "evd-registrations",
      title: "Total Registrations",
      value: event.registrations,
      delta: { value: 12.4, direction: "up", label: "vs last week" },
      icon: "ticket",
      tint: "primary",
    },
    {
      id: "evd-revenue",
      title: "Revenue",
      value: event.revenue,
      prefix: "$",
      delta: { value: 8.7, direction: "up", label: "vs last week" },
      icon: "dollar",
      tint: "success",
    },
    {
      id: "evd-volunteers",
      title: "Volunteers",
      value: vols.length,
      delta: { value: 3.2, direction: "up", label: "vs last week" },
      icon: "users",
      tint: "info",
    },
    {
      id: "evd-capacity",
      title: "Capacity Used",
      value: capacityRate,
      suffix: "%",
      delta: { value: 1.8, direction: "up", label: "vs last week" },
      icon: "wallet",
      tint: "warning",
    },
  ];

  const regStats: DashboardStat[] = [
    {
      id: "evd-reg-total",
      title: "Registrations",
      value: regs.length,
      delta: { value: 12.4, direction: "up", label: "vs last week" },
      icon: "ticket",
      tint: "primary",
    },
    {
      id: "evd-reg-confirmed",
      title: "Confirmed",
      value: confirmedRegs.length,
      delta: { value: 9.1, direction: "up", label: "vs last week" },
      icon: "check-circle",
      tint: "success",
    },
    {
      id: "evd-reg-pending",
      title: "Pending",
      value: regs.filter((reg) => reg.status === "pending").length,
      delta: { value: 2.3, direction: "down", label: "vs last week" },
      icon: "users",
      tint: "warning",
    },
    {
      id: "evd-reg-collected",
      title: "Collected",
      value: collectedAmount,
      prefix: "$",
      delta: { value: 6.5, direction: "up", label: "vs last week" },
      icon: "dollar",
      tint: "success",
    },
  ];

  const volStats: DashboardStat[] = [
    {
      id: "evd-vol-total",
      title: "Volunteers",
      value: vols.length,
      delta: { value: 4.2, direction: "up", label: "vs last week" },
      icon: "users",
      tint: "primary",
    },
    {
      id: "evd-vol-active",
      title: "Active",
      value: activeVols.length,
      delta: { value: 2.8, direction: "up", label: "vs last week" },
      icon: "check-circle",
      tint: "success",
    },
    {
      id: "evd-vol-onboarding",
      title: "Onboarding",
      value: vols.filter((vol) => vol.status === "onboarding").length,
      delta: { value: 1.1, direction: "up", label: "vs last week" },
      icon: "ticket",
      tint: "info",
    },
    {
      id: "evd-vol-hours",
      title: "Total Hours",
      value: totalHours,
      delta: { value: 7.6, direction: "up", label: "vs last week" },
      icon: "wallet",
      tint: "warning",
    },
  ];

  const handleDelete = async () => {
    setIsDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsDeleting(false);
    navigate("/admin/events");
  };

  const totalSponsorship = details.sponsors.reduce(
    (sum, sponsor) => sum + sponsor.amount,
    0,
  );

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        className="-ml-2 gap-1.5 text-muted-foreground"
        onClick={() => navigate("/admin/events")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Button>

      <div className="relative overflow-hidden rounded-2xl border border-border">
        <div className={cn("absolute inset-0 bg-gradient-to-br", event.gradient)} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
        <div
          className="absolute -bottom-16 -right-10 select-none text-[220px] font-black leading-none text-white/10"
          aria-hidden="true"
        >
          {event.name[0]}
        </div>

        <div className="absolute right-4 top-4 flex flex-wrap justify-end gap-2">
          <Button
            variant="ghost"
            className="gap-2 border border-white/20 bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25 hover:text-white"
            onClick={() => navigate("/admin/events/create")}
          >
            <Pencil className="h-4 w-4" />
            <span className="hidden sm:inline">Edit Event</span>
          </Button>
          <Button
            variant="ghost"
            className="gap-2 border border-white/20 bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25 hover:text-white"
            onClick={() => setDuplicateOpen(true)}
          >
            <Copy className="h-4 w-4" />
            <span className="hidden sm:inline">Duplicate</span>
          </Button>
          <Button
            variant="ghost"
            className="gap-2 border border-white/20 bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25 hover:text-white"
            onClick={() => exportRegistrationsCsv(regs, event.name)}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button
            variant="ghost"
            className="gap-2 border border-white/20 bg-destructive/20 text-white backdrop-blur transition-colors hover:bg-destructive/40 hover:text-white"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>

        <div className="relative flex min-h-[260px] flex-col justify-end gap-4 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              {event.category}
            </span>
            <StatusBadge status={event.status} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
            {event.name}
          </h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">
            <span className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4" />
              {event.collegeName}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(event.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {details.venue}, {details.city}
            </span>
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-20 -mx-4 border-b border-border bg-background/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="scrollbar-thin flex gap-1 overflow-x-auto">
          {TABS.map((item) => {
            const Icon: LucideIcon = item.icon;
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {overviewStats.map((stat, index) => (
              <StatCard key={stat.id} stat={stat} index={index} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  About this event
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {details.description}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  Event details
                </h3>
                <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                  {[
                    { label: "Event date", value: formatDate(event.date) },
                    { label: "Venue", value: details.venue },
                    { label: "Address", value: details.address },
                    { label: "Host college", value: event.collegeName },
                    { label: "Category", value: event.category },
                    { label: "Timezone", value: details.timezone },
                    { label: "Capacity", value: formatNumber(details.capacity) },
                    { label: "Organizer", value: details.organizer },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-start justify-between gap-4 border-b border-border py-2 last:border-0"
                    >
                      <dt className="text-sm text-muted-foreground">
                        {row.label}
                      </dt>
                      <dd className="text-right text-sm font-medium text-foreground">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  Organizer
                </h3>
                <div className="mt-4 flex items-center gap-3">
                  <UserAvatar
                    name={details.organizer}
                    color={colorFor(details.organizer)}
                    size="lg"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {details.organizer}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {details.organizerEmail}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    Capacity
                  </h3>
                  <span className="text-sm font-semibold text-primary">
                    {capacityRate}%
                  </span>
                </div>
                <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-info"
                    style={{ width: `${capacityRate}%` }}
                  />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {formatNumber(event.registrations)} of{" "}
                  {formatNumber(details.capacity)} seats filled
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "timeline" && (
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
          <TimelineList items={details.timeline} />
        </div>
      )}

      {tab === "registrations" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {regStats.map((stat, index) => (
              <StatCard key={stat.id} stat={stat} index={index} />
            ))}
          </div>
          <DataTable
            columns={REG_COLUMNS}
            data={regs}
            rowKey={(reg) => reg.id}
            pageSize={8}
            emptyMessage="No registrations yet"
          />
        </div>
      )}

      {tab === "volunteers" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {volStats.map((stat, index) => (
              <StatCard key={stat.id} stat={stat} index={index} />
            ))}
          </div>
          <DataTable
            columns={VOL_COLUMNS}
            data={vols}
            rowKey={(vol) => vol.id}
            pageSize={8}
            emptyMessage="No volunteers assigned yet"
          />
        </div>
      )}

      {tab === "revenue" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard
            title="Revenue breakdown"
            subtitle="Income from all sources for this event"
          >
            <RevenueDonutChart
              data={details.revenueBreakdown}
              centerLabel="Revenue"
            />
          </ChartCard>

          <ChartCard
            title="Revenue summary"
            subtitle="Source-wise collection and share"
            action={
              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                {formatCurrency(event.revenue)}
              </span>
            }
          >
            <div className="space-y-1">
              {details.revenueBreakdown.map((slice) => {
                const percent =
                  event.revenue > 0
                    ? Math.round((slice.value / event.revenue) * 100)
                    : 0;
                return (
                  <div
                    key={slice.name}
                    className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/20 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: slice.color }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {slice.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-foreground">
                        {formatCurrency(slice.value)}
                      </span>
                      <span className="w-11 text-right text-xs text-muted-foreground">
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center justify-between gap-4 border-t border-border px-1 pt-3">
                <span className="text-sm font-medium text-foreground">
                  Total revenue
                </span>
                <span className="text-base font-bold text-foreground">
                  {formatCurrency(event.revenue)}
                </span>
              </div>
            </div>
          </ChartCard>
        </div>
      )}

      {tab === "gallery" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {details.gallery.length} photos · captured by the media team
            </p>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => exportRegistrationsCsv(regs, event.name)}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
          <GalleryGrid eventId={event.id} />
        </div>
      )}

      {tab === "sponsors" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total sponsorship raised
              </p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                {formatCurrency(totalSponsorship)}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <HandCoins className="h-4 w-4 text-primary" />
              {details.sponsors.length} sponsors backing this event
            </div>
          </div>
          <SponsorsGrid sponsors={details.sponsors} />
        </div>
      )}

      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Event"
        description={`This will permanently remove "${event.name}" along with its registrations, volunteers, and media. This action cannot be undone.`}
        confirmLabel="Delete Event"
        confirmText="DELETE"
        onConfirm={handleDelete}
      />

      <Dialog
        open={duplicateOpen}
        onOpenChange={(next) => {
          if (!next) setDuplicateOpen(false);
        }}
      >
        <DialogContent className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Copy className="h-8 w-8" />
          </div>
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-lg">Event duplicated</DialogTitle>
            <DialogDescription>
              <span className="block font-medium text-foreground">
                {event.name} (Copy)
              </span>
              <span className="mt-1.5 block">
                A duplicate has been saved as a draft. You can edit it before
                publishing.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setDuplicateOpen(false);
                navigate("/admin/events/create");
              }}
            >
              Edit Draft
            </Button>
            <Button onClick={() => setDuplicateOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3.5 shadow-glass">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm font-medium text-foreground">
              Deleting event…
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
