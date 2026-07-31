import { useMemo, useState } from "react";
import { Megaphone, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { announcements } from "@/data/announcements";
import { searchInArray, filterByStatus } from "@/utils/filter";
import { PageHeader } from "@/components/common/PageHeader";
import { AnnouncementCard } from "@/components/cards/AnnouncementCard";
import { TableToolbar } from "@/components/common/TableToolbar";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";

export default function AnnouncementsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    const searched = searchInArray(announcements, query, [
      "title",
      "summary",
      "audience",
      "author",
    ]);
    return filterByStatus(searched, "status", status);
  }, [query, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        subtitle="Broadcast updates to colleges, admins and students"
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Announcement
          </Button>
        }
      />

      <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
        <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p>
          Announcements reach <span className="font-medium text-foreground">248 colleges</span>{" "}
          instantly via email, SMS and in-app notifications. Pinned posts stay
          at the top for 7 days.
        </p>
      </div>

      <TableToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search announcements…"
        filterValue={status}
        onFilterChange={setStatus}
        filterOptions={[
          { value: "all", label: "All statuses" },
          { value: "published", label: "Published" },
          { value: "scheduled", label: "Scheduled" },
          { value: "draft", label: "Draft" },
        ]}
        total={filtered.length}
      />

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card shadow-card">
          <EmptyState
            icon={SearchX}
            title="No announcements found"
            description="Try adjusting your search or filters."
          />
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-1 gap-4 xl:grid-cols-2"
        >
          {filtered.map((announcement) => (
            <motion.div
              key={announcement.id}
              variants={{
                hidden: { opacity: 0, y: 14 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <AnnouncementCard announcement={announcement} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
