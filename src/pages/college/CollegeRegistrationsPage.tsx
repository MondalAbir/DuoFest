import { useMemo, useState } from "react";
import {
  Ban,
  Check,
  CheckCheck,
  Download,
  MoreHorizontal,
  QrCode,
  Ticket,
  UserRound,
} from "lucide-react";
import {
  recentRegistrations,
  type CollegeRegStatus,
  type CollegeRegistration,
} from "@/data/college/registrations";
import { searchInArray, filterByStatus } from "@/utils/filter";
import { formatCurrency } from "@/utils/format";
import { PageHeader } from "@/components/common/PageHeader";
import { TableToolbar } from "@/components/common/TableToolbar";
import { UserAvatar } from "@/components/common/UserAvatar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { CollegeRegistrationDrawer } from "@/components/college/CollegeRegistrationDrawer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const buildColumns = (
  onView: (registration: CollegeRegistration) => void,
  onApprove: (registration: CollegeRegistration) => void,
  onReject: (registration: CollegeRegistration) => void,
): DataTableColumn<CollegeRegistration>[] => [
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
    key: "college",
    header: "College",
    hideBelow: "md",
    cell: (reg) => (
      <span className="text-sm text-foreground">{reg.college}</span>
    ),
  },
  {
    key: "payment",
    header: "Payment",
    cell: (reg) => (
      <div className="flex flex-col gap-0.5">
        <StatusBadge status={reg.payment} dot />
        <span className="hidden text-xs text-muted-foreground sm:block">
          {formatCurrency(reg.amount)}
        </span>
      </div>
    ),
  },
  {
    key: "qr",
    header: "QR Ticket",
    align: "center",
    hideBelow: "sm",
    cell: (reg) =>
      reg.qrTicket ? (
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-success/10 text-success"
          title="QR ticket issued"
        >
          <QrCode className="h-4 w-4" />
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
  {
    key: "attendance",
    header: "Attendance",
    hideBelow: "md",
    cell: (reg) => <StatusBadge status={reg.attendance} dot />,
  },
  {
    key: "status",
    header: "Status",
    cell: (reg) => <StatusBadge status={reg.status} dot />,
  },
  {
    key: "actions",
    header: "",
    align: "right",
    cell: (reg) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Row actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => onView(reg)}
          >
            <UserRound className="h-4 w-4" />
            View
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Download className="h-4 w-4" />
            Download Ticket
          </DropdownMenuItem>
          {reg.status === "pending" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onApprove(reg)}
              >
                <Check className="h-4 w-4" />
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-danger focus:bg-danger/10 focus:text-danger"
                onClick={() => onReject(reg)}
              >
                <Ban className="h-4 w-4" />
                Reject
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function CollegeRegistrationsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [registrations, setRegistrations] =
    useState<CollegeRegistration[]>(recentRegistrations);
  const [selected, setSelected] = useState<CollegeRegistration | null>(null);

  const updateStatus = (
    target: CollegeRegistration,
    status: CollegeRegStatus,
  ) => {
    setRegistrations((current) =>
      current.map((item) =>
        item.id === target.id ? { ...item, status } : item,
      ),
    );
  };

  const columns = useMemo(
    () =>
      buildColumns(
        setSelected,
        (reg) => updateStatus(reg, "confirmed"),
        (reg) => updateStatus(reg, "cancelled"),
      ),
    [],
  );

  const stats = useMemo(
    () => [
      {
        label: "Total Registered",
        value: registrations.length,
        icon: Ticket,
        tint: "text-primary",
      },
      {
        label: "Confirmed",
        value: registrations.filter((reg) => reg.status === "confirmed").length,
        icon: CheckCheck,
        tint: "text-success",
      },
      {
        label: "Pending",
        value: registrations.filter((reg) => reg.status === "pending").length,
        icon: Ticket,
        tint: "text-warning",
      },
      {
        label: "Cancelled",
        value: registrations.filter((reg) => reg.status === "cancelled").length,
        icon: Ban,
        tint: "text-danger",
      },
    ],
    [registrations],
  );

  const filtered = useMemo(() => {
    const searched = searchInArray(registrations, query, [
      "studentName",
      "email",
      "eventName",
      "college",
      "course",
    ]);
    return filterByStatus(searched, "status", status);
  }, [registrations, query, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registrations"
        subtitle="Manage student registrations across all events"
        actions={
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
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

      <TableToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search by name, email, event or course…"
        filterValue={status}
        onFilterChange={setStatus}
        filterOptions={[
          { value: "all", label: "All statuses" },
          { value: "confirmed", label: "Confirmed" },
          { value: "pending", label: "Pending" },
          { value: "cancelled", label: "Cancelled" },
        ]}
        total={filtered.length}
      />

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(reg) => reg.id}
        pageSize={8}
        emptyMessage="No registrations found"
      />

      <CollegeRegistrationDrawer
        registration={selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}
