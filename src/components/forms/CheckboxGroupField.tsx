import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";
import { FormField } from "@/components/forms/FormField";

export interface CheckboxOption {
  value: string;
  label: string;
  description?: string;
}

interface CheckboxGroupFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  options: CheckboxOption[];
  className?: string;
}

export function CheckboxGroupField<T extends FieldValues>({
  name,
  control,
  label,
  options,
  className,
}: CheckboxGroupFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormField
          label={label}
          error={fieldState.error?.message}
          className={className}
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {options.map((option) => {
              const checked = field.value.includes(option.value);
              const toggle = () => {
                const next = checked
                  ? field.value.filter((value: string) => value !== option.value)
                  : [...field.value, option.value];
                field.onChange(next);
              };
              return (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card px-3.5 py-3 transition-colors hover:border-primary/40 hover:bg-muted/30",
                    checked && "border-primary/50 bg-primary/5",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-colors",
                      checked
                        ? "border-primary bg-primary"
                        : "border-input bg-card",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={toggle}
                      className="sr-only"
                    />
                    {checked && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </span>
                  <span className="min-w-0 space-y-0.5">
                    <span className="block text-sm font-medium text-foreground">
                      {option.label}
                    </span>
                    {option.description && (
                      <span className="block text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </FormField>
      )}
    />
  );
}
