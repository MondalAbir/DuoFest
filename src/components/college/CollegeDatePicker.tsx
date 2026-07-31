import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/utils/cn";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function CollegeDatePicker() {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState<Date>(today);

  const label = selected.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const firstWeekday = new Date(view.year, view.month, 1).getDay();

  const moveMonth = (offset: number) => {
    setView((current) => {
      const next = new Date(current.year, current.month + offset, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  };

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setView({ year: today.getFullYear(), month: today.getMonth() });
    }
    setOpen(next);
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hidden h-9 gap-2 px-3 xl:inline-flex"
          aria-label="Pick a date"
        >
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-3">
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="text-sm font-semibold text-foreground">
            {MONTHS[view.month]} {view.year}
          </p>
          <button
            type="button"
            onClick={() => moveMonth(1)}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((day) => (
            <span
              key={day}
              className="py-1 text-[11px] font-semibold uppercase text-muted-foreground"
            >
              {day}
            </span>
          ))}
          {Array.from({ length: firstWeekday }).map((_, index) => (
            <span key={`blank-${index}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const date = new Date(view.year, view.month, day);
            const isToday = isSameDay(date, today);
            const isSelected = isSameDay(date, selected);
            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  setSelected(date);
                  setOpen(false);
                }}
                className={cn(
                  "flex h-9 items-center justify-center rounded-lg text-sm transition-colors",
                  isSelected
                    ? "bg-primary font-semibold text-primary-foreground"
                    : isToday
                      ? "bg-primary/10 font-semibold text-primary hover:bg-primary/15"
                      : "text-foreground hover:bg-muted",
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
