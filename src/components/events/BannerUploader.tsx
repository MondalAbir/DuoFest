import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, RefreshCw, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";

interface BannerUploaderProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  name?: string;
  id?: string;
  title?: string;
  hint?: string;
  className?: string;
}

const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export function BannerUploader({
  value,
  onChange,
  error,
  name,
  id,
  title = "Drag & drop your event banner",
  hint = "PNG, JPG or WebP up to 5 MB. Recommended 1600 × 600.",
  className,
}: BannerUploaderProps) {
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
        aria-label={value ? "Banner preview, click to replace" : "Upload event banner"}
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
          "group flex aspect-[16/6] w-full cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed px-6 py-7 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
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
          <div className="relative h-full w-full">
            <img
              src={previewUrl}
              alt={name ? `${name} banner preview` : "Event banner preview"}
              className="h-full w-full object-cover"
            />
            <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/90 text-muted-foreground shadow-sm backdrop-blur transition-colors group-hover:text-foreground">
              <RefreshCw className="h-4 w-4" />
            </span>
          </div>
        ) : (
          <>
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
              <ImagePlus className="h-6 w-6" />
            </span>
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground">{hint}</p>
            </div>
          </>
        )}
      </div>

      {value && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => onChange(null)}
          >
            <X className="h-3.5 w-3.5" />
            Remove banner
          </Button>
        </div>
      )}

      {error && (
        <p className="text-xs font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}
