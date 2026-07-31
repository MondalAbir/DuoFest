import { motion } from "framer-motion";
import { CalendarDays, QrCode } from "lucide-react";
import { Link } from "react-router";
import { volunteerStats, VOLUNTEER_EVENT, recentVolunteerEntries } from "@/data/volunteer/dashboard";
import { volunteerProfile } from "@/data/volunteer/profile";
import { VolunteerStatCard } from "@/components/volunteer/VolunteerStatCard";
import { TodayEventCard } from "@/components/volunteer/TodayEventCard";
import { RecentEntryList } from "@/components/volunteer/RecentEntryList";
import { Button } from "@/components/ui/button";

export default function VolunteerDashboardPage() {
  const firstName = volunteerProfile.name.split(" ")[0];

  return (
    <div className="space-y-5 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            {VOLUNTEER_EVENT.date}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Hi {firstName}, ready to scan?
          </h1>
          <p className="text-sm text-muted-foreground">
            {VOLUNTEER_EVENT.gate} · {VOLUNTEER_EVENT.shift}
          </p>
        </div>
        <Button asChild size="lg" className="h-12 gap-2 px-6">
          <Link to="/admin/volunteer/scan">
            <QrCode className="h-5 w-5" />
            Open Scanner
          </Link>
        </Button>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {volunteerStats.map((stat, index) => (
          <VolunteerStatCard key={stat.id} stat={stat} index={index} />
        ))}
      </div>

      <TodayEventCard event={VOLUNTEER_EVENT} />

      <RecentEntryList entries={recentVolunteerEntries} />
    </div>
  );
}
