import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { GroupedBarPoint } from "@/types";
import { CHART_COLORS } from "@/utils/constants";
import { ChartTooltip } from "./ChartTooltip";

interface CollegeGrowthBarChartProps {
  data: GroupedBarPoint[];
}

export function CollegeGrowthBarChart({ data }: CollegeGrowthBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 8, right: 8, bottom: 0, left: -18 }}
        barGap={6}
      >
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
        />
        <Tooltip
          cursor={{ fill: "rgba(91, 92, 235, 0.06)" }}
          content={<ChartTooltip />}
        />
        <Bar
          dataKey="colleges"
          name="New colleges"
          fill={CHART_COLORS.primary}
          radius={[6, 6, 0, 0]}
          maxBarSize={22}
          animationDuration={800}
          animationEasing="ease-out"
        />
        <Bar
          dataKey="students"
          name="Students (hundreds)"
          fill={CHART_COLORS.info}
          radius={[6, 6, 0, 0]}
          maxBarSize={22}
          animationDuration={800}
          animationEasing="ease-out"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
