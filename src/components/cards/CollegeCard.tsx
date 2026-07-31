import { ArrowUpRight, CalendarDays, Users } from "lucide-react";
import { motion } from "framer-motion";
import type { College } from "@/types";
import { cn } from "@/utils/cn";
import { formatDate, formatNumber } from "@/utils/format";
import { UserAvatar } from "@/components/common/UserAvatar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";

interface CollegeCardProps {
  college: College;
  onView?: (college: College) => void;
}

export function CollegeCard({ college, onView }: CollegeCardProps) {
  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
            style={{ backgroundColor: college.logoColor }}
          >
            {college.name
              .split(" ")
              .slice(0, 2)
              .map((word) => word[0])
              .join("")}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-foreground">
              {college.name}
            </h3>
            <p className="truncate text-xs text-muted-foreground">
              {college.city}, {college.state}
            </p>
          </div>
        </div>
        <StatusBadge status={college.status} dot />
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3.5 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          {formatNumber(college.students)} students
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          {college.events} events
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2.5">
        <UserAvatar name={college.adminName} color={college.logoColor} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-foreground">
            {college.adminName}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            Joined {formatDate(college.joinedAt)}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1 px-2.5 text-xs"
          aria-label={`View ${college.name}`}
          onClick={() => onView?.(college)}
        >
          View
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r",
          college.status === "active"
            ? "from-success to-success/0"
            : college.status === "pending"
              ? "from-warning to-warning/0"
              : "from-danger to-danger/0",
        )}
      />
    </motion.article>
  );
}
