import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/cn";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/FormField";

interface TextareaFieldProps<T extends FieldValues>
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name"> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  optional?: boolean;
  hint?: string;
  maxLength?: number;
}

export function TextareaField<T extends FieldValues>({
  name,
  control,
  label,
  optional = false,
  hint,
  placeholder,
  maxLength,
  className,
  ...props
}: TextareaFieldProps<T>) {
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
          <Textarea
            id={name}
            placeholder={placeholder}
            maxLength={maxLength}
            aria-invalid={!!fieldState.error}
            className={cn(
              "resize-none",
              fieldState.error && "border-destructive/60",
            )}
            {...field}
            {...props}
          />
        </FormField>
      )}
    />
  );
}
