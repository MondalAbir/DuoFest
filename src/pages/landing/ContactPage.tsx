import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/forms/TextField";
import { TextareaField } from "@/components/forms/TextareaField";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { FaqAccordion } from "@/components/landing/FaqAccordion";
import { faqItems } from "@/data/landing/faq";

const contactSchema = z.object({
  fullName: z.string().min(2, "Enter your name"),
  email: z.email("Enter a valid email address"),
  subject: z.string().min(3, "Enter a short subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const CONTACT_CARDS = [
  {
    icon: Mail,
    title: "Email us",
    lines: ["hello@duofest.app", "support@duofest.app"],
  },
  {
    icon: Phone,
    title: "Call us",
    lines: ["+91 98765 43210", "Mon–Fri, 9am–7pm IST"],
  },
  {
    icon: MapPin,
    title: "Visit us",
    lines: ["HustleHub, Koramangala", "Bengaluru 560034"],
  },
];

export function ContactPage() {
  const [sent, setSent] = useState(false);
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { fullName: "", email: "", subject: "", message: "" },
    mode: "onTouched",
  });

  const onSubmit = form.handleSubmit(() => {
    setSent(true);
  });

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-muted/40">
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Contact us"
            title="We reply within a day"
            description="Questions about pricing, onboarding or an event issue? Our team — real humans — will get back to you fast."
          />
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:px-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Reach out directly
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose whichever channel works best for you.
            </p>
            <div className="mt-8 space-y-4">
              {CONTACT_CARDS.map((card) => (
                <div
                  key={card.title}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-card"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <card.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {card.title}
                    </h3>
                    {card.lines.map((line) => (
                      <p
                        key={line}
                        className="mt-0.5 text-sm text-muted-foreground"
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-info/30 bg-info/5 p-5">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-info" />
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  Fest starting soon?
                </span>{" "}
                We prioritise messages from committees with events within 14 days.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
            {sent ? (
              <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
                  <CheckCircle2 className="h-8 w-8" />
                </span>
                <h3 className="mt-6 text-xl font-bold text-foreground">
                  Message sent!
                </h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Thanks for reaching out. Our team will get back to you at{" "}
                  {form.getValues("email")} within one business day.
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => {
                    form.reset();
                    setSent(false);
                  }}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Send us a message
                </h2>
                <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <TextField
                      name="fullName"
                      control={form.control}
                      label="Full name"
                      placeholder="Your name"
                      autoComplete="name"
                    />
                    <TextField
                      name="email"
                      control={form.control}
                      label="Email address"
                      type="email"
                      placeholder="you@college.edu"
                      autoComplete="email"
                    />
                  </div>
                  <TextField
                    name="subject"
                    control={form.control}
                    label="Subject"
                    placeholder="e.g. Onboarding our fest committee"
                  />
                  <TextareaField
                    name="message"
                    control={form.control}
                    label="Message"
                    placeholder="Tell us a little about your fest and what you need…"
                    rows={6}
                  />
                  <div className="flex items-center justify-between gap-4 pt-2">
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MessageSquare className="h-3.5 w-3.5" />
                      We usually reply within a day
                    </p>
                    <Button type="submit" size="lg">
                      Send message
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="FAQs"
            title="Quick answers"
            description="The things organisers ask us most."
          />
          <div className="mt-10">
            <FaqAccordion items={faqItems.slice(0, 6)} />
          </div>
        </div>
      </section>
    </>
  );
}
