import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, CalendarX2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/landing/EventCard";
import { StatCounter } from "@/components/landing/StatCounter";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { landingEvents, eventCategories } from "@/data/landing/events";
import { eventPageStats } from "@/data/landing/statistics";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/utils/cn";

export function EventsPage() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return landingEvents
      .filter((event) => category === "All" || event.category === category)
      .filter(
        (event) =>
          q === "" ||
          event.name.toLowerCase().includes(q) ||
          event.college.toLowerCase().includes(q) ||
          event.city.toLowerCase().includes(q) ||
          event.category.toLowerCase().includes(q),
      )
      .sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [category, debouncedQuery]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-muted/40">
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Event catalogue"
            title="Every fest. One place."
            description="Browse fests across India by category, search for your college, and grab your ticket in under a minute."
          />
          <div className="mx-auto mt-8 flex max-w-xl items-center gap-3 rounded-2xl border border-border bg-card px-4 shadow-card focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by event, college or city…"
              aria-label="Search events"
              className="h-12 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {eventCategories.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setCategory(item.value)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                  category === item.value
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "border border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
            {eventPageStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border bg-card p-4 text-center shadow-card"
              >
                <p className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  <StatCounter
                    value={stat.value}
                    decimals={stat.decimals}
                    suffix={stat.suffix}
                  />
                </p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {filtered.length}{" "}
              {filtered.length === 1 ? "event" : "events"}
              {category !== "All" && ` · ${category}`}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-16 flex flex-col items-center text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <CalendarX2 className="h-8 w-8" />
              </span>
              <h3 className="mt-6 text-lg font-semibold text-foreground">
                No events found
              </h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                We couldn't find any fests matching "{debouncedQuery}". Try a
                different search or category.
              </p>
              <Button
                className="mt-6"
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setCategory("All");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-border bg-muted/40 py-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 text-center sm:px-6">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            Don't see your college's fest?
          </h3>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            If your fest isn't listed yet, tell your organisers about DuoFest —
            they can publish it live in under a day.
          </p>
          <Button asChild>
            <Link to="/for-colleges">
              Bring your fest to DuoFest <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
