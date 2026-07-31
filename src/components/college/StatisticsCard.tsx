import { motion } from "framer-motion";
import {
  CalendarDays,
  QrCode,
  Sparkles,
  Ticket,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { CollegeStat } from "@/data/college/dashboard";
import { useCountUp } from "@/hooks/use-count-up";
import { cn } from "@/utils/cn";

const ICONS: Record<string, LucideIcon> = {
  calendar: CalendarDays,
  sparkles: Sparkles,
  ticket: Ticket,
  qr: QrCode,
  users: Users,
  wallet: Wallet,
};

interface StatisticsCardProps {
  stat: CollegeStat;
  index?: number;
}

export function StatisticsCard({ stat, index = 0 }: StatisticsCardProps) {
  const Icon = ICONS[stat.icon] ?? CalendarDays;
  const animated = useCountUp(stat.value, { delay: index * 0.06 });
  const display = Math.round(animated).toLocaleString("en-US");
  const positive = stat.growth >= 0;
  const Trending = positive ? TrendingUp : TrendingDown;

  return (
    <motion.div
      data-testid={`stat-${stat.id}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
      whileHover={{ y: -4 }}
    >
      <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card transition-shadow duration-300 hover:shadow-card-hover">
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-70",
            stat.softGradient,
          )}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/[0.04] blur-2xl" />

        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-2 text-[26px] font-bold tracking-tight text-foreground">
              {stat.prefix}
              {display}
            </p>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold",
                  positive
                    ? "bg-success/10 text-success"
                    : "bg-danger/10 text-danger",
                )}
              >
                <Trending className="h-3 w-3" />
                {positive ? "+" : ""}
                {stat.growth.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </div>
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-110",
              stat.tileGradient,
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
    </motion.div>
  );
}
