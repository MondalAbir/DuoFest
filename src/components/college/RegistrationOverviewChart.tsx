import { useState } from "react";
import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { registrationTrends } from "@/data/college/analytics";
import { CHART_COLORS } from "@/utils/constants";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { cn } from "@/utils/cn";

const RANGES = [
  { key: "thisWeek", label: "This Week" },
  { key: "lastWeek", label: "Last Week" },
  { key: "thisMonth", label: "This Month" },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];

export function RegistrationOverviewChart() {
  const [range, setRange] = useState<RangeKey>("thisWeek");
  const gradientId = useId().replace(/:/g, "");

  return (
    <div>
      <div className="mb-4 flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1">
        {RANGES.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setRange(item.key)}
            className={cn(
              "flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              range === item.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart
          data={registrationTrends[range]}
          margin={{ top: 8, right: 8, bottom: 0, left: -18 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={CHART_COLORS.primary}
                stopOpacity={0.32}
              />
              <stop
                offset="55%"
                stopColor={CHART_COLORS.primary}
                stopOpacity={0.08}
              />
              <stop
                offset="100%"
                stopColor={CHART_COLORS.primary}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke={CHART_COLORS.grid}
            strokeDasharray="4 4"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
            dy={6}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
            tickFormatter={(value: number) =>
              value >= 1000 ? `${value / 1000}k` : String(value)
            }
          />
          <Tooltip
            cursor={{ stroke: CHART_COLORS.primary, strokeOpacity: 0.35 }}
            content={<ChartTooltip valueFormatter={(value) => value.toLocaleString("en-US")} />}
          />
          <Area
            type="monotone"
            dataKey="value"
            name="Registrations"
            stroke={CHART_COLORS.primary}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            animationDuration={900}
            animationEasing="ease-out"
            activeDot={{ r: 5, strokeWidth: 2, stroke: CHART_COLORS.primary }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
