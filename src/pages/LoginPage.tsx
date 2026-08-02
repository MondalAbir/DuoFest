import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { Loader2, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toastApiError } from "@/lib/toast";
import type { UserRole } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/common/Logo";

const ROLE_HOME: Record<UserRole, string> = {
  super_admin: "/admin",
  event_manager: "/admin/college",
  college_admin: "/admin/college",
  volunteer: "/admin/volunteer/scan",
  student: "/",
};

function canAccessPath(path: string, role: UserRole): boolean {
  if (!path.startsWith("/") || path.startsWith("//")) return false;
  switch (role) {
    case "super_admin":
      return path === "/admin" || path.startsWith("/admin/");
    case "event_manager":
      return path === "/admin" || path.startsWith("/admin/college");
    case "college_admin":
      return path.startsWith("/admin/college");
    case "volunteer":
      return path.startsWith("/admin/volunteer");
    default:
      return !path.startsWith("/admin");
  }
}

export type LoginPortal = "default" | "college" | "volunteer";

const PORTAL_COPY: Record<
  LoginPortal,
  { title: string; subtitle: string; demo: string[]; home: string }
> = {
  default: {
    title: "Welcome back",
    subtitle: "Sign in to manage your portal.",
    demo: ["superadmin@duofest.test", "organizer@duofest.test", "volunteer@duofest.test", "student@duofest.test"],
    home: "",
  },
  college: {
    title: "College admin login",
    subtitle: "Sign in to manage your college's events, registrations and volunteers.",
    demo: ["organizer@duofest.test"],
    home: "/admin/college",
  },
  volunteer: {
    title: "Volunteer login",
    subtitle: "Sign in to scan tickets and manage your shifts.",
    demo: ["volunteer@duofest.test"],
    home: "/admin/volunteer/scan",
  },
};

export function LoginPage({ portal = "default" }: { portal?: LoginPortal }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const copy = PORTAL_COPY[portal];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password || submitting) return;

    setSubmitting(true);
    try {
      const result = await login(email, password);
      const role = (result.user.roles?.[0] as UserRole) ?? "student";
      const next = searchParams.get("next");
      const home =
        portal !== "default"
          ? next && next.startsWith(copy.home)
            ? next
            : copy.home
          : next && canAccessPath(next, role)
            ? next
            : ROLE_HOME[role];
      navigate(home, { replace: true });
    } catch (error) {
      toastApiError(error, "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-14">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(48rem 26rem at 50% -10%, color-mix(in srgb, var(--color-primary) 12%, transparent), transparent 60%)",
        }}
      />
      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="overflow-hidden rounded-3xl border border-border bg-card shadow-card"
        >
          <div className="border-b border-border bg-muted/40 px-6 py-8 text-center">
            <div className="flex justify-center">
              <Logo subtitle="Event Management" />
            </div>
            <h1 className="mt-4 text-xl font-bold tracking-tight text-foreground">
              {copy.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {copy.subtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8" noValidate>
            <div className="space-y-2">
              <Label htmlFor="login-email">Email address</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@duofest.test"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign in
                </>
              )}
            </Button>

            <div className="rounded-xl border border-border bg-muted/40 p-3 text-center text-xs text-muted-foreground">
              Demo accounts:{" "}
              {copy.demo.map((account, index) => (
                <span key={account}>
                  {index > 0 && ", "}
                  <span className="font-medium text-foreground">{account}</span>
                </span>
              ))}{" "}
              (password: <span className="font-medium text-foreground">password</span>)
            </div>

            <p className="text-center text-xs text-muted-foreground">
              {portal === "college" ? (
                <>
                  Not a college admin?{" "}
                  <Link
                    to="/login/volunteer"
                    className="font-semibold text-primary transition-colors hover:text-primary/80"
                  >
                    Volunteer login
                  </Link>{" "}
                  ·{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-primary transition-colors hover:text-primary/80"
                  >
                    Admin login
                  </Link>
                </>
              ) : portal === "volunteer" ? (
                <>
                  Not a volunteer?{" "}
                  <Link
                    to="/login/college"
                    className="font-semibold text-primary transition-colors hover:text-primary/80"
                  >
                    College admin login
                  </Link>{" "}
                  ·{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-primary transition-colors hover:text-primary/80"
                  >
                    Admin login
                  </Link>
                </>
              ) : (
                <>
                  New attendee?{" "}
                  <Link
                    to="/events"
                    className="font-semibold text-primary transition-colors hover:text-primary/80"
                  >
                    Browse events
                  </Link>{" "}
                  or{" "}
                  <Link
                    to="/"
                    className="font-semibold text-primary transition-colors hover:text-primary/80"
                  >
                    visit home
                  </Link>
                </>
              )}
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
