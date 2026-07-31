import {
  CalendarClock,
  Check,
  FileBadge,
  HandCoins,
  Image,
  MapPin,
  NotebookText,
  Ticket,
  Users,
} from "lucide-react";
import { cn } from "@/utils/cn";

export interface EventStep {
  label: string;
  icon: typeof NotebookText;
}

export const EVENT_STEPS: EventStep[] = [
  { label: "Basic Details", icon: NotebookText },
  { label: "Banner", icon: Image },
  { label: "Venue", icon: MapPin },
  { label: "Schedule", icon: CalendarClock },
  { label: "Registration", icon: Ticket },
  { label: "Volunteers", icon: Users },
  { label: "Certificates", icon: FileBadge },
  { label: "Sponsors", icon: HandCoins },
  { label: "Review", icon: Check },
];

interface EventStepperProps {
  current: number;
  onSelect: (index: number) => void;
  errorSteps?: number[];
}

export function EventStepper({ current, onSelect, errorSteps }: EventStepperProps) {
  return (
    <div className="scrollbar-thin overflow-x-auto rounded-xl border border-border bg-card p-4">
      <ol className="flex min-w-max items-start gap-0">
        {EVENT_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isComplete = index < current;
          const isActive = index === current;
          const isLast = index === EVENT_STEPS.length - 1;
          const hasError = errorSteps?.includes(index) ?? false;

          return (
            <li
              key={step.label}
              className={cn("flex flex-col items-center", !isLast && "flex-1")}
            >
              <div className="flex w-full items-center">
                <button
                  type="button"
                  onClick={() => onSelect(index)}
                  aria-current={isActive ? "step" : undefined}
                  className={cn(
                    "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                    isActive &&
                      "border-primary bg-primary text-primary-foreground",
                    isComplete &&
                      "border-primary/60 bg-primary/10 text-primary hover:bg-primary/20",
                    !isActive &&
                      !isComplete &&
                      "border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {isComplete ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  {hasError && !isActive && (
                    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-card bg-destructive" />
                  )}
                </button>

                {!isLast && (
                  <div
                    className={cn(
                      "mx-1 h-0.5 flex-1 rounded-full transition-colors",
                      isComplete ? "bg-primary/50" : "bg-border",
                    )}
                  />
                )}
              </div>

              <span
                className={cn(
                  "mt-2 hidden max-w-24 truncate text-center text-[11px] font-medium leading-tight sm:block",
                  isActive
                    ? "text-primary"
                    : isComplete
                      ? "text-foreground"
                      : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
