export type EventCategory =
  | "Technical"
  | "Cultural"
  | "Workshop"
  | "Sports"
  | "Gaming"
  | "Hackathon";

export type EventMode = "Offline" | "Online" | "Hybrid";

export interface LandingEvent {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: EventCategory;
  college: string;
  city: string;
  mode: EventMode;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  capacity: number;
  registered: number;
  fee: number;
  gradient: string;
  tint: string;
  featured: boolean;
  description: string;
  highlights: string[];
  schedule: Array<{ time: string; title: string; description: string }>;
  prizes: Array<{ place: string; amount: string; note: string }>;
  team: number;
}

export interface LandingCollege {
  name: string;
  short: string;
  city: string;
  color: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  college: string;
  avatarColor: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface LandingStat {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
}

export interface LandingFeature {
  icon: string;
  title: string;
  description: string;
  tint: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  tagline: string;
  features: string[];
  cta: string;
  popular?: boolean;
}
