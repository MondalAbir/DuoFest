import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Check,
  Download,
  Home,
  MapPin,
  QrCode,
  Ticket,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLandingEvent } from "@/data/landing/events";
import { formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";

function MockQr() {
  const cells = 21;
  const seed = 42;
  const random = (index: number) =>
    (Math.sin(index * 999 + seed) * 10000) % 1 > 0.48;

  return (
    <div
      role="img"
      aria-label="QR code"
      className="grid gap-px rounded-lg bg-foreground p-2"
      style={{
        gridTemplateColumns: `repeat(${cells}, 1fr)`,
        width: "100%",
        aspectRatio: "1",
      }}
    >
      {Array.from({ length: cells * cells }, (_, index) => {
        const row = Math.floor(index / cells);
        const col = index % cells;
        const isFinder =
          (row < 7 && col < 7) ||
          (row < 7 && col >= cells - 7) ||
          (row >= cells - 7 && col < 7);
        const inFinder =
          isFinder &&
          (row === 0 || row === 6 || col === 0 || col === 6 || row === 3 || col === 3);
        const filled =
          isFinder ? inFinder : random(index);
        return (
          <span
            key={index}
            className={filled ? "bg-card" : "bg-transparent"}
            style={{ aspectRatio: "1" }}
          />
        );
      })}
    </div>
  );
}

export function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const slug = searchParams.get("event") ?? "";
  const name = searchParams.get("name") ?? "";
  const email = searchParams.get("email") ?? "";
  const ticket = searchParams.get("ticket") ?? "DF-XXXXX";
  const event = slug ? getLandingEvent(slug) : undefined;
  const [downloaded, setDownloaded] = useState(false);

  if (!event) {
    return <Navigate to="/events" replace />;
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-14">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(48rem 26rem at 50% -10%, color-mix(in srgb, var(--color-success) 12%, transparent), transparent 60%)",
        }}
      />
      <div className="relative w-full max-w-md">
        <div className="text-center">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success text-success-foreground shadow-lg shadow-success/30"
          >
            <Check className="h-10 w-10" strokeWidth={3} />
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-6 text-3xl font-bold tracking-tight text-foreground"
          >
            You're in, {name.split(" ")[0] || "friend"}!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-2 text-sm text-muted-foreground"
          >
            Your ticket for {event.name} is confirmed. A copy was sent to{" "}
            <span className="font-medium text-foreground">{email || "your email"}</span>.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mt-8 overflow-hidden rounded-3xl border border-border bg-card shadow-glass"
        >
          <div className={cn("bg-gradient-to-br px-6 py-5", event.gradient)}>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-white">
                <QrCode className="h-5 w-5" />
                <span className="text-sm font-bold">DuoFest Ticket</span>
              </span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                Entry pass
              </span>
            </div>
            <h2 className="mt-3 text-xl font-bold text-white">{event.name}</h2>
            <p className="mt-0.5 text-sm text-white/80">{event.tagline}</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-[1fr_110px] gap-6">
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Attendee
                  </p>
                  <p className="mt-0.5 font-semibold text-foreground">
                    {name || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Ticket ID
                  </p>
                  <p className="mt-0.5 font-semibold tabular-nums text-foreground">
                    {ticket}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Date & time
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 font-semibold text-foreground">
                    <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatDate(event.date)} · {event.startTime}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Venue
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 font-semibold text-foreground">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {event.venue}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/40 p-2.5">
                <MockQr />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-xl bg-warning/10 px-4 py-3 text-xs font-medium text-warning">
              <Timer className="h-4 w-4 shrink-0" />
              Please reach the venue 30 minutes early for smooth check-in.
            </div>
          </div>
        </motion.div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => setDownloaded(true)}
            disabled={downloaded}
          >
            {downloaded ? (
              <>
                <Check className="h-4 w-4" /> Saved
              </>
            ) : (
              <>
                <Download className="h-4 w-4" /> Save ticket
              </>
            )}
          </Button>
          <Button onClick={() => navigate("/")}>
            <Home className="h-4 w-4" /> Done
          </Button>
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <Ticket className="h-3.5 w-3.5" />
          Need help? Contact the organisers via the event page.
        </p>
        <div className="mt-2 text-center">
          <Link
            to="/events"
            className="text-xs font-medium text-primary hover:text-primary/80"
          >
            Register for more events
          </Link>
        </div>
      </div>
    </div>
  );
}
