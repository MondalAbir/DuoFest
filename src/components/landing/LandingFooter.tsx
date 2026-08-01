import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Github, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingLogo } from "@/components/landing/LandingLogo";

const FOOTER_COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Browse events", to: "/events" },
      { label: "For colleges", to: "/for-colleges" },
      { label: "College login", to: "/admin/college" },
      { label: "Volunteer login", to: "/admin/volunteer" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Careers", to: "/about" },
      { label: "Blog", to: "/about" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help centre", to: "/contact" },
      { label: "FAQs", to: "/contact" },
      { label: "For students", to: "/events" },
      { label: "Privacy & terms", to: "/about" },
    ],
  },
];

const SOCIALS = [
  { label: "Twitter", icon: Twitter },
  { label: "Instagram", icon: Instagram },
  { label: "LinkedIn", icon: Linkedin },
  { label: "YouTube", icon: Youtube },
  { label: "GitHub", icon: Github },
];

export function LandingFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <LandingLogo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              The event platform built for college fests. From first registration
              to final check-in, DuoFest runs the shows students remember.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {SOCIALS.map(({ label, icon: Icon }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-foreground">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-6 rounded-2xl border border-border bg-muted/40 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Never miss a fest near you
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get event drops, deadlines and early-bird offers in your inbox.
            </p>
          </div>
          {subscribed ? (
            <p className="text-sm font-medium text-success">
              You're in! Watch your inbox for the next drop.
            </p>
          ) : (
            <form
              className="flex w-full max-w-md items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (email.trim()) setSubscribed(true);
              }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@college.edu"
                aria-label="Email address"
                className="h-11 flex-1 rounded-xl border border-input bg-card px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
              <Button
                type="submit"
                className="shrink-0"
                aria-label="Subscribe to newsletter"
              >
                Subscribe <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © 2026 DuoFest. Built for the builders of tomorrow.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with <span className="text-primary">♥</span> for college fests
            across India.
          </p>
        </div>
      </div>
    </footer>
  );
}
