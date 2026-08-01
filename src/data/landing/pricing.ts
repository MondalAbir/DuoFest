import type { PricingPlan } from "@/types/landing";

export const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    tagline: "Perfect for small events and single fests.",
    features: [
      "Up to 500 registrations per event",
      "QR ticketing & check-in",
      "UPI payments",
      "Basic analytics dashboard",
      "Email support",
    ],
    cta: "Start for free",
  },
  {
    name: "Growth",
    price: "₹4,999",
    period: "/ month",
    tagline: "For college fests that are scaling up.",
    features: [
      "Unlimited registrations",
      "Volunteer scanning app",
      "Cards, UPI & net banking",
      "Live analytics & reports",
      "Automated refunds",
      "Priority support",
    ],
    cta: "Choose Growth",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    tagline: "For campuses and multi-college fests.",
    features: [
      "Everything in Growth",
      "Multiple colleges & admins",
      "Custom branding & domains",
      "SLA & dedicated manager",
      "SSO & advanced security",
      "On-site support crew",
    ],
    cta: "Talk to sales",
  },
];
