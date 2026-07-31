import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleDot } from "lucide-react";
import {
  SIMULATED_SCAN_ORDER,
  VOLUNTEER_GATE,
  lookupTicket,
  type ScanOutcome,
} from "@/data/volunteer/scanner";
import { VOLUNTEER_EVENT } from "@/data/volunteer/dashboard";
import { entryStats, volunteerEntries } from "@/data/volunteer/entries";
import { ScannerCamera } from "@/components/volunteer/ScannerCamera";
import { ScanResultPanel } from "@/components/volunteer/ScanResultPanel";
import { ScanToolbar } from "@/components/volunteer/ScanToolbar";
import { ManualTicketDialog } from "@/components/volunteer/ManualTicketDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UserAvatar } from "@/components/common/UserAvatar";
import { playScanSound } from "@/utils/scan-sound";

function ScannerHeader() {
  return (
    <div className="flex items-center justify-between gap-3 lg:hidden">
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {VOLUNTEER_EVENT.name}
        </p>
        <h1 className="truncate text-xl font-bold tracking-tight text-foreground">
          {VOLUNTEER_GATE}
        </h1>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
        <CircleDot className="h-3.5 w-3.5 animate-pulse" />
        Live
      </span>
    </div>
  );
}

const MINI_STATS = [
  { label: "Students Entered", value: VOLUNTEER_EVENT.entered, tint: "text-success" },
  { label: "Successful", value: entryStats.successful, tint: "text-info" },
  { label: "Rejected", value: entryStats.rejected, tint: "text-danger" },
  { label: "Duplicate", value: entryStats.duplicate, tint: "text-warning" },
];

function ScanSidePanel({
  outcome,
  onReturn,
}: {
  outcome: ScanOutcome | null;
  onReturn: () => void;
}) {
  return (
    <div className="hidden min-h-0 flex-1 flex-col gap-4 lg:flex">
      <AnimatePresence mode="wait">
        {outcome ? (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1"
          >
            <ScanResultPanel outcome={outcome} onReturn={onReturn} />
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-4"
          >
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-success" />
                </span>
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  Live Result Card
                </h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Point the camera at a student QR code to check them in.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                Today's Summary
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {MINI_STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl bg-muted/50 px-3.5 py-3"
                  >
                    <p className="truncate text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                    <p
                      className={`mt-1 text-2xl font-bold tracking-tight ${stat.tint}`}
                    >
                      {stat.value.toLocaleString("en-US")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                Last Five Entries
              </h3>
              <ul className="mt-2 divide-y divide-border">
                {volunteerEntries.slice(0, 5).map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center gap-3 py-2.5"
                  >
                    <UserAvatar
                      name={entry.studentName}
                      color={entry.avatarColor}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {entry.studentName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {entry.college}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-0.5">
                      <StatusBadge status={entry.status} dot />
                      <span className="text-[11px] text-muted-foreground">
                        {entry.entryTime}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function VolunteerScanPage() {
  const [status, setStatus] = useState<"scanning" | "result">("scanning");
  const [outcome, setOutcome] = useState<ScanOutcome | null>(null);
  const [flash, setFlash] = useState(false);
  const [camera, setCamera] = useState<"rear" | "front">("rear");
  const [manualOpen, setManualOpen] = useState(false);
  const cycleRef = useRef(0);

  const presentOutcome = useCallback((next: ScanOutcome) => {
    setOutcome(next);
    playScanSound(next.kind);
    setStatus("result");
  }, []);

  const returnToScan = useCallback(() => {
    setStatus("scanning");
    setOutcome(null);
  }, []);

  useEffect(() => {
    if (status !== "scanning") return;
    const first = cycleRef.current === 0;
    const delay = first ? 2400 : 3200;
    const timer = window.setTimeout(() => {
      const ticketId =
        SIMULATED_SCAN_ORDER[cycleRef.current % SIMULATED_SCAN_ORDER.length];
      cycleRef.current += 1;
      presentOutcome(lookupTicket(ticketId));
    }, delay);
    return () => window.clearTimeout(timer);
  }, [status, presentOutcome]);

  const handleManualSubmit = (ticketId: string) => {
    presentOutcome(lookupTicket(ticketId));
  };

  return (
    <div className="fixed inset-x-0 top-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 flex flex-col overflow-hidden bg-background pt-safe lg:static lg:z-auto lg:h-auto lg:overflow-visible lg:bg-transparent lg:pt-0">
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:p-4 landscape:flex-row landscape:gap-4 lg:h-auto lg:flex-row lg:gap-6 lg:p-0">
        <div className="relative flex min-h-0 flex-1 flex-col gap-3 landscape:min-w-0">
          <ScannerHeader />

          <div className="relative min-h-[45vh] flex-1 lg:min-h-[560px] landscape:min-h-0">
            <ScannerCamera
              scanning={status === "scanning"}
              flash={flash}
              className="absolute inset-0"
            />
          </div>

          <div className="hidden lg:block">
            <ScanToolbar
              flash={flash}
              camera={camera}
              onToggleFlash={() => setFlash((value) => !value)}
              onSwitchCamera={() =>
                setCamera((value) => (value === "rear" ? "front" : "rear"))
              }
              onManual={() => setManualOpen(true)}
            />
          </div>
        </div>

        <ScanSidePanel outcome={outcome} onReturn={returnToScan} />
      </div>

      <div className="shrink-0 p-3 sm:p-4 lg:hidden">
        <ScanToolbar
          flash={flash}
          camera={camera}
          onToggleFlash={() => setFlash((value) => !value)}
          onSwitchCamera={() =>
            setCamera((value) => (value === "rear" ? "front" : "rear"))
          }
          onManual={() => setManualOpen(true)}
        />
      </div>

      <AnimatePresence>
        {status === "result" && outcome && (
          <motion.div
            key="mobile-result"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="absolute inset-x-0 bottom-0 z-20 max-h-[92%] overflow-y-auto overscroll-none rounded-t-3xl border-t-2 border-border bg-background/95 p-3 backdrop-blur-xl sm:p-4 lg:hidden"
          >
            <ScanResultPanel outcome={outcome} onReturn={returnToScan} />
          </motion.div>
        )}
      </AnimatePresence>

      <ManualTicketDialog
        open={manualOpen}
        onOpenChange={setManualOpen}
        onSubmit={handleManualSubmit}
      />
    </div>
  );
}
