import { useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Megaphone,
  QrCode,
  Sparkles,
  Ticket,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { StatCounter } from "@/components/landing/StatCounter";
import { EventCard } from "@/components/landing/EventCard";
import { CollegeMarquee } from "@/components/landing/CollegeMarquee";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { TestimonialCard } from "@/components/landing/TestimonialCard";
import { landingEvents, eventCategories } from "@/data/landing/events";
import { heroStats } from "@/data/landing/statistics";
import { testimonials } from "@/data/landing/testimonials";
import { cn } from "@/utils/cn";

const HOW_IT_WORKS = [
  {
    icon: CalendarDays,
    step: "01",
    title: "Create your fest",
    description:
      "Set up your college profile and publish events in minutes — categories, pricing, capacity, schedule and team, all in one place.",
  },
  {
    icon: Megaphone,
    step: "02",
    title: "Publish & promote",
    description:
      "Share a beautiful event page and QR-ready links. DuoFest promotes your fest to thousands of students across nearby colleges.",
  },
  {
    icon: Wallet,
    step: "03",
    title: "Students register & pay",
    description:
      "Attendees register in under a minute with secure UPI, card or net banking. Tickets land instantly in their wallet as QR codes.",
  },
  {
    icon: QrCode,
    step: "04",
    title: "Scan & track live",
    description:
      "Volunteers scan tickets at the gate in under two seconds. Registrations, revenue and footfall update live on your dashboard.",
  },
];

export function HomePage() {
  const [category, setCategory] = useState("All");
  const visibleEvents = landingEvents
    .filter((event) => category === "All" || event.category === category)
    .slice(0, 6);

  return (
    <>
      <HeroSection />
      <TrustedSection />
      <FeaturesSection />
      <HowItWorksSection />
      <FeaturedEventsSection
        category={category}
        onCategoryChange={setCategory}
        events={visibleEvents}
      />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(60rem 32rem at 70% 0%, color-mix(in srgb, var(--color-primary) 10%, transparent), transparent 60%), radial-gradient(45rem 28rem at 15% 10%, color-mix(in srgb, var(--color-info) 8%, transparent), transparent 60%)",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:pb-28 lg:pt-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Powering 320+ college fests
          </span>
          <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Run the fest
            <br />
            everyone{" "}
            <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
              remembers
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            DuoFest is the all-in-one platform for college events — lightning-fast
            registration, instant QR ticketing, and real-time check-in that turns
            festival chaos into a well-oiled machine.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" asChild>
              <Link to="/events">
                Explore events <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/for-colleges">For college organisers</Link>
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  <StatCounter
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                  />
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative"
      >
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-glass">
          <div className="flex items-center gap-1.5 border-b border-border bg-muted/60 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-rose-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
            <span className="ml-3 flex-1 truncate rounded-md bg-card px-3 py-1 text-xs text-muted-foreground">
              duofest.app/events/technova-hackathon
            </span>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                  Upcoming
                </p>
                <h3 className="mt-1 text-xl font-bold text-white">
                  TechNova Hackathon
                </h3>
                <p className="mt-1 text-sm text-white/80">
                  IIT Bombay · 14 Aug 2026
                </p>
              </div>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                1,840 registered
              </span>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/25">
              <div className="h-full w-[92%] rounded-full bg-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-border">
            <div className="bg-card p-5">
              <p className="text-xs font-medium text-muted-foreground">
                Registrations
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">1,840</p>
              <p className="mt-0.5 text-xs font-medium text-success">
                ↑ 32% this week
              </p>
            </div>
            <div className="bg-card p-5">
              <p className="text-xs font-medium text-muted-foreground">
                Tickets scanned
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">1,286</p>
              <p className="mt-0.5 text-xs font-medium text-info">
                Live at gate 1
              </p>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="absolute -left-4 -bottom-6 hidden items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-glass sm:flex"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10 text-success">
            <QrCode className="h-6 w-6" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">
              Check-in complete
            </p>
            <p className="text-xs text-muted-foreground">2.1s · Gate B</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="absolute -top-5 -right-3 hidden items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-glass sm:flex"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Ticket className="h-6 w-6" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">Ticket issued</p>
            <p className="text-xs text-muted-foreground">DF-TN-10452</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function TrustedSection() {
  return (
    <section className="border-y border-border bg-muted/40 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Trusted by India's leading college fests
        </p>
        <div className="mt-8">
          <CollegeMarquee />
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why DuoFest"
          title="Everything a festival needs, in one place"
          description="Stop juggling spreadsheets, payment links and volunteer groups. DuoFest brings ticketing, check-in and analytics together so you can focus on the show."
        />
        <div className="mt-14">
          <FeatureGrid />
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-muted/40 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="From announcement to attendance in four steps"
          description="No technical setup, no lengthy onboarding. Most colleges go live the same day they sign up."
        />
        <div className="relative mt-16 grid gap-8 lg:grid-cols-4">
          <div
            className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
            aria-hidden="true"
          />
          {HOW_IT_WORKS.map((step) => (
            <div key={step.step} className="relative">
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card text-primary shadow-card">
                <step.icon className="h-6 w-6" />
              </div>
              <p className="mt-6 text-xs font-bold uppercase tracking-wider text-primary">
                Step {step.step}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface FeaturedEventsSectionProps {
  category: string;
  onCategoryChange: (category: string) => void;
  events: typeof landingEvents;
}

function FeaturedEventsSection({
  category,
  onCategoryChange,
  events,
}: FeaturedEventsSectionProps) {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Featured events"
          title="Find your next big night"
          description="From 24-hour hackathons to stadium-scale concerts — discover the fests students are talking about."
        />
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {eventCategories.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onCategoryChange(item.value)}
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
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" asChild>
            <Link to="/events">
              View all events <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="bg-muted/40 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Loved by organisers"
          title="Fests run on DuoFest. So do their fan clubs."
          description="Convenors, cultural secretaries and students across the country run their shows on DuoFest."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-info px-6 py-16 text-center shadow-glass sm:px-16">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(28rem 16rem at 20% 0%, rgb(255 255 255 / 0.18), transparent 60%), radial-gradient(24rem 14rem at 90% 100%, rgb(255 255 255 / 0.12), transparent 60%)",
            }}
          />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to run your best fest yet?
            </h2>
            <p className="mt-4 text-pretty text-base leading-relaxed text-white/80">
              Join 320+ colleges hosting on DuoFest. Get your first event live
              today — no credit card, no setup fees.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-lg"
                asChild
              >
                <Link to="/events">
                  Explore events <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                asChild
              >
                <Link to="/for-colleges">For colleges</Link>
              </Button>
            </div>
            <p className="mt-6 flex items-center justify-center gap-1.5 text-xs font-medium text-white/70">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Free plan forever · No card required
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
