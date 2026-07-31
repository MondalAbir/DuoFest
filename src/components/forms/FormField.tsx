import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  optional?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}

export function FormField({
  label,
  htmlFor,
  optional = false,
  error,
  hint,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label
          htmlFor={htmlFor}
          className={cn(error && "text-destructive")}
        >
          {label}
        </Label>
        {optional && (
          <span className="text-xs text-muted-foreground">Optional</span>
        )}
      </div>
      {children}
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
