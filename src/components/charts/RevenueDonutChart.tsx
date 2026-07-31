import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { DonutSlice } from "@/types";
import { useCountUp } from "@/hooks/use-count-up";
import { formatCompact, formatCurrency } from "@/utils/format";
import { ChartTooltip } from "./ChartTooltip";

interface RevenueDonutChartProps {
  data: DonutSlice[];
  centerLabel?: string;
  valueFormatter?: (value: number) => string;
}

export function RevenueDonutChart({
  data,
  centerLabel = "Total",
  valueFormatter = (value) => formatCurrency(value),
}: RevenueDonutChartProps) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0);
  const animatedTotal = useCountUp(total, { duration: 1300 });

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative h-[220px] w-full max-w-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltip valueFormatter={valueFormatter} />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={3}
              cornerRadius={6}
              strokeWidth={0}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {data.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {valueFormatter(Math.round(animatedTotal))}
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {centerLabel}
          </span>
        </div>
      </div>
      <div className="grid w-full grid-cols-1 gap-2.5">
        {data.map((slice) => {
          const percent = ((slice.value / total) * 100).toFixed(1);
          return (
            <div
              key={slice.name}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-3.5 py-2.5 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {slice.name}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-semibold text-foreground">
                  {formatCompact(slice.value)}
                </span>
                <span className="w-11 text-right text-xs text-muted-foreground">
                  {percent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
