import { useMemo, useState } from "react";
import { Ban, Clock4, Copy, Download, ShieldCheck } from "lucide-react";
import { collegeCheckIns, type CollegeCheckInEntry } from "@/data/college/checkins";
import { searchInArray } from "@/utils/filter";
import { formatDateTime, formatDateShort } from "@/utils/format";
import { PageHeader } from "@/components/common/PageHeader";
import { UserAvatar } from "@/components/common/UserAvatar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const buildColumns: DataTableColumn<CollegeCheckInEntry>[] = [
  {
    key: "student",
    header: "Student",
    cell: (entry) => (
      <div className="flex items-center gap-3">
        <UserAvatar name={entry.studentName} color={entry.avatarColor} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {entry.studentName}
          </p>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            {entry.college}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "event",
    header: "Event",
    hideBelow: "md",
    cell: (entry) => (
      <span className="text-sm text-foreground">{entry.eventName}</span>
    ),
  },
  {
    key: "time",
    header: "Check-in Time",
    sortable: true,
    sortValue: (entry) => new Date(entry.checkInTime).getTime(),
    hideBelow: "sm",
    cell: (entry) => (
      <span className="text-sm text-muted-foreground">
        {formatDateTime(entry.checkInTime)}
      </span>
    ),
  },
  {
    key: "volunteer",
    header: "Volunteer",
    hideBelow: "md",
    cell: (entry) => (
      <span className="text-sm text-foreground">{entry.volunteer}</span>
    ),
  },
  {
    key: "gate",
    header: "Gate",
    hideBelow: "lg",
    cell: (entry) => (
      <span className="text-sm text-muted-foreground">{entry.gate}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (entry) => <StatusBadge status={entry.status} dot />,
  },
];

function exportCsv(entries: CollegeCheckInEntry[]) {
  const header = "Student,College,Event,Check-in Time,Volunteer,Gate,Status";
  const rows = entries.map((entry) =>
    [
      entry.studentName,
      entry.college,
      entry.eventName,
      entry.checkInTime,
      entry.volunteer,
      entry.gate,
      entry.status,
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(","),
  );
  const blob = new Blob([`${header}\n${rows.join("\n")}`], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "college-checkins.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function CollegeCheckInHistoryPage() {
  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [volunteerFilter, setVolunteerFilter] = useState("all");

  const events = useMemo(
    () => Array.from(new Set(collegeCheckIns.map((entry) => entry.eventName))),
    [],
  );
  const dates = useMemo(
    () =>
      Array.from(
        new Set(collegeCheckIns.map((entry) => formatDateShort(entry.checkInTime))),
      ),
    [],
  );
  const volunteers = useMemo(
    () =>
      Array.from(new Set(collegeCheckIns.map((entry) => entry.volunteer))),
    [],
  );

  const filtered = useMemo(() => {
    const searched = searchInArray(collegeCheckIns, query, [
      "studentName",
      "college",
      "eventName",
      "volunteer",
    ]);
    return searched.filter(
      (entry) =>
        (eventFilter === "all" || entry.eventName === eventFilter) &&
        (volunteerFilter === "all" || entry.volunteer === volunteerFilter) &&
        (dateFilter === "all" ||
          formatDateShort(entry.checkInTime) === dateFilter),
    );
  }, [query, eventFilter, dateFilter, volunteerFilter]);

  const stats = useMemo(
    () => [
      {
        label: "Today's Entries",
        value: collegeCheckIns.filter((entry) => entry.status === "checked-in").length,
        icon: ShieldCheck,
        tint: "text-success",
      },
      {
        label: "Inside Venue",
        value: collegeCheckIns.filter((entry) => entry.status === "checked-in").length,
        icon: Clock4,
        tint: "text-primary",
      },
      {
        label: "Duplicate Attempts",
        value: collegeCheckIns.filter((entry) => entry.status === "duplicate").length,
        icon: Copy,
        tint: "text-warning",
      },
      {
        label: "Rejected",
        value: collegeCheckIns.filter((entry) => entry.status === "rejected").length,
        icon: Ban,
        tint: "text-danger",
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Check-in History"
        subtitle="Monitor QR check-ins across all gates"
        actions={
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => exportCsv(filtered)}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
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

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search student, college, event or volunteer…"
            className="h-10 rounded-xl pl-9"
            aria-label="Search check-ins"
          />
        </div>
        <Select value={eventFilter} onValueChange={setEventFilter}>
          <SelectTrigger className="h-10 w-full rounded-xl sm:w-56" aria-label="Filter by event">
            <SelectValue placeholder="All events" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All events</SelectItem>
            {events.map((event) => (
              <SelectItem key={event} value={event}>
                {event}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="h-10 w-full rounded-xl sm:w-44" aria-label="Filter by date">
            <SelectValue placeholder="All dates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All dates</SelectItem>
            {dates.map((date) => (
              <SelectItem key={date} value={date}>
                {date}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={volunteerFilter} onValueChange={setVolunteerFilter}>
          <SelectTrigger className="h-10 w-full rounded-xl sm:w-48" aria-label="Filter by volunteer">
            <SelectValue placeholder="All volunteers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All volunteers</SelectItem>
            {volunteers.map((volunteer) => (
              <SelectItem key={volunteer} value={volunteer}>
                {volunteer}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={buildColumns}
        data={filtered}
        rowKey={(entry) => entry.id}
        pageSize={8}
        emptyMessage="No check-ins found"
      />
    </div>
  );
}
