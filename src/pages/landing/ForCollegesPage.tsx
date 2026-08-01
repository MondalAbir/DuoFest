import { Link } from "react-router";
import {
  ArrowRight,
  Check,
  Gauge,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { StatCounter } from "@/components/landing/StatCounter";
import { TestimonialCard } from "@/components/landing/TestimonialCard";
import { pricingPlans } from "@/data/landing/pricing";
import { testimonials } from "@/data/landing/testimonials";
import { cn } from "@/utils/cn";

const SELLING_POINTS = [
  {
    icon: Zap,
    title: "Go live in a day",
    description:
      "Create your college profile, add admins and publish your first event — no technical team needed.",
  },
  {
    icon: Gauge,
    title: "Real-time control room",
    description:
      "See registrations, revenue and footfall as they happen, with instant reports for your faculty.",
  },
  {
    icon: Users,
    title: "Volunteer-ready",
    description:
      "Assign volunteers to gates, scan tickets in seconds and keep queues moving with live counts.",
  },
  {
    icon: Wallet,
    title: "Zero hidden fees",
    description:
      "Flat plans, transparent pricing and automatic refunds. Students pay only their ticket price.",
  },
  {
    icon: PartyPopper,
    title: "Built for big days",
    description:
      "Scales to 5,000+ concurrent check-ins during opening night without breaking a sweat.",
  },
  {
    icon: ShieldCheck,
    title: "Safe for students",
    description:
      "Encrypted data, PCI-DSS payments and strict privacy — their info is never sold.",
  },
];

export function ForCollegesPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-muted/40">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(50rem 26rem at 75% -10%, color-mix(in srgb, var(--color-primary) 12%, transparent), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              For colleges & fest committees
            </span>
            <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Your best fest,
              <br />
              <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
                without the chaos
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              DuoFest replaces your spreadsheets, payment links and volunteer
              signup sheets with one beautiful platform. Join 320+ colleges and
              run a fest your committee is proud of.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" asChild>
                <Link to="/contact">
                  Start free today <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/about">See how it works</Link>
              </Button>
            </div>
            <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                { value: 320, suffix: "+", label: "Colleges" },
                { value: 1286, suffix: "+", label: "Events hosted" },
                { value: 2.4, decimals: 1, suffix: "L+", label: "Registrations" },
                { value: 4.9, decimals: 1, label: "Avg. rating" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    <StatCounter
                      value={stat.value}
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
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Why organisers choose us"
            title="Everything your committee has been doing by hand"
            description="We've automated the tedious parts of fest management so your team can focus on programming, sponsors and the show."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SELLING_POINTS.map((point) => (
              <div
                key={point.title}
                className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-card-hover"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <point.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-base font-semibold text-foreground">
                  {point.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Pricing"
            title="Simple plans. No surprises."
            description="Start free and upgrade when your fest grows. Every plan includes QR ticketing and student registration."
          />
          <div className="mx-auto mt-14 grid max-w-5xl gap-6 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "relative flex flex-col rounded-3xl border bg-card p-7 shadow-card transition-all duration-300",
                  plan.popular
                    ? "border-primary/40 shadow-card-hover lg:-translate-y-2"
                    : "border-border",
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3.5 py-1 text-xs font-bold text-primary-foreground shadow-md shadow-primary/30">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
                <p className="mt-5 flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight text-foreground">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground">
                      {plan.period}
                    </span>
                  )}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <span
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                          plan.popular
                            ? "bg-primary/10 text-primary"
                            : "bg-success/10 text-success",
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </span>
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-8 w-full"
                  variant={plan.popular ? "default" : "outline"}
                  asChild
                >
                  <Link to="/contact">{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Wall of love"
            title="What organisers say"
            description="Convenors and committees who run their fests on DuoFest."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.slice(0, 3).map((testimonial) => (
              <TestimonialCard key={testimonial.name} testimonial={testimonial} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button size="lg" asChild>
              <Link to="/contact">
                Get your college onboard <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
