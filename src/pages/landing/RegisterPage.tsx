import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CreditCard,
  Landmark,
  Loader2,
  Lock,
  MapPin,
  Smartphone,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/forms/TextField";
import { SelectField } from "@/components/forms/SelectField";
import { PageLoader } from "@/components/common/PageLoader";
import { useEventBySlug, useRequestOtp } from "@/lib/hooks";
import { adaptLandingEvent } from "@/lib/adapters";
import { toastApiError, toastSuccess } from "@/lib/toast";
import { formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";
import {
  registerSchema,
  YEAR_OPTIONS,
  PAYMENT_METHODS,
  type RegisterFormValues,
} from "@/pages/landing/registerSchema";

const STEPS = [
  { title: "Personal details", description: "Who's attending?" },
  { title: "College & team", description: "Tell us where you're from" },
  { title: "Payment", description: "Secure checkout" },
];

const METHOD_ICONS: Record<string, typeof Smartphone> = {
  upi: Smartphone,
  card: CreditCard,
  netbanking: Landmark,
};

export function RegisterPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useEventBySlug(slug);
  const requestOtp = useRequestOtp();

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      college: "",
      year: "",
      paymentMethod: "upi",
    },
    mode: "onTouched",
  });

  if (isLoading) {
    return <PageLoader />;
  }

  const event = data ? adaptLandingEvent(data) : undefined;

  if (!event) {
    return <Navigate to="/events" replace />;
  }

  const watch = form.watch();
  const selectedMethod = watch.paymentMethod ?? "upi";
  const amount = event.fee * (event.team > 1 ? 1 : 1);

  const stepFields: Array<Array<keyof RegisterFormValues>> = [
    ["fullName", "email", "phone"],
    ["college", "year"],
    ["paymentMethod"],
  ];

  const goNext = async () => {
    const fields = stepFields[step];
    const valid = await form.trigger(fields);
    if (!valid) return;
    setStep((value) => Math.min(value + 1, STEPS.length - 1));
  };

  const goBack = () => setStep((value) => Math.max(value - 1, 0));

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await requestOtp.mutateAsync({
        eventId: Number(event.id),
        payload: {
          email: values.email,
          name: values.fullName,
          phone: values.phone,
          attendee_details: {
            college: values.college,
            year: values.year,
            payment_method: values.paymentMethod,
          },
        },
      });
      toastSuccess("Verification code sent to your email.");
      navigate(
        `/verify?event=${event.slug}&name=${encodeURIComponent(values.fullName)}&email=${encodeURIComponent(values.email)}&fee=${event.fee}`,
      );
    } catch (error) {
      toastApiError(error, "Could not start your registration.");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="relative">
      <section
        className={cn("relative overflow-hidden bg-gradient-to-br", event.gradient)}
      >
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link
            to={`/events/${event.slug}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to event
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Register for {event.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-white/90">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {formatDate(event.date)}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {event.college}, {event.city}
            </span>
            <span className="inline-flex items-center gap-2 font-bold">
              <Ticket className="h-4 w-4" />
              {event.fee === 0 ? "Free" : `₹${event.fee.toLocaleString("en-IN")}`}
            </span>
          </div>
        </div>
      </section>

      <section className="py-10 lg:py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center gap-2">
            {STEPS.map((item, index) => (
              <li key={item.title} className="flex flex-1 items-center gap-2">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300",
                    index < step
                      ? "bg-success text-success-foreground"
                      : index === step
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                        : "border border-border bg-card text-muted-foreground",
                  )}
                >
                  {index < step ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                {index < STEPS.length - 1 && (
                  <span
                    className={cn(
                      "h-px flex-1 transition-colors duration-300",
                      index < step ? "bg-success" : "bg-border",
                    )}
                  />
                )}
              </li>
            ))}
          </ol>

          <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-card shadow-card">
            <div className="border-b border-border bg-muted/40 px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">
                {STEPS[step].title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {STEPS[step].description}
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.form
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onSubmit={handleSubmit}
                noValidate
              >
                <div className="space-y-5 p-6 sm:p-8">
                  {step === 0 && (
                    <>
                      <TextField
                        name="fullName"
                        control={form.control}
                        label="Full name"
                        placeholder="e.g. Aarav Sharma"
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
                      <TextField
                        name="phone"
                        control={form.control}
                        label="Mobile number"
                        type="tel"
                        placeholder="10-digit mobile"
                        maxLength={10}
                        inputMode="numeric"
                        autoComplete="tel"
                      />
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <TextField
                        name="college"
                        control={form.control}
                        label="College / university"
                        placeholder="e.g. IIT Bombay"
                      />
                      <SelectField
                        name="year"
                        control={form.control}
                        label="Year of study"
                        placeholder="Select year"
                        options={YEAR_OPTIONS}
                      />
                      <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                        {event.team > 1 ? (
                          <>
                            This is a team event — each member registers
                            separately with this link. Your team cap is{" "}
                            <span className="font-semibold text-foreground">
                              {event.team}
                            </span>{" "}
                            members.
                          </>
                        ) : (
                          <>This is an individual entry.</>
                        )}
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <div className="space-y-3">
                        {PAYMENT_METHODS.map((method) => {
                          const Icon = METHOD_ICONS[method.value];
                          const active = selectedMethod === method.value;
                          return (
                            <button
                              key={method.value}
                              type="button"
                              onClick={() =>
                                form.setValue("paymentMethod", method.value, {
                                  shouldValidate: true,
                                })
                              }
                              aria-pressed={active}
                              className={cn(
                                "flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-200",
                                active
                                  ? "border-primary bg-primary/5"
                                  : "border-border bg-card hover:border-primary/30",
                              )}
                            >
                              <span
                                className={cn(
                                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                                  active
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground",
                                )}
                              >
                                <Icon className="h-5 w-5" />
                              </span>
                              <span className="flex-1">
                                <span className="block text-sm font-semibold text-foreground">
                                  {method.label}
                                </span>
                                <span className="block text-xs text-muted-foreground">
                                  {method.hint}
                                </span>
                              </span>
                              <span
                                className={cn(
                                  "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
                                  active
                                    ? "border-primary bg-primary"
                                    : "border-border",
                                )}
                              >
                                {active && (
                                  <Check className="h-3 w-3 text-primary-foreground" />
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="rounded-2xl border border-border bg-muted/40 p-5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Registration fee
                          </span>
                          <span className="font-semibold text-foreground">
                            {event.fee === 0
                              ? "Free"
                              : `₹${event.fee.toLocaleString("en-IN")}`}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Platform fee
                          </span>
                          <span className="font-semibold text-success">
                            ₹0 · Waived
                          </span>
                        </div>
                        <div className="mt-3 border-t border-border pt-3 flex items-center justify-between">
                          <span className="font-semibold text-foreground">
                            Total payable
                          </span>
                          <span className="text-lg font-bold text-foreground">
                            {event.fee === 0
                              ? "Free"
                              : `₹${event.fee.toLocaleString("en-IN")}`}
                          </span>
                        </div>
                        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Lock className="h-3.5 w-3.5" />
                          Payments are encrypted and processed securely. This is
                          a demo — no real charge will be made.
                        </p>
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between gap-3 border-t border-border pt-6">
                    {step > 0 ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={goBack}
                        disabled={isSubmitting}
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </Button>
                    ) : (
                      <span />
                    )}
                    {step < STEPS.length - 1 ? (
                      <Button type="button" onClick={goNext}>
                        Continue <ArrowRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing…
                          </>
                        ) : event.fee === 0 ? (
                          "Confirm free registration"
                        ) : (
                          <>
                            <Lock className="h-4 w-4" />
                            Pay ₹{event.fee.toLocaleString("en-IN")}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.form>
            </AnimatePresence>
          </div>

          <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
            <BadgeCheck className="h-4 w-4 text-success" />
            Secure checkout · Instant QR ticket · No hidden fees
          </p>
        </div>
      </section>
    </div>
  );
}
