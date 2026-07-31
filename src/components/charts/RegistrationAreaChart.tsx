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
import type { ChartPoint } from "@/types";
import { CHART_COLORS } from "@/utils/constants";
import { ChartTooltip } from "./ChartTooltip";

interface RegistrationAreaChartProps {
  data: ChartPoint[];
}

export function RegistrationAreaChart({ data }: RegistrationAreaChartProps) {
  const gradientId = useId().replace(/:/g, "");

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={data}
        margin={{ top: 8, right: 8, bottom: 0, left: -18 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.32} />
            <stop offset="55%" stopColor={CHART_COLORS.primary} stopOpacity={0.08} />
            <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
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
          content={<ChartTooltip />}
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
  );
}
