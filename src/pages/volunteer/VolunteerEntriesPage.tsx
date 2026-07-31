import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
import { entryStats, volunteerEntries } from "@/data/volunteer/entries";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { UserAvatar } from "@/components/common/UserAvatar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { cn } from "@/utils/cn";

const SUMMARY = [
  { label: "Today's Entries", value: entryStats.total, tint: "text-foreground" },
  { label: "Successful", value: entryStats.successful, tint: "text-success" },
  { label: "Rejected", value: entryStats.rejected, tint: "text-danger" },
  { label: "Duplicate", value: entryStats.duplicate, tint: "text-warning" },
];

export default function VolunteerEntriesPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return volunteerEntries;
    return volunteerEntries.filter(
      (entry) =>
        entry.studentName.toLowerCase().includes(q) ||
        entry.ticketId.toLowerCase().includes(q) ||
        entry.college.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Entry Records"
        subtitle="Read-only record of today's check-ins at your gate"
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {SUMMARY.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
            className="rounded-2xl border border-border bg-card p-4 shadow-card"
          >
            <p className="text-[13px] font-medium text-muted-foreground">
              {stat.label}
            </p>
            <p className={cn("mt-1 text-2xl font-bold tracking-tight", stat.tint)}>
              {stat.value.toLocaleString("en-US")}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-card">
        <div className="border-b border-border p-4 sm:p-5">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by ticket ID or student name…"
            ariaLabel="Search entry records"
            className="sm:max-w-md"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <SearchX className="h-7 w-7" />
            </span>
            <p className="text-sm font-medium text-foreground">
              No entries match “{query}”
            </p>
            <p className="text-sm text-muted-foreground">
              Try a different ticket ID or student name.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3 font-semibold">Student</th>
                    <th className="px-5 py-3 font-semibold">Ticket ID</th>
                    <th className="px-5 py-3 font-semibold">College</th>
                    <th className="px-5 py-3 font-semibold">Entry Time</th>
                    <th className="px-5 py-3 font-semibold">Gate</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((entry) => (
                    <tr
                      key={entry.id}
                      className="transition-colors hover:bg-muted/50"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={entry.studentName}
                            color={entry.avatarColor}
                            size="sm"
                          />
                          <span className="font-medium text-foreground">
                            {entry.studentName}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                        {entry.ticketId}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {entry.college}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {entry.entryTime}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {entry.gate}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={entry.status} dot />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-border md:hidden">
              {filtered.map((entry) => (
                <li key={entry.id} className="flex items-center gap-3 px-4 py-3.5">
                  <UserAvatar
                    name={entry.studentName}
                    color={entry.avatarColor}
                    size="md"
                    className="h-11 w-11 shrink-0 text-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {entry.studentName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {entry.college}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                      {entry.ticketId} · {entry.entryTime} · {entry.gate}
                    </p>
                  </div>
                  <StatusBadge status={entry.status} dot />
                </li>
              ))}
            </ul>

            <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
              Showing {filtered.length} of {volunteerEntries.length} records
            </div>
          </>
        )}
      </div>
    </div>
  );
}
