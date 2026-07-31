import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, RefreshCw, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";

interface LogoUploaderProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  name?: string;
  id?: string;
  title?: string;
  hint?: string;
  fallback?: { label: string; color: string } | null;
  className?: string;
}

const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const MAX_SIZE = 2 * 1024 * 1024;

export function LogoUploader({
  value,
  onChange,
  error,
  name,
  id,
  title = "Drag & drop your college logo",
  hint = "PNG, JPG, WebP or SVG up to 2 MB.",
  fallback,
  className,
}: LogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!ACCEPTED.includes(file.type)) return;
      if (file.size > MAX_SIZE) return;
      onChange(file);
    },
    [onChange],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      handleFile(event.dataTransfer.files?.[0]);
    },
    [handleFile],
  );

  return (
    <div className={cn("space-y-1.5", className)}>
      <div
        role="button"
        tabIndex={0}
        aria-label={value ? "Logo preview, click to replace" : "Upload college logo"}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-7 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30 hover:border-primary/40 hover:bg-muted/50",
          error && "border-destructive/60",
        )}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={ACCEPTED.join(",")}
          className="sr-only"
          onChange={(event) => {
            handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />

        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt={name ? `${name} preview` : "College logo preview"}
              className="h-20 w-20 rounded-2xl border border-border object-cover shadow-sm"
            />
            <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors group-hover:text-foreground">
              <RefreshCw className="h-3 w-3" />
            </span>
          </div>
        ) : fallback ? (
          <span
            className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border text-lg font-bold text-white shadow-sm transition-transform group-hover:scale-105"
            style={{ backgroundColor: fallback.color }}
          >
            {fallback.label}
          </span>
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
            <ImagePlus className="h-6 w-6" />
          </span>
        )}

        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground">
            {previewUrl
              ? "Click or drag to replace"
              : fallback
                ? "Click to change logo"
                : title}
          </p>
          <p className="text-xs text-muted-foreground">
            {previewUrl ? value?.name : hint}
          </p>
        </div>

        {value && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={(event) => {
              event.stopPropagation();
              onChange(null);
            }}
          >
            <X className="h-3.5 w-3.5" />
            Remove logo
          </Button>
        )}
      </div>

      {error && (
        <p className="text-xs font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}
