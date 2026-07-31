import { Link } from "react-router";
import { motion } from "framer-motion";
import { CalendarClock, ChevronRight, Megaphone, Sparkles } from "lucide-react";
import { formatDate } from "@/utils/format";

export function WelcomeBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.07] via-card to-card p-6 shadow-card sm:p-8"
    >
      <div
        className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-28 right-32 h-56 w-56 rounded-full bg-purple-400/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" />
              {formatDate(new Date().toISOString())}
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Welcome back, Super Admin.
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground sm:text-[15px]">
            Here's what's happening across DuoFest today. 3 fests are live and
            214 colleges are running events right now.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/announcements"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20"
          >
            <Megaphone className="h-4 w-4" />
            New announcement
          </Link>
          <Link
            to="/admin/analytics"
            className="inline-flex h-10 items-center gap-1 rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-muted"
          >
            View analytics
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
