import { motion } from "framer-motion";
import { CalendarDays, DoorOpen, Ticket, Users } from "lucide-react";
import type { VolunteerDashboardStat } from "@/data/volunteer/dashboard";
import { useCountUp } from "@/hooks/use-count-up";
import { cn } from "@/utils/cn";

const ICONS = {
  calendar: CalendarDays,
  users: Users,
  ticket: Ticket,
  gate: DoorOpen,
} as const;

const TINTS: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  info: "bg-info/10 text-info",
  warning: "bg-warning/10 text-warning",
};

function AnimatedValue({ value }: { value: number }) {
  const animated = useCountUp(value, { duration: 900 });
  return (
    <>{Math.round(animated).toLocaleString("en-US")}</>
  );
}

export function VolunteerStatCard({
  stat,
  index = 0,
}: {
  stat: VolunteerDashboardStat;
  index?: number;
}) {
  const Icon = ICONS[stat.icon as keyof typeof ICONS] ?? CalendarDays;
  const tint = TINTS[stat.tint] ?? TINTS.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
      whileTap={{ scale: 0.98 }}
      className="relative h-full overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-card"
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            tint,
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        {stat.hint && (
          <span className="max-w-[45%] truncate rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {stat.hint}
          </span>
        )}
      </div>
      <p className="mt-3 text-[13px] font-medium text-muted-foreground">
        {stat.label}
      </p>
      <p className="mt-0.5 truncate text-2xl font-bold tracking-tight text-foreground sm:text-[26px]">
        {stat.format === "number" && typeof stat.value === "number" ? (
          <>
            <AnimatedValue value={stat.value} />
            {stat.suffix}
          </>
        ) : (
          stat.value
        )}
      </p>
    </motion.div>
  );
}
