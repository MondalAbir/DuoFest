import { motion } from "framer-motion";
import { BatteryMedium, ScanLine } from "lucide-react";
import { cn } from "@/utils/cn";

export function ScannerCamera({
  scanning,
  flash,
  className,
}: {
  scanning: boolean;
  flash: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative isolate flex h-full w-full items-center justify-center overflow-hidden rounded-3xl bg-[radial-gradient(120%_120%_at_50%_20%,#1e293b_0%,#0b1220_55%,#070b14_100%)]",
        className,
      )}
      role="img"
      aria-label="Camera preview"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,transparent_40%,rgba(0,0,0,0.55)_100%)]" />

      <motion.div
        animate={{ opacity: flash ? 0.85 : 0 }}
        transition={{ duration: 0.15 }}
        className="pointer-events-none absolute inset-0 bg-white"
      />

      <div className="relative flex h-[min(72%,340px)] w-[min(72%,340px)] flex-col items-center justify-center">
        <span className="absolute left-0 top-0 h-12 w-12 animate-[scan-corners-pulse_2.2s_ease-in-out_infinite] rounded-tl-3xl border-l-4 border-t-4 border-primary" />
        <span className="absolute right-0 top-0 h-12 w-12 animate-[scan-corners-pulse_2.2s_ease-in-out_infinite_0.3s] rounded-tr-3xl border-r-4 border-t-4 border-primary" />
        <span className="absolute bottom-0 left-0 h-12 w-12 animate-[scan-corners-pulse_2.2s_ease-in-out_infinite_0.6s] rounded-bl-3xl border-b-4 border-l-4 border-primary" />
        <span className="absolute bottom-0 right-0 h-12 w-12 animate-[scan-corners-pulse_2.2s_ease-in-out_infinite_0.9s] rounded-br-3xl border-b-4 border-r-4 border-primary" />

        {scanning && (
          <motion.span
            className="absolute inset-x-6 h-1 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_18px_2px_rgba(91,92,235,0.8)]"
            initial={{ top: "6%" }}
            animate={{ top: ["6%", "92%", "6%"] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {!scanning && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-2 text-center"
          >
            <ScanLine className="h-10 w-10 text-primary" />
            <p className="text-sm font-medium text-white">Processing…</p>
          </motion.span>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-between px-4 text-[11px] font-medium text-white/60">
        <span className="inline-flex items-center gap-1.5">
          <BatteryMedium className="h-3.5 w-3.5" />
          Battery-friendly preview
        </span>
        <span>HD · Auto</span>
      </div>
    </div>
  );
}
