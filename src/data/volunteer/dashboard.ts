import { volunteerEntries } from "./entries";

export type VolunteerStatFormat = "number" | "text";

export interface VolunteerDashboardStat {
  id: string;
  label: string;
  value: string | number;
  suffix?: string;
  icon: string;
  tint: string;
  format: VolunteerStatFormat;
  hint?: string;
}

export interface VolunteerTodayEvent {
  name: string;
  shortName: string;
  venue: string;
  date: string;
  time: string;
  gate: string;
  shift: string;
  gradient: string;
  capacity: number;
  entered: number;
}

export const VOLUNTEER_EVENT: VolunteerTodayEvent = {
  name: "TechNova Hackathon 2026",
  shortName: "TechNova 2026",
  venue: "Brainware University · Innovation Hub",
  date: "Fri, 31 Jul",
  time: "09:00 AM – 06:00 PM",
  gate: "Main Gate",
  shift: "08:00 AM – 02:00 PM",
  gradient: "from-[#5B5CEB] via-[#7C3AED] to-[#DB2777]",
  capacity: 2000,
  entered: 1286,
};

export const volunteerStats: VolunteerDashboardStat[] = [
  {
    id: "vs-event",
    label: "Today's Event",
    value: "TechNova 2026",
    icon: "calendar",
    tint: "primary",
    format: "text",
    hint: "Live now",
  },
  {
    id: "vs-entered",
    label: "Students Entered",
    value: VOLUNTEER_EVENT.entered,
    icon: "users",
    tint: "success",
    format: "number",
    hint: "through Main Gate",
  },
  {
    id: "vs-remaining",
    label: "Remaining Entries",
    value: VOLUNTEER_EVENT.capacity - VOLUNTEER_EVENT.entered,
    icon: "ticket",
    tint: "info",
    format: "number",
    hint: "of 2,000 tickets",
  },
  {
    id: "vs-gate",
    label: "Assigned Gate",
    value: "Main Gate",
    icon: "gate",
    tint: "warning",
    format: "text",
    hint: "08:00 AM – 02:00 PM",
  },
];

export const recentVolunteerEntries = volunteerEntries.slice(0, 5);
