import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface DashboardChartProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function DashboardChart({
  title,
  subtitle,
  action,
  children,
  className,
  contentClassName,
}: DashboardChartProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card transition-shadow duration-300 hover:shadow-card-hover",
        className,
      )}
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      <div className={cn("min-h-0 flex-1", contentClassName)}>{children}</div>
    </div>
  );
}
