import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, Plus } from "lucide-react";
import { useColleges } from "@/lib/hooks";
import { adaptCollege } from "@/lib/adapters";
import type { DashboardStat } from "@/types";
import { searchInArray, filterByStatus } from "@/utils/filter";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { CollegeCard } from "@/components/cards/CollegeCard";
import { TableToolbar } from "@/components/common/TableToolbar";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { AddCollegeDialog } from "@/components/colleges/AddCollegeDialog";
import { CollegeDetailsDrawer } from "@/components/colleges/CollegeDetailsDrawer";
import type { College } from "@/types";
import { SearchX } from "lucide-react";

export default function CollegesPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [addCollegeOpen, setAddCollegeOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);

  const { data, isLoading } = useColleges({ perPage: 100 });
  const colleges = (data?.items ?? []).map(adaptCollege);

  const stats = useMemo<DashboardStat[]>(() => {
    const active = colleges.filter((c) => c.status === "active").length;
    const pending = colleges.filter((c) => c.status === "pending").length;
    const suspended = colleges.filter((c) => c.status === "suspended").length;
    return [
      {
        id: "colleges-total",
        title: "Total Colleges",
        value: colleges.length,
        delta: { value: 12.5, direction: "up", label: "vs last month" },
        icon: "building",
        tint: "primary",
      },
      {
        id: "colleges-active",
        title: "Active Colleges",
        value: active,
        delta: { value: 8.2, direction: "up", label: "vs last month" },
        icon: "check-circle",
        tint: "success",
      },
      {
        id: "colleges-pending",
        title: "Pending Approval",
        value: pending,
        delta: { value: 2.1, direction: "up", label: "vs last month" },
        icon: "sparkles",
        tint: "warning",
      },
      {
        id: "colleges-suspended",
        title: "Suspended",
        value: suspended,
        delta: { value: 0.4, direction: "down", label: "vs last month" },
        icon: "users",
        tint: "danger",
      },
    ];
  }, [colleges]);

  const filtered = useMemo(() => {
    const searched = searchInArray(colleges, query, [
      "name",
      "city",
      "state",
      "adminName",
    ]);
    return filterByStatus(searched, "status", status);
  }, [query, status, colleges]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Colleges"
        subtitle="Manage all colleges onboarded on DuoFest"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button
              className="gap-2"
              onClick={() => setAddCollegeOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add College
            </Button>
          </>
        }
      />

      <AddCollegeDialog
        open={addCollegeOpen || Boolean(editingCollege)}
        onOpenChange={(open) => {
          if (!open) {
            setAddCollegeOpen(false);
            setEditingCollege(null);
          }
        }}
        college={editingCollege}
      />

      <CollegeDetailsDrawer
        college={selectedCollege}
        onOpenChange={(open) => {
          if (!open) setSelectedCollege(null);
        }}
        onEdit={(college) => {
          setSelectedCollege(null);
          setEditingCollege(college);
        }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.id} stat={stat} index={index} />
        ))}
      </div>

      <TableToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search by name, city or admin…"
        filterValue={status}
        onFilterChange={setStatus}
        filterOptions={[
          { value: "all", label: "All statuses" },
          { value: "active", label: "Active" },
          { value: "pending", label: "Pending" },
          { value: "suspended", label: "Suspended" },
        ]}
        total={filtered.length}
      />

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card shadow-card">
          <EmptyState
            icon={SearchX}
            title="No colleges found"
            description="Try adjusting your search or filters."
          />
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {filtered.map((college) => (
            <CollegeCard
              key={college.id}
              college={college}
              onView={setSelectedCollege}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
