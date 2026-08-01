import { Zap } from "lucide-react";
import { cn } from "@/utils/cn";

interface LandingLogoProps {
  className?: string;
  showText?: boolean;
}

export function LandingLogo({ className, showText = true }: LandingLogoProps) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-info text-white shadow-md shadow-primary/25">
        <Zap className="h-5 w-5" strokeWidth={2.5} />
      </span>
      {showText && (
        <span className="text-lg font-semibold tracking-tight text-foreground">
          Duo<span className="text-primary">Fest</span>
        </span>
      )}
    </span>
  );
}
