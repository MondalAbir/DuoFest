import { Link } from "react-router";
import { ArrowRight, Heart, Rocket, Shield, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { UserAvatar } from "@/components/common/UserAvatar";

const MILESTONES = [
  {
    year: "2024",
    title: "The idea",
    description:
      "Three friends volunteering at a college fest watched the registration desk melt down on day one. They built a better way that night.",
  },
  {
    year: "2025",
    title: "First 50 colleges",
    description:
      "DuoFest went live at 12 campuses in Bengaluru and quickly grew to 50 colleges across the south as word spread between committees.",
  },
  {
    year: "2026",
    title: "320+ colleges",
    description:
      "Today DuoFest powers 1,200+ fests a year — from 300-seat hackathons to 5,000-attendee cultural nights — across 250+ cities in India.",
  },
];

const VALUES = [
  {
    icon: Sparkles,
    title: "Student-first",
    description: "Every feature starts with the student experience. If it isn't fast and delightful, it doesn't ship.",
  },
  {
    icon: Shield,
    title: "Reliability",
    description: "Festival day is game day. Our platform is built to stay up when 5,000 students check in at once.",
  },
  {
    icon: Rocket,
    title: "Simplicity",
    description: "If a tool needs a manual, it's broken. DuoFest is designed so a first-time convenor goes live in minutes.",
  },
  {
    icon: Users,
    title: "Community",
    description: "We win when college fests win. Organisers and volunteers shape our roadmap every single quarter.",
  },
];

const TEAM = [
  { name: "Arjun Nair", role: "Co-founder & CEO", color: "#5b5ceb" },
  { name: "Meera Pillai", role: "Co-founder & CTO", color: "#ec4899" },
  { name: "Vikram Rao", role: "Head of Design", color: "#f59e0b" },
  { name: "Anjali Desai", role: "Head of Growth", color: "#10b981" },
  { name: "Kabir Menon", role: "Engineering Lead", color: "#3b82f6" },
  { name: "Ishita Gupta", role: "Community Lead", color: "#8b5cf6" },
];

export function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-muted/40">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(50rem 26rem at 30% -10%, color-mix(in srgb, var(--color-primary) 12%, transparent), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <SectionHeading
            eyebrow="Our story"
            title="Born at a registration desk gone wrong"
            description="DuoFest started with a simple frustration: brilliant fests were being run on spreadsheets. We set out to give every college committee the tools of a professional event company."
          />
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            How far we've come
          </h2>
          <div className="mt-12">
            {MILESTONES.map((milestone, index) => (
              <div key={milestone.year} className="relative flex gap-6 pb-12 last:pb-0">
                {index < MILESTONES.length - 1 && (
                  <span
                    className="absolute left-[7px] top-6 h-full w-px bg-border"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10 mt-1 flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full border-2 border-primary bg-card" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                      {milestone.year}
                    </span>
                    <h3 className="text-lg font-semibold text-foreground">
                      {milestone.title}
                    </h3>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What we believe"
            title="Values that ship"
            description="Four principles guide every decision we make."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <value.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-base font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="The team"
            title="Former fest volunteers. Now your co-hosts."
            description="We've run events, sold tickets from tables and scanned wristbands. We build DuoFest for the versions of ourselves that needed it."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-card"
              >
                <UserAvatar name={member.name} color={member.color} size="lg" />
                <div>
                  <p className="font-semibold text-foreground">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Heart className="h-4 w-4 text-rose-500" />
            Built with love for campus culture
          </div>
        </div>
      </section>

      <section className="pb-20 lg:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-info px-6 py-14 text-center shadow-glass sm:px-16">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Want to be part of the story?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-white/80">
              Whether you're organising a fest or joining the team, we'd love to
              hear from you.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-lg"
                asChild
              >
                <Link to="/contact">
                  Get in touch <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                asChild
              >
                <Link to="/events">Browse events</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
