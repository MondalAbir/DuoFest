import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/FormField";

interface TextFieldProps<T extends FieldValues>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "name"> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  optional?: boolean;
  hint?: string;
}

export function TextField<T extends FieldValues>({
  name,
  control,
  label,
  optional = false,
  hint,
  placeholder,
  type = "text",
  className,
  ...props
}: TextFieldProps<T>) {
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
          <Input
            id={name}
            type={type}
            placeholder={placeholder}
            aria-invalid={!!fieldState.error}
            className={cn(fieldState.error && "border-destructive/60")}
            {...field}
            {...props}
          />
        </FormField>
      )}
    />
  );
}
