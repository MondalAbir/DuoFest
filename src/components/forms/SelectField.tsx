import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { cn } from "@/utils/cn";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/forms/FormField";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  optional?: boolean;
  hint?: string;
  className?: string;
}

export function SelectField<T extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder = "Select…",
  optional = false,
  hint,
  className,
}: SelectFieldProps<T>) {
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
          <Select
            value={field.value || undefined}
            onValueChange={field.onChange}
            disabled={field.disabled}
          >
            <SelectTrigger
              id={name}
              aria-invalid={!!fieldState.error}
              className={cn(
                "h-10 rounded-xl",
                !field.value && "text-muted-foreground",
                fieldState.error && "border-destructive/60",
              )}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      )}
    />
  );
}
