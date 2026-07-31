import { useMemo, useState } from "react";
import { Plus, UserRoundCheck } from "lucide-react";
import {
  collegeVolunteers,
  type CollegeVolunteer,
} from "@/data/college/volunteers";
import { searchInArray } from "@/utils/filter";
import { PageHeader } from "@/components/common/PageHeader";
import { UserAvatar } from "@/components/common/UserAvatar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CollegeVolunteerDrawer } from "@/components/college/CollegeVolunteerDrawer";

const buildColumns: (
  onOpen: (volunteer: CollegeVolunteer) => void,
) => DataTableColumn<CollegeVolunteer>[] = (onOpen) => [
  {
    key: "volunteer",
    header: "Volunteer",
    cell: (volunteer) => (
      <button
        className="flex w-full items-center gap-3 text-left"
        onClick={() => onOpen(volunteer)}
      >
        <UserAvatar
          name={volunteer.name}
          color={volunteer.avatarColor}
          size="sm"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {volunteer.name}
          </p>
          <p className="hidden truncate text-xs text-muted-foreground md:block">
            {volunteer.email}
          </p>
        </div>
      </button>
    ),
  },
  {
    key: "event",
    header: "Assigned Event",
    hideBelow: "md",
    cell: (volunteer) => (
      <span className="text-sm text-foreground">{volunteer.eventName}</span>
    ),
  },
  {
    key: "gate",
    header: "Gate",
    hideBelow: "sm",
    cell: (volunteer) => (
      <span className="text-sm text-muted-foreground">{volunteer.gate}</span>
    ),
  },
  {
    key: "shift",
    header: "Shift",
    hideBelow: "lg",
    cell: (volunteer) => (
      <span className="text-sm text-muted-foreground">{volunteer.shift}</span>
    ),
  },
  {
    key: "scans",
    header: "QR Scans",
    sortable: true,
    sortValue: (volunteer) => volunteer.checkInsScanned,
    hideBelow: "md",
    cell: (volunteer) => (
      <span className="text-sm font-medium text-foreground">
        {volunteer.checkInsScanned}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (volunteer) => <StatusBadge status={volunteer.status} dot />,
  },
];

export default function CollegeVolunteersPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<CollegeVolunteer | null>(null);

  const filtered = useMemo(() => {
    const searched = searchInArray(collegeVolunteers, query, [
      "name",
      "email",
      "eventName",
      "gate",
    ]);
    return searched.filter(
      (volunteer) =>
        statusFilter === "all" || volunteer.status === statusFilter,
    );
  }, [query, statusFilter]);

  const stats = useMemo(
    () => [
      {
        label: "Total Volunteers",
        value: collegeVolunteers.length,
        tint: "text-primary",
      },
      {
        label: "Assigned",
        value: collegeVolunteers.filter((volunteer) => volunteer.status === "assigned")
          .length,
        tint: "text-info",
      },
      {
        label: "Available",
        value: collegeVolunteers.filter((volunteer) => volunteer.status === "active")
          .length,
        tint: "text-info",
      },
      {
        label: "Inactive",
        value: collegeVolunteers.filter((volunteer) => volunteer.status === "inactive")
          .length,
        tint: "text-muted-foreground",
      },
    ],
    [],
  );

  const columns = useMemo(() => buildColumns(openVolunteer), []);

  function openVolunteer(volunteer: CollegeVolunteer) {
    setSelected(volunteer);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Volunteers"
        subtitle="Manage gate volunteers and assignments"
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Volunteer</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Volunteer</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="vol-name">
                    Full name
                  </label>
                  <Input id="vol-name" placeholder="e.g. Sarah Johnson" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="vol-email">
                    Email
                  </label>
                  <Input id="vol-email" type="email" placeholder="sarah@college.edu" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="vol-phone">
                    Phone
                  </label>
                  <Input id="vol-phone" placeholder="+1 (555) 000-0000" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="vol-event">
                    Assigned event
                  </label>
                  <Select defaultValue="Tech Fest 2025">
                    <SelectTrigger id="vol-event" className="w-full rounded-xl">
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tech Fest 2025">Tech Fest 2025</SelectItem>
                      <SelectItem value="Cultural Night 2025">Cultural Night 2025</SelectItem>
                      <SelectItem value="Sports Carnival 2025">Sports Carnival 2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="vol-gate">
                      Gate
                    </label>
                    <Select defaultValue="Gate A">
                      <SelectTrigger id="vol-gate" className="w-full rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gate A">Gate A</SelectItem>
                        <SelectItem value="Gate B">Gate B</SelectItem>
                        <SelectItem value="Gate C">Gate C</SelectItem>
                        <SelectItem value="VIP Gate">VIP Gate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="vol-shift">
                      Shift
                    </label>
                    <Select defaultValue="Morning (9 AM – 1 PM)">
                      <SelectTrigger id="vol-shift" className="w-full rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Morning (9 AM – 1 PM)">
                          Morning (9 AM – 1 PM)
                        </SelectItem>
                        <SelectItem value="Afternoon (1 PM – 5 PM)">
                          Afternoon (1 PM – 5 PM)
                        </SelectItem>
                        <SelectItem value="Evening (5 PM – 9 PM)">
                          Evening (5 PM – 9 PM)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Button className="w-full gap-2">
                <UserRoundCheck className="h-4 w-4" />
                Invite Volunteer
              </Button>
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
            <p className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </p>
            <p className={`mt-2 text-2xl font-bold tracking-tight ${stat.tint}`}>
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
            placeholder="Search name, email, event or gate…"
            className="h-10 rounded-xl pl-9"
            aria-label="Search volunteers"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            className="h-10 w-full rounded-xl sm:w-48"
            aria-label="Filter by status"
          >
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(volunteer) => volunteer.id}
        pageSize={8}
        emptyMessage="No volunteers found"
      />

      <CollegeVolunteerDrawer
        volunteer={selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}
