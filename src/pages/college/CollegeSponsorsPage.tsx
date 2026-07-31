import { useMemo, useState } from "react";
import { BadgeCheck, HandCoins, Plus, Trophy, UsersRound } from "lucide-react";
import {
  collegeSponsors,
  sponsorTierOrder,
  type CollegeSponsor,
  type CollegeSponsorTier,
} from "@/data/college/sponsors";
import { searchInArray } from "@/utils/filter";
import { formatCurrency } from "@/utils/format";
import { PageHeader } from "@/components/common/PageHeader";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/utils/cn";

const tierStyles: Record<CollegeSponsorTier, string> = {
  Platinum: "bg-gradient-to-r from-indigo-500 to-violet-500 text-white",
  Gold: "bg-gradient-to-r from-amber-400 to-orange-500 text-white",
  Silver: "bg-gradient-to-r from-slate-400 to-slate-500 text-white",
  Bronze: "bg-gradient-to-r from-amber-700 to-amber-800 text-white",
};

const buildColumns: DataTableColumn<CollegeSponsor>[] = [
  {
    key: "name",
    header: "Sponsor",
    cell: (sponsor) => (
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white"
          style={{ backgroundColor: sponsor.color }}
        >
          {sponsor.name[0]}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {sponsor.name}
          </p>
          <p className="hidden truncate text-xs text-muted-foreground md:block">
            {sponsor.category}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "tier",
    header: "Tier",
    hideBelow: "sm",
    cell: (sponsor) => (
      <span
        className={cn(
          "rounded-full px-2.5 py-1 text-xs font-semibold",
          tierStyles[sponsor.tier],
        )}
      >
        {sponsor.tier}
      </span>
    ),
  },
  {
    key: "contribution",
    header: "Contribution",
    sortable: true,
    sortValue: (sponsor) => sponsor.contribution,
    hideBelow: "md",
    cell: (sponsor) => (
      <span className="text-sm font-semibold text-foreground">
        {formatCurrency(sponsor.contribution)}
      </span>
    ),
  },
  {
    key: "events",
    header: "Supported Events",
    hideBelow: "lg",
    cell: (sponsor) => (
      <span className="text-sm text-muted-foreground">
        {sponsor.eventsSupported.join(", ")}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (sponsor) => (
      <StatusBadge status={sponsor.active ? "active" : "inactive"} dot />
    ),
  },
];

export default function CollegeSponsorsPage() {
  const [query, setQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    const searched = searchInArray(collegeSponsors, query, [
      "name",
      "category",
      "tier",
    ]);
    return searched.filter(
      (sponsor) =>
        (tierFilter === "all" || sponsor.tier === tierFilter) &&
        (statusFilter === "all" ||
          (statusFilter === "active" ? sponsor.active : !sponsor.active)),
    );
  }, [query, tierFilter, statusFilter]);

  const stats = useMemo(
    () => [
      {
        label: "Total Sponsors",
        value: collegeSponsors.length,
        icon: HandCoins,
        tint: "text-primary",
      },
      {
        label: "Active",
        value: collegeSponsors.filter((sponsor) => sponsor.active).length,
        icon: BadgeCheck,
        tint: "text-success",
      },
      {
        label: "Total Contribution",
        value: formatCurrency(
          collegeSponsors.reduce((sum, sponsor) => sum + sponsor.contribution, 0),
        ),
        icon: Trophy,
        tint: "text-warning",
      },
      {
        label: "Events Supported",
        value: new Set(collegeSponsors.flatMap((sponsor) => sponsor.eventsSupported))
          .size,
        icon: UsersRound,
        tint: "text-info",
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sponsors"
        subtitle="Manage event sponsors and partnerships"
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Sponsor</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Sponsor</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="sp-name">
                    Sponsor name
                  </label>
                  <Input id="sp-name" placeholder="e.g. CloudPeak Tech" />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="sp-category">
                      Category
                    </label>
                    <Input id="sp-category" placeholder="e.g. Cloud Services" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="sp-tier">
                      Tier
                    </label>
                    <Select defaultValue="Gold">
                      <SelectTrigger id="sp-tier" className="w-full rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Platinum">Platinum</SelectItem>
                        <SelectItem value="Gold">Gold</SelectItem>
                        <SelectItem value="Silver">Silver</SelectItem>
                        <SelectItem value="Bronze">Bronze</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="sp-contribution">
                    Contribution (INR)
                  </label>
                  <Input id="sp-contribution" type="number" placeholder="50000" />
                </div>
              </div>
              <DialogFooter>
                <Button className="w-full">Add Sponsor</Button>
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

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {sponsorTierOrder.map((tier) => {
          const sponsors = collegeSponsors.filter((sponsor) => sponsor.tier === tier);
          const contribution = sponsors.reduce(
            (sum, sponsor) => sum + sponsor.contribution,
            0,
          );
          return (
            <button
              key={tier}
              onClick={() =>
                setTierFilter(tierFilter === tier ? "all" : tier)
              }
              className={cn(
                "rounded-2xl border p-4 text-left shadow-card transition-colors",
                tierFilter === tier
                  ? "border-primary/50 bg-primary/5"
                  : "border-border bg-card hover:bg-muted/40",
              )}
            >
              <span
                className={cn(
                  "inline-block rounded-full px-2.5 py-1 text-xs font-semibold",
                  tierStyles[tier],
                )}
              >
                {tier}
              </span>
              <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
                {sponsors.length}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(contribution)} total
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, category or tier…"
            className="h-10 rounded-xl pl-9"
            aria-label="Search sponsors"
          />
        </div>
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="h-10 w-full rounded-xl sm:w-44" aria-label="Filter by tier">
            <SelectValue placeholder="All tiers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tiers</SelectItem>
            {sponsorTierOrder.map((tier) => (
              <SelectItem key={tier} value={tier}>
                {tier}
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
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={buildColumns}
        data={filtered}
        rowKey={(sponsor) => sponsor.id}
        pageSize={8}
        emptyMessage="No sponsors found"
      />
    </div>
  );
}
