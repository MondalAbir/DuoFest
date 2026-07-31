import { motion } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Sparkles,
  Ticket,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { DashboardStat } from "@/types";
import { useCountUp } from "@/hooks/use-count-up";
import { cn } from "@/utils/cn";

const ICONS: Record<string, LucideIcon> = {
  building: Building2,
  "check-circle": CheckCircle2,
  sparkles: Sparkles,
  users: Users,
  ticket: Ticket,
  dollar: DollarSign,
  shield: ShieldCheck,
  wallet: Wallet,
};

const TINTS: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  info: "bg-info/10 text-info",
  warning: "bg-warning/10 text-warning",
  secondary: "bg-secondary text-secondary-foreground",
  danger: "bg-danger/10 text-danger",
};

interface StatCardProps {
  stat: DashboardStat;
  index?: number;
}

function StatValue({
  value,
  prefix,
  suffix,
  decimals,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const animated = useCountUp(value, { delay: 0 });
  const display =
    decimals !== undefined
      ? animated.toLocaleString("en-US", {
          maximumFractionDigits: decimals,
          minimumFractionDigits: decimals,
        })
      : Math.round(animated).toLocaleString("en-US");
  return (
    <span>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

export function StatCard({ stat, index = 0 }: StatCardProps) {
  const Icon = ICONS[stat.icon] ?? Building2;
  const positive = stat.delta.direction === "up";
  const Trending = positive ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: "easeOut" }}
      whileHover={{ y: -4 }}
    >
      <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card transition-shadow duration-300 hover:shadow-card-hover">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-muted-foreground">
              {stat.title}
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground lg:text-[26px]">
              <StatValue
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                decimals={stat.decimals}
              />
            </p>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold",
                  positive ? "bg-success/10 text-success" : "bg-danger/10 text-danger",
                )}
              >
                <Trending className="h-3 w-3" />
                {positive ? "+" : ""}
                {stat.delta.value.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">{stat.delta.label}</span>
            </div>
          </div>
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110",
              TINTS[stat.tint] ?? TINTS.primary,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
    </motion.div>
  );
}
