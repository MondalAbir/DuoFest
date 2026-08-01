import {
  BarChart3,
  QrCode,
  ShieldCheck,
  Ticket,
  Users,
  Wallet,
} from "lucide-react";
import { features } from "@/data/landing/features";

const ICONS = {
  ticket: Ticket,
  qr: QrCode,
  wallet: Wallet,
  chart: BarChart3,
  users: Users,
  shield: ShieldCheck,
} as const;

const TINTS: Record<string, string> = {
  violet: "bg-violet-500/10 text-violet-600 group-hover:bg-violet-500 group-hover:text-white",
  blue: "bg-blue-500/10 text-blue-600 group-hover:bg-blue-500 group-hover:text-white",
  emerald: "bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white",
  amber: "bg-amber-500/10 text-amber-600 group-hover:bg-amber-500 group-hover:text-white",
  rose: "bg-rose-500/10 text-rose-600 group-hover:bg-rose-500 group-hover:text-white",
  cyan: "bg-cyan-500/10 text-cyan-600 group-hover:bg-cyan-500 group-hover:text-white",
};

export function FeatureGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => {
        const Icon = ICONS[feature.icon as keyof typeof ICONS] ?? Ticket;
        return (
          <div
            key={feature.title}
            className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-card-hover"
          >
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-300 ${TINTS[feature.tint] ?? TINTS.violet}`}
            >
              <Icon className="h-6 w-6" />
            </span>
            <h3 className="mt-5 text-base font-semibold text-foreground">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
