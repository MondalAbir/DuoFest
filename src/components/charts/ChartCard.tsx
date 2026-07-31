import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  className,
  contentClassName,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-6 shadow-card transition-shadow duration-300 hover:shadow-card-hover",
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
      <div className={cn("h-full", contentClassName)}>{children}</div>
    </div>
  );
}
