import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";
import type { ScanOutcome } from "@/data/volunteer/scanner";
import { UserAvatar } from "@/components/common/UserAvatar";
import { cn } from "@/utils/cn";

const KIND_CONFIG = {
  allowed: {
    icon: CheckCircle2,
    title: "Entry Allowed",
    message: "Ticket verified. Let them in!",
    badge: "bg-success/15 text-success",
    badgeLabel: "Approved",
    iconTint: "bg-success/15 text-success",
    ring: "bg-success/10",
    border: "border-success/40",
    bar: "bg-success",
    soundLabel: "Chime played",
  },
  invalid: {
    icon: XCircle,
    title: "Invalid Ticket",
    message: "This ticket could not be verified.",
    badge: "bg-danger/15 text-danger",
    badgeLabel: "Denied",
    iconTint: "bg-danger/15 text-danger",
    ring: "bg-danger/10",
    border: "border-danger/40",
    bar: "bg-danger",
    soundLabel: "Alert played",
  },
  duplicate: {
    icon: AlertTriangle,
    title: "Already Checked In",
    message: "This ticket was used earlier today.",
    badge: "bg-warning/15 text-warning",
    badgeLabel: "Duplicate",
    iconTint: "bg-warning/15 text-warning",
    ring: "bg-warning/10",
    border: "border-warning/40",
    bar: "bg-warning",
    soundLabel: "Warning played",
  },
} as const;

const ENTRY_LABEL: Record<ScanOutcome["kind"], string> = {
  allowed: "Entry Time",
  invalid: "Attempted At",
  duplicate: "Scanned At",
};

function SuccessIcon() {
  return (
    <motion.div
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 16 }}
      className="relative"
    >
      <motion.span
        initial={{ scale: 0.6, opacity: 0.6 }}
        animate={{ scale: 2.1, opacity: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="absolute inset-0 rounded-full bg-success/20"
      />
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-success text-white shadow-lg shadow-success/40">
        <CheckCircle2 className="h-10 w-10" />
      </span>
    </motion.div>
  );
}

function ErrorIcon() {
  return (
    <motion.div
      initial={{ x: 0 }}
      animate={{ x: [0, -10, 10, -7, 7, -3, 3, 0] }}
      transition={{ duration: 0.55 }}
      className="flex h-20 w-20 items-center justify-center rounded-full bg-danger text-white shadow-lg shadow-danger/40"
    >
      <XCircle className="h-10 w-10" />
    </motion.div>
  );
}

function DuplicateIcon() {
  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 15 }}
      className="flex h-20 w-20 items-center justify-center rounded-full bg-warning text-white shadow-lg shadow-warning/40"
    >
      <Clock3 className="h-10 w-10" />
    </motion.div>
  );
}

export function ScanResultPanel({
  outcome,
  onReturn,
}: {
  outcome: ScanOutcome;
  onReturn: () => void;
}) {
  const config = KIND_CONFIG[outcome.kind];
  const Icon = config.icon;
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    setCountdown(3);
    const interval = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          onReturn();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcome.ticketId]);

  return (
    <motion.div
      key={outcome.ticketId}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 bg-card p-5 shadow-card",
        config.border,
      )}
      role="status"
      aria-live="assertive"
    >
      <div className="flex flex-col items-center text-center">
        {outcome.kind === "allowed" && <SuccessIcon />}
        {outcome.kind === "invalid" && <ErrorIcon />}
        {outcome.kind === "duplicate" && <DuplicateIcon />}

        <span
          className={cn(
            "mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
            config.badge,
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {config.badgeLabel}
        </span>
        <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
          {config.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{config.message}</p>

        {outcome.kind !== "invalid" && (
          <div className="mt-5 flex w-full flex-col items-center gap-3 rounded-xl border border-border bg-background p-4 sm:flex-row sm:text-left">
            <UserAvatar
              name={outcome.studentName}
              color={outcome.avatarColor}
              size="lg"
              className="h-16 w-16 shrink-0 text-xl"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold text-foreground">
                {outcome.studentName}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {outcome.college}
              </p>
              <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                {outcome.ticketId}
              </p>
            </div>
          </div>
        )}

        {outcome.kind === "invalid" && (
          <p className="mt-5 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm font-medium text-danger">
            {outcome.reason}
          </p>
        )}

        <div className="mt-4 grid w-full grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-muted/60 px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {ENTRY_LABEL[outcome.kind]}
            </p>
            <p className="mt-0.5 font-bold text-foreground">
              {outcome.kind === "duplicate"
                ? outcome.previousEntryTime
                : outcome.entryTime}
            </p>
          </div>
          <div className="rounded-xl bg-muted/60 px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Gate
            </p>
            <p className="mt-0.5 font-bold text-foreground">{outcome.gate}</p>
          </div>
        </div>

        <div className="mt-5 w-full">
          <button
            type="button"
            onClick={onReturn}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-foreground px-6 text-sm font-semibold text-background transition-transform duration-150 active:scale-[0.98]"
          >
            Scan Next
            <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-2.5 text-xs text-muted-foreground">
            Auto-returning to scanner in{" "}
            <span className="font-bold text-foreground">{countdown}</span>s
          </p>
        </div>
      </div>

      <span className={cn("absolute bottom-0 left-0 h-1 w-full", config.bar)}>
        <motion.span
          key={outcome.ticketId}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 3.2, ease: "linear" }}
          className="absolute inset-0 h-full bg-white/40"
        />
      </span>
    </motion.div>
  );
}
