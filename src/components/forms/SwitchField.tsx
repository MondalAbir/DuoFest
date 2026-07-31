import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { cn } from "@/utils/cn";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SwitchFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  description?: string;
  className?: string;
}

export function SwitchField<T extends FieldValues>({
  name,
  control,
  label,
  description,
  className,
}: SwitchFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div
          className={cn(
            "flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/30 px-4 py-3.5",
            className,
          )}
        >
          <div className="min-w-0 space-y-0.5">
            <Label htmlFor={name}>{label}</Label>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <Switch
            id={name}
            checked={field.value}
            onCheckedChange={field.onChange}
            disabled={field.disabled}
          />
        </div>
      )}
    />
  );
}
