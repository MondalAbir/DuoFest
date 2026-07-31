import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { eventStatusSlices } from "@/data/college/analytics";
import { useCountUp } from "@/hooks/use-count-up";
import { formatNumber } from "@/utils/format";
import { ChartTooltip } from "@/components/charts/ChartTooltip";

export function EventStatusDonutChart() {
  const total = eventStatusSlices.reduce((sum, slice) => sum + slice.value, 0);
  const animatedTotal = useCountUp(total, { duration: 1300 });

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative h-[200px] w-full max-w-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltip />} />
            <Pie
              data={eventStatusSlices}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={92}
              paddingAngle={3}
              cornerRadius={6}
              strokeWidth={0}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {eventStatusSlices.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {formatNumber(Math.round(animatedTotal))}
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Events
          </span>
        </div>
      </div>

      <div className="grid w-full grid-cols-2 gap-2.5">
        {eventStatusSlices.map((slice) => {
          const percent = ((slice.value / total) * 100).toFixed(1);
          return (
            <div
              key={slice.name}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {slice.name}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">{percent}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
