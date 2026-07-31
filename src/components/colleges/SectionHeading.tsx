import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

interface SectionHeadingProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeading({
  icon: Icon,
  title,
  description,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="space-y-0.5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
