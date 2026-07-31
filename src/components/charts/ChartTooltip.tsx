import type { ReactNode } from "react";

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string; fill?: string; dataKey?: string | number }>;
  label?: string | number;
  valueFormatter?: (value: number, name: string) => string;
  labelFormatter?: (label: string | number) => string;
  showDot?: boolean;
}

const DEFAULT_COLORS: Record<string, string> = {
  colleges: "#5B5CEB",
  students: "#3B82F6",
  value: "#5B5CEB",
};

export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
  labelFormatter,
  showDot = true,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const heading =
    labelFormatter && label !== undefined
      ? labelFormatter(label)
      : String(label ?? "");

  return (
    <div className="min-w-40 rounded-xl border border-border bg-popover/95 px-3.5 py-2.5 shadow-popover backdrop-blur-sm">
      {heading && (
        <p className="mb-1.5 text-xs font-semibold text-foreground">{heading}</p>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => {
          const name = entry.name ?? entry.dataKey ?? "value";
          const color = entry.color ?? entry.fill ?? DEFAULT_COLORS[name];
          const value =
            valueFormatter && typeof entry.value === "number"
              ? valueFormatter(entry.value, String(name))
              : String(entry.value ?? 0);
          return (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {showDot && (
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                )}
                {String(name)
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (char) => char.toUpperCase())}
              </span>
              <span className="text-xs font-semibold text-foreground">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ChartLegendItem({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-muted-foreground">{label}</span>
      {value !== undefined && (
        <span className="font-semibold text-foreground">{value}</span>
      )}
    </div>
  );
}
