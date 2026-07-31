import { useMemo, useState } from "react";
import { GraduationCap, Trophy, UserRound, UsersRound } from "lucide-react";
import { collegeStudents, type CollegeStudent } from "@/data/college/students";
import { searchInArray } from "@/utils/filter";
import { PageHeader } from "@/components/common/PageHeader";
import { UserAvatar } from "@/components/common/UserAvatar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CollegeStudentDrawer } from "@/components/college/CollegeStudentDrawer";

const buildColumns: (
  onOpen: (student: CollegeStudent) => void,
) => DataTableColumn<CollegeStudent>[] = (onOpen) => [
  {
    key: "student",
    header: "Student",
    cell: (student) => (
      <button
        className="flex w-full items-center gap-3 text-left"
        onClick={() => onOpen(student)}
      >
        <UserAvatar name={student.name} color={student.avatarColor} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {student.name}
          </p>
          <p className="hidden truncate text-xs text-muted-foreground md:block">
            {student.email}
          </p>
        </div>
      </button>
    ),
  },
  {
    key: "college",
    header: "College",
    hideBelow: "md",
    cell: (student) => (
      <span className="text-sm text-foreground">{student.college}</span>
    ),
  },
  {
    key: "course",
    header: "Course",
    hideBelow: "sm",
    cell: (student) => (
      <span className="text-sm text-muted-foreground">{student.course}</span>
    ),
  },
  {
    key: "events",
    header: "Events",
    sortable: true,
    sortValue: (student) => student.eventsParticipated,
    hideBelow: "lg",
    cell: (student) => (
      <span className="text-sm font-medium text-foreground">
        {student.eventsParticipated}
      </span>
    ),
  },
  {
    key: "attendance",
    header: "Attendance",
    sortable: true,
    sortValue: (student) => student.attendancePercentage,
    hideBelow: "md",
    cell: (student) => {
      const color =
        student.attendancePercentage >= 85
          ? "bg-success"
          : student.attendancePercentage >= 60
            ? "bg-warning"
            : "bg-danger";
      return (
        <div className="flex w-24 items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${color}`}
              style={{ width: `${student.attendancePercentage}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {student.attendancePercentage}%
          </span>
        </div>
      );
    },
  },
  {
    key: "status",
    header: "Status",
    cell: (student) => <StatusBadge status={student.status} dot />,
  },
];

export default function CollegeStudentsPage() {
  const [query, setQuery] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<CollegeStudent | null>(null);

  const colleges = useMemo(
    () => Array.from(new Set(collegeStudents.map((student) => student.college))),
    [],
  );

  const filtered = useMemo(() => {
    const searched = searchInArray(collegeStudents, query, [
      "name",
      "email",
      "college",
      "course",
    ]);
    return searched.filter(
      (student) =>
        (collegeFilter === "all" || student.college === collegeFilter) &&
        (statusFilter === "all" || student.status === statusFilter),
    );
  }, [query, collegeFilter, statusFilter]);

  const stats = useMemo(
    () => [
      {
        label: "Total Students",
        value: collegeStudents.length,
        icon: UsersRound,
        tint: "text-primary",
      },
      {
        label: "Active",
        value: collegeStudents.filter((student) => student.status === "active")
          .length,
        icon: UserRound,
        tint: "text-success",
      },
      {
        label: "Blocked",
        value: collegeStudents.filter((student) => student.status === "blocked")
          .length,
        icon: GraduationCap,
        tint: "text-danger",
      },
      {
        label: "Avg. Participation",
        value: `${Math.round(
          collegeStudents.reduce(
            (sum, student) => sum + student.eventsParticipated,
            0,
          ) / collegeStudents.length,
        )}`,
        icon: Trophy,
        tint: "text-warning",
      },
    ],
    [],
  );

  const columns = useMemo(() => buildColumns(setSelected), []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        subtitle="Browse student profiles and participation"
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
            placeholder="Search name, email, college or course…"
            className="h-10 rounded-xl pl-9"
            aria-label="Search students"
          />
        </div>
        <Select value={collegeFilter} onValueChange={setCollegeFilter}>
          <SelectTrigger className="h-10 w-full rounded-xl sm:w-56" aria-label="Filter by college">
            <SelectValue placeholder="All colleges" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All colleges</SelectItem>
            {colleges.map((college) => (
              <SelectItem key={college} value={college}>
                {college}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-10 w-full rounded-xl sm:w-40" aria-label="Filter by status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(student) => student.id}
        pageSize={8}
        emptyMessage="No students found"
      />

      <CollegeStudentDrawer
        student={selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}
