import { Link, Navigate, useParams } from "react-router";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Presentation,
  Ticket,
  Trophy,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/common/PageLoader";
import { formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";
import { useEventBySlug } from "@/lib/hooks";
import { adaptLandingEvent } from "@/lib/adapters";

export function EventDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useEventBySlug(slug);

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || !data) {
    return <Navigate to="/events" replace />;
  }

  const event = adaptLandingEvent(data);

  const progress = Math.min((event.registered / event.capacity) * 100, 100);
  const spotsLeft = event.capacity - event.registered;

  return (
    <>
      <section
        className={cn("relative overflow-hidden bg-gradient-to-br", event.gradient)}
      >
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(40rem 20rem at 85% 0%, rgb(255 255 255 / 0.16), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            All events
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-foreground">
              {event.category}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              <Presentation className="h-3.5 w-3.5" />
              {event.mode}
            </span>
          </div>
          <h1 className="mt-4 max-w-3xl text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {event.name}
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-lg text-white/85">
            {event.tagline}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-white/90">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {formatDate(event.date)}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {event.startTime} – {event.endTime}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {event.college}, {event.city}
            </span>
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
          <div className="min-w-0 space-y-12">
            <section>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                About this event
              </h2>
              <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
                {event.description}
              </p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {event.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-3.5 text-sm text-foreground shadow-card"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                      <Ticket className="h-3 w-3" />
                    </span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Schedule
              </h2>
              <ol className="mt-6 space-y-0">
                {event.schedule.map((item, index) => (
                  <li key={item.title} className="relative flex gap-4 pb-8 last:pb-0">
                    {index < event.schedule.length - 1 && (
                      <span
                        className="absolute left-[7px] top-5 h-full w-px bg-border"
                        aria-hidden="true"
                      />
                    )}
                    <span className="relative z-10 mt-1 h-[15px] w-[15px] shrink-0 rounded-full border-2 border-primary bg-card" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-primary">
                        {item.time}
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Prizes & rewards
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {event.prizes.map((prize, index) => (
                  <div
                    key={prize.place}
                    className={cn(
                      "rounded-2xl border p-5 shadow-card",
                      index === 0
                        ? "border-warning/40 bg-gradient-to-br from-warning/10 to-transparent"
                        : "border-border bg-card",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Trophy
                          className={cn(
                            "h-4 w-4",
                            index === 0
                              ? "text-warning"
                              : "text-muted-foreground",
                          )}
                        />
                        {prize.place}
                      </span>
                      <span
                        className={cn(
                          "text-sm font-bold",
                          index === 0 ? "text-warning" : "text-foreground",
                        )}
                      >
                        {prize.amount}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {prize.note}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-bold tracking-tight text-foreground">
                  {event.fee === 0 ? (
                    "Free"
                  ) : (
                    <>
                      ₹{event.fee.toLocaleString("en-IN")}
                    </>
                  )}
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  per person
                </p>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {event.registered.toLocaleString("en-IN")} registered
                  </span>
                  <span className="text-primary">
                    {Math.round(progress)}% full
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full bg-gradient-to-r",
                      event.gradient,
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {spotsLeft > 0 && spotsLeft <= 100 ? (
                  <p className="mt-3 text-xs font-semibold text-destructive">
                    Hurry — only {spotsLeft.toLocaleString("en-IN")} spots left!
                  </p>
                ) : (
                  <p className="mt-3 text-xs font-medium text-muted-foreground">
                    Early-bird pricing ends soon
                  </p>
                )}
              </div>

              <Button size="lg" className="mt-6 w-full" asChild>
                <Link to={`/register/${event.slug}`}>
                  <Ticket className="h-4 w-4" />
                  {spotsLeft > 0 ? "Register now" : "Join waitlist"}
                </Link>
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Secure payment · Instant QR ticket
              </p>

              <div className="mt-6 border-t border-border pt-5">
                <h3 className="text-sm font-semibold text-foreground">
                  Event details
                </h3>
                <dl className="mt-3 space-y-2.5 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Venue</dt>
                    <dd className="text-right font-medium text-foreground">
                      {event.venue}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Organised by</dt>
                    <dd className="text-right font-medium text-foreground">
                      {event.college}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Team size</dt>
                    <dd className="text-right font-medium text-foreground">
                      {event.team === 1 ? "Individual" : `Up to ${event.team}`}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
