import { Link } from "react-router";
import { ArrowUpRight, Building2 } from "lucide-react";
import { colleges } from "@/data/colleges";
import { formatDate } from "@/utils/format";
import { UserAvatar } from "@/components/common/UserAvatar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import type { College } from "@/types";

const columns: DataTableColumn<College>[] = [
  {
    key: "college",
    header: "College",
    cell: (college) => (
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
          style={{ backgroundColor: college.logoColor }}
        >
          {college.name
            .split(" ")
            .slice(0, 2)
            .map((word) => word[0])
            .join("")}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {college.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {college.city}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "admin",
    header: "Admin",
    hideBelow: "md",
    cell: (college) => (
      <div className="flex items-center gap-2">
        <UserAvatar name={college.adminName} color={college.logoColor} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm text-foreground">{college.adminName}</p>
          <p className="hidden truncate text-xs text-muted-foreground xl:block">
            {college.adminEmail}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (college) => <StatusBadge status={college.status} dot />,
  },
  {
    key: "joinedAt",
    header: "Join Date",
    hideBelow: "lg",
    cell: (college) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(college.joinedAt)}
      </span>
    ),
  },
];

export function RecentCollegesWidget() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-shadow duration-300 hover:shadow-card-hover">
      <div className="flex items-center justify-between px-6 pt-5">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground">
            <Building2 className="h-4 w-4 text-primary" />
            Recent Colleges
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Latest institutions to join DuoFest
          </p>
        </div>
        <Link
          to="/admin/colleges"
          className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          View all
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="mt-4">
        <DataTable
          columns={columns}
          data={colleges.slice(0, 5)}
          rowKey={(college) => college.id}
          pageSize={6}
          compact
        />
      </div>
    </div>
  );
}
