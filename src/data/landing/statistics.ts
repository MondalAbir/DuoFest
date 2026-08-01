import type { LandingStat } from "@/types/landing";

export const heroStats: LandingStat[] = [
  { value: 320, label: "Colleges onboard" },
  { value: 1286, suffix: "+", label: "Events hosted" },
  { value: 2.4, decimals: 1, suffix: "L+", label: "Student registrations" },
  { value: 98, suffix: "%", label: "Attendee satisfaction" },
];

export const eventPageStats: LandingStat[] = [
  { value: 96, suffix: "%", label: "Events go live same-day" },
  { value: 4.9, decimals: 1, label: "Average rating" },
  { value: 250, suffix: "+", label: "Cities covered" },
];
