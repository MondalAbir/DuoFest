import { Keyboard, Repeat2, Zap, ZapOff } from "lucide-react";
import { cn } from "@/utils/cn";

export function ScanToolbar({
  flash,
  camera,
  onToggleFlash,
  onSwitchCamera,
  onManual,
}: {
  flash: boolean;
  camera: "rear" | "front";
  onToggleFlash: () => void;
  onSwitchCamera: () => void;
  onManual: () => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <button
        type="button"
        onClick={onToggleFlash}
        aria-pressed={flash}
        aria-label="Toggle flash"
        className={cn(
          "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl border bg-card px-3 py-2.5 text-[11px] font-medium shadow-sm transition-all duration-200 active:scale-95",
          flash
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border text-muted-foreground hover:bg-muted",
        )}
      >
        {flash ? <Zap className="h-5 w-5" /> : <ZapOff className="h-5 w-5" />}
        {flash ? "On" : "Flash"}
      </button>
      <button
        type="button"
        onClick={onSwitchCamera}
        aria-label="Switch camera"
        className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card px-3 py-2.5 text-[11px] font-medium text-muted-foreground shadow-sm transition-all duration-200 hover:bg-muted active:scale-95"
      >
        <Repeat2 className="h-5 w-5" />
        {camera === "rear" ? "Rear" : "Front"}
      </button>
      <button
        type="button"
        onClick={onManual}
        aria-label="Enter ticket ID manually"
        className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card px-3 py-2.5 text-[11px] font-medium text-muted-foreground shadow-sm transition-all duration-200 hover:bg-muted active:scale-95"
      >
        <Keyboard className="h-5 w-5" />
        Manual ID
      </button>
    </div>
  );
}
