import { useEffect, useMemo, useRef, useState } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/utils/cn";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/FormField";
import type { SelectOption } from "@/components/forms/SelectField";

interface SearchableSelectFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  optional?: boolean;
  hint?: string;
  className?: string;
}

export function SearchableSelectField<T extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder = "Search and select…",
  searchPlaceholder = "Search…",
  emptyText = "No options found",
  optional = false,
  hint,
  className,
}: SearchableSelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(q),
    );
  }, [options, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormField
          label={label}
          htmlFor={name}
          optional={optional}
          hint={hint}
          error={fieldState.error?.message}
          className={className}
        >
          <div ref={rootRef} className="relative">
            <button
              type="button"
              id={name}
              onClick={() => {
                setQuery("");
                setOpen((value) => !value);
              }}
              aria-haspopup="listbox"
              aria-expanded={open}
              className={cn(
                "flex h-10 w-full items-center justify-between gap-2 whitespace-nowrap rounded-xl border border-input bg-card px-3.5 py-2 text-sm shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-ring",
                fieldState.error && "border-destructive/60",
              )}
            >
              <span
                className={cn(
                  "truncate text-left",
                  !field.value && "text-muted-foreground",
                )}
              >
                {field.value
                  ? (options.find((o) => o.value === field.value)?.label ??
                    field.value)
                  : placeholder}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                  open && "rotate-180",
                )}
              />
            </button>

            {open && (
              <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-popover">
                <div className="border-b border-border p-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      autoFocus
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "ArrowDown") {
                          event.preventDefault();
                          setActiveIndex((index) =>
                            Math.min(index + 1, filtered.length - 1),
                          );
                        } else if (event.key === "ArrowUp") {
                          event.preventDefault();
                          setActiveIndex((index) => Math.max(index - 1, 0));
                        } else if (event.key === "Enter") {
                          event.preventDefault();
                          const option = filtered[activeIndex];
                          if (option) {
                            field.onChange(option.value);
                            setOpen(false);
                            setQuery("");
                          }
                        } else if (event.key === "Escape") {
                          setOpen(false);
                        }
                      }}
                      placeholder={searchPlaceholder}
                      className="h-9 pl-8"
                    />
                  </div>
                </div>

                <ul role="listbox" className="scrollbar-thin max-h-56 overflow-y-auto p-1">
                  {filtered.length === 0 ? (
                    <li className="px-3 py-2.5 text-sm text-muted-foreground">
                      {emptyText}
                    </li>
                  ) : (
                    filtered.map((option, index) => (
                      <li
                        key={option.value}
                        role="option"
                        aria-selected={field.value === option.value}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => {
                          field.onChange(option.value);
                          setOpen(false);
                          setQuery("");
                        }}
                        className={cn(
                          "flex cursor-default select-none items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors",
                          activeIndex === index && "bg-muted",
                          field.value === option.value && "font-medium",
                        )}
                      >
                        <span className="truncate">{option.label}</span>
                        {field.value === option.value && (
                          <Check className="h-4 w-4 shrink-0 text-primary" />
                        )}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        </FormField>
      )}
    />
  );
}
