import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  MailCheck,
  RefreshCw,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLandingEvent } from "@/data/landing/events";
import { cn } from "@/utils/cn";

const OTP_LENGTH = 6;
const OTP_COUNTDOWN = 60;

export function OtpPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const slug = searchParams.get("event") ?? "";
  const name = searchParams.get("name") ?? "there";
  const email = searchParams.get("email") ?? "";

  const event = slug ? getLandingEvent(slug) : undefined;

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [seconds, setSeconds] = useState(OTP_COUNTDOWN);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const maskedEmail = useMemo(() => {
    if (!email) return "your email";
    const [local, domain] = email.split("@");
    if (!domain) return email;
    return `${local.slice(0, 2)}•••${local.slice(-2)}@${domain}`;
  }, [email]);

  const code = digits.join("");
  const complete = code.length === OTP_LENGTH;

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => setSeconds((value) => value - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  if (!event) {
    return <Navigate to="/events" replace />;
  }

  const setDigit = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "").slice(-1);
    setDigits((current) => {
      const next = [...current];
      next[index] = clean;
      return next;
    });
    setError(null);
    if (clean && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    setDigits(
      Array.from({ length: OTP_LENGTH }, (_, index) => pasted[index] ?? ""),
    );
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const verify = async () => {
    if (!complete) return;
    setIsVerifying(true);
    setError(null);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    navigate(
      `/success?event=${slug}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&ticket=DF-TN-${Math.floor(10000 + Math.random() * 89999)}`,
    );
  };

  const resend = () => {
    setSeconds(OTP_COUNTDOWN);
    setDigits(Array(OTP_LENGTH).fill(""));
    setError(null);
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-14">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(48rem 26rem at 50% -10%, color-mix(in srgb, var(--color-primary) 10%, transparent), transparent 60%)",
        }}
      />
      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="overflow-hidden rounded-3xl border border-border bg-card shadow-card"
        >
          <div
            className={cn(
              "flex items-center gap-3 bg-gradient-to-br px-6 py-5",
              event.gradient,
            )}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur">
              <MailCheck className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-bold text-white">Verify your email</p>
              <p className="text-xs text-white/80">{event.name}</p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <p className="text-sm leading-relaxed text-muted-foreground">
              We sent a 6-digit code to{" "}
              <span className="font-semibold text-foreground">
                {maskedEmail}
              </span>
              . Enter it below to confirm your registration.
            </p>

            <div
              className="mt-6 flex justify-between gap-2"
              onPaste={handlePaste}
            >
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputsRef.current[index] = el;
                  }}
                  type="tel"
                  inputMode="numeric"
                  autoFocus={index === 0}
                  value={digit}
                  onChange={(event) => setDigit(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  aria-label={`OTP digit ${index + 1}`}
                  className={cn(
                    "h-13 w-12 rounded-xl border-2 bg-card text-center text-xl font-bold text-foreground outline-none transition-all duration-200",
                    error
                      ? "border-destructive/60 focus:border-destructive"
                      : "border-border focus:border-primary focus:ring-2 focus:ring-primary/30",
                    digit && "border-primary/40",
                  )}
                />
              ))}
            </div>

            {error && (
              <p className="mt-3 text-xs font-medium text-destructive">{error}</p>
            )}

            <div className="mt-5 flex items-center justify-between text-sm">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 font-medium",
                  seconds === 0 ? "text-muted-foreground" : "text-muted-foreground",
                )}
              >
                <Timer className="h-4 w-4" />
                {seconds > 0 ? (
                  <>Code expires in 0:{String(seconds).padStart(2, "0")}</>
                ) : (
                  "Code expired"
                )}
              </span>
              <button
                type="button"
                onClick={resend}
                className="inline-flex items-center gap-1.5 font-semibold text-primary transition-colors hover:text-primary/80 disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" />
                Resend code
              </button>
            </div>

            <Button
              className="mt-6 w-full"
              size="lg"
              onClick={verify}
              disabled={!complete || isVerifying}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                "Verify & confirm"
              )}
            </Button>

            <Link
              to="/events"
              className="mt-4 flex items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to events
            </Link>
          </div>
        </motion.div>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          Demo mode — any 6-digit code works. In production, a real OTP is sent.
        </p>
      </div>
    </div>
  );
}
