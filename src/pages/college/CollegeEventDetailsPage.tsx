import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Award,
  CalendarClock,
  CalendarDays,
  HandCoins,
  ImageIcon,
  ListChecks,
  MapPin,
  Pencil,
  QrCode,
  Share2,
  Ticket,
  Users,
  Wallet,
} from "lucide-react";
import { collegeEvents, collegeEventDetails } from "@/data/college/events";
import { recentRegistrations } from "@/data/college/registrations";
import { collegeVolunteers } from "@/data/college/volunteers";
import { collegeCertificates } from "@/data/college/certificates";
import { formatCompact, formatCurrency, formatDate } from "@/utils/format";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UserAvatar } from "@/components/common/UserAvatar";
import { RegistrationOverviewChart } from "@/components/college/RegistrationOverviewChart";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

const EVENT_TABS = [
  { value: "overview", label: "Overview", icon: ListChecks },
  { value: "registrations", label: "Registrations", icon: Ticket },
  { value: "volunteers", label: "Volunteers", icon: Users },
  { value: "schedule", label: "Schedule", icon: CalendarClock },
  { value: "gallery", label: "Gallery", icon: ImageIcon },
  { value: "sponsors", label: "Sponsors", icon: HandCoins },
  { value: "certificates", label: "Certificates", icon: Award },
  { value: "analytics", label: "Analytics", icon: QrCode },
];

function FactTile({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: typeof Ticket;
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
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

const registrationColumns: DataTableColumn<(typeof recentRegistrations)[number]>[] = [
  {
    key: "student",
    header: "Student",
    cell: (reg) => (
      <div className="flex items-center gap-3">
        <UserAvatar name={reg.studentName} color={reg.avatarColor} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {reg.studentName}
          </p>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            {reg.course} · {reg.semester}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "time",
    header: "Registered",
    hideBelow: "sm",
    cell: (reg) => (
      <span className="text-sm text-muted-foreground">{reg.time}</span>
    ),
  },
  {
    key: "amount",
    header: "Fee",
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
    key: "status",
    header: "Status",
    cell: (reg) => <StatusBadge status={reg.status} dot />,
  },
];

const volunteerColumns: DataTableColumn<(typeof collegeVolunteers)[number]>[] = [
  {
    key: "volunteer",
    header: "Volunteer",
    cell: (volunteer) => (
      <div className="flex items-center gap-3">
        <UserAvatar name={volunteer.name} color={volunteer.avatarColor} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {volunteer.name}
          </p>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            {volunteer.email}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "gate",
    header: "Gate",
    cell: (volunteer) => (
      <span className="text-sm text-muted-foreground">{volunteer.gate}</span>
    ),
  },
  {
    key: "shift",
    header: "Shift",
    hideBelow: "sm",
    cell: (volunteer) => (
      <span className="text-sm text-muted-foreground">{volunteer.shift}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (volunteer) => <StatusBadge status={volunteer.status} dot />,
  },
];

export default function CollegeEventDetailsPage() {
  const navigate = useNavigate();
  const { eventId } = useParams();

  const event = collegeEvents.find((item) => item.id === eventId);
  const details = event ? collegeEventDetails[event.id] : undefined;

  const eventRegistrations = useMemo(
    () =>
      event ? recentRegistrations.filter((reg) => reg.eventName === event.name) : [],
    [event],
  );
  const eventVolunteers = useMemo(
    () =>
      event
        ? collegeVolunteers.filter((volunteer) => volunteer.eventName === event.name)
        : [],
    [event],
  );
  const eventCertificates = useMemo(
    () =>
      event
        ? collegeCertificates.filter((cert) => cert.eventName === event.name)
        : [],
    [event],
  );

  if (!event) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Event not found"
          subtitle="This event may have been deleted."
          actions={
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => navigate("/admin/college/events")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Button>
          }
        />
        <EmptyState
          icon={CalendarDays}
          title="No event found"
          description="Try browsing the full event list instead."
          action={
            <Button onClick={() => navigate("/admin/college/events")}>
              View All Events
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={event.name}
        subtitle={`${event.id} · ${event.category}`}
        actions={
          <>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => navigate("/admin/college/events/create")}
            >
              <Pencil className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => window.print()}
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </>
        }
      />

      <div
        className={cn(
          "relative flex min-h-44 items-end overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-white shadow-card sm:min-h-56 sm:p-8",
          event.gradient,
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur">
                {event.category}
              </span>
              <StatusBadge status={event.status} dot />
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              {event.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/85">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {formatDate(event.date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {event.venue}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{formatCompact(event.registrations)}</p>
              <p className="text-xs text-white/75">Registrations</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{formatCurrency(event.revenue)}</p>
              <p className="text-xs text-white/75">Revenue</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <div className="scrollbar-thin overflow-x-auto rounded-2xl border border-border bg-card p-2 shadow-card">
          <TabsList className="w-max gap-1 bg-transparent">
            {EVENT_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="gap-1.5 rounded-xl px-3.5"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <h3 className="text-sm font-semibold text-foreground">
                  About this event
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {details?.description ?? "No description provided."}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ListChecks className="h-4 w-4 text-primary" />
                  Rules
                </h3>
                <ul className="mt-3 space-y-2">
                  {(details?.rules ?? []).map((rule, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {rule}
                    </li>
                  ))}
                  {(details?.rules ?? []).length === 0 && (
                    <li className="text-sm text-muted-foreground">
                      No rules listed.
                    </li>
                  )}
                </ul>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <h3 className="text-sm font-semibold text-foreground">
                  Quick facts
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <FactTile
                    icon={Ticket}
                    label="Fee"
                    value={details?.fee ? formatCurrency(details.fee) : "Free"}
                    tint="text-primary"
                  />
                  <FactTile
                    icon={Wallet}
                    label="Capacity"
                    value={`${formatCompact(event.capacity)}`}
                    tint="text-success"
                  />
                  <FactTile
                    icon={CalendarDays}
                    label="Opens"
                    value={
                      details?.registrationStart
                        ? formatDate(details.registrationStart)
                        : "—"
                    }
                    tint="text-info"
                  />
                  <FactTile
                    icon={CalendarClock}
                    label="Closes"
                    value={
                      details?.registrationEnd
                        ? formatDate(details.registrationEnd)
                        : "—"
                    }
                    tint="text-warning"
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium",
                      details?.qrEntry
                        ? "text-success"
                        : "text-muted-foreground",
                    )}
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    QR entry {details?.qrEntry ? "enabled" : "disabled"}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium",
                      details?.certificateEnabled
                        ? "text-success"
                        : "text-muted-foreground",
                    )}
                  >
                    <Award className="h-3.5 w-3.5" />
                    Certificates{" "}
                    {details?.certificateEnabled ? "enabled" : "disabled"}
                  </span>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <h3 className="text-sm font-semibold text-foreground">
                  Eligibility
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {details?.eligibility ?? "Open to all students."}
                </p>
              </div>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="registrations" className="mt-6">
          <DataTable
            columns={registrationColumns}
            data={eventRegistrations}
            rowKey={(reg) => reg.id}
            pageSize={8}
            emptyMessage="No registrations yet"
          />
        </TabsContent>

        <TabsContent value="volunteers" className="mt-6">
          <DataTable
            columns={volunteerColumns}
            data={eventVolunteers}
            rowKey={(volunteer) => volunteer.id}
            pageSize={8}
            emptyMessage="No volunteers assigned"
          />
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          {(details?.schedule ?? []).length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="No schedule yet"
              description="Add sessions to this event's schedule."
            />
          ) : (
            <ol className="space-y-4">
              {details?.schedule.map((item, index) => (
                <li
                  key={index}
                  className="relative flex items-start gap-4 rounded-2xl border border-border bg-card p-4 shadow-card"
                >
                  <span
                    className={cn(
                      "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                      index === 0
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {item.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {item.time}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {item.venue}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </TabsContent>

        <TabsContent value="gallery" className="mt-6">
          {(details?.gallery ?? []).length === 0 ? (
            <EmptyState
              icon={ImageIcon}
              title="No photos yet"
              description="Photos added to this event will appear here."
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {details?.gallery.map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br text-white shadow-card",
                    item.gradient,
                  )}
                >
                  <span className="px-4 text-center text-sm font-semibold">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sponsors" className="mt-6">
          {(details?.sponsors ?? []).length === 0 ? (
            <EmptyState
              icon={HandCoins}
              title="No sponsors yet"
              description="Add sponsors to showcase on this event."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {details?.sponsors.map((sponsor) => (
                <div
                  key={sponsor.name}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-card"
                >
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white"
                    style={{ backgroundColor: sponsor.color }}
                  >
                    {sponsor.name[0]}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {sponsor.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sponsor.tier} sponsor
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="certificates" className="mt-6">
          <DataTable
            columns={[
              {
                key: "student",
                header: "Student",
                cell: (cert) => (
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={cert.studentName}
                      color={cert.avatarColor}
                      size="sm"
                    />
                    <span className="text-sm font-medium text-foreground">
                      {cert.studentName}
                    </span>
                  </div>
                ),
              },
              {
                key: "attendance",
                header: "Attendance",
                sortable: true,
                sortValue: (cert) => cert.attendance,
                cell: (cert) => (
                  <span className="text-sm font-medium text-foreground">
                    {cert.attendance}%
                  </span>
                ),
              },
              {
                key: "status",
                header: "Certificate",
                cell: (cert) => (
                  <StatusBadge status={cert.certificateStatus} dot />
                ),
              },
              {
                key: "email",
                header: "Email",
                hideBelow: "sm",
                cell: (cert) => <StatusBadge status={cert.emailStatus} dot />,
              },
            ]}
            data={eventCertificates}
            rowKey={(cert) => cert.id}
            pageSize={8}
            emptyMessage="No certificates for this event"
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <p className="text-sm font-medium text-muted-foreground">
                Conversion rate
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                {Math.round((event.registrations / event.capacity) * 100)}%
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                of capacity filled
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <p className="text-sm font-medium text-muted-foreground">
                Avg. registration fee
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                {details?.fee ? formatCurrency(details.fee) : "—"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                per participant
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <p className="text-sm font-medium text-muted-foreground">
                Volunteers per 100
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                {event.volunteers}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                assigned to this event
              </p>
            </div>
          </div>
          <RegistrationOverviewChart />
        </TabsContent>
      </Tabs>
    </div>
  );
}
