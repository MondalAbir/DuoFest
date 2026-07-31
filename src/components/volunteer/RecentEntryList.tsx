import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import type { VolunteerEntryRecord } from "@/data/volunteer/entries";
import { UserAvatar } from "@/components/common/UserAvatar";
import { StatusBadge } from "@/components/common/StatusBadge";

export function RecentEntryList({
  entries,
}: {
  entries: VolunteerEntryRecord[];
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
      className="rounded-2xl border border-border bg-card p-5 shadow-card"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            Recent Entries
          </h3>
          <p className="text-sm text-muted-foreground">
            Latest check-ins at your gate
          </p>
        </div>
        <Link
          to="/admin/volunteer/entries"
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-muted"
        >
          View all
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <ul className="divide-y divide-border">
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-center gap-3 py-3">
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
                {entry.college} · {entry.gate}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <StatusBadge status={entry.status} dot />
              <span className="text-xs text-muted-foreground">
                {entry.entryTime}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
