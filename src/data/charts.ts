import type { ChartPoint, DonutSlice, GroupedBarPoint } from "@/types";
import { CHART_COLORS } from "@/utils/constants";

export const registrationTrends: Record<
  "today" | "week" | "month" | "year",
  ChartPoint[]
> = {
  today: [
    { label: "12 AM", value: 42 },
    { label: "3 AM", value: 28 },
    { label: "6 AM", value: 65 },
    { label: "9 AM", value: 148 },
    { label: "12 PM", value: 214 },
    { label: "3 PM", value: 268 },
    { label: "6 PM", value: 312 },
    { label: "9 PM", value: 286 },
  ],
  week: [
    { label: "Mon", value: 980 },
    { label: "Tue", value: 1240 },
    { label: "Wed", value: 1130 },
    { label: "Thu", value: 1620 },
    { label: "Fri", value: 1890 },
    { label: "Sat", value: 2310 },
    { label: "Sun", value: 1740 },
  ],
  month: [
    { label: "Jul 5", value: 4200 },
    { label: "Jul 10", value: 5100 },
    { label: "Jul 15", value: 4780 },
    { label: "Jul 20", value: 6100 },
    { label: "Jul 25", value: 7240 },
    { label: "Jul 30", value: 8490 },
  ],
  year: [
    { label: "Jan", value: 9200 },
    { label: "Feb", value: 10800 },
    { label: "Mar", value: 13400 },
    { label: "Apr", value: 11800 },
    { label: "May", value: 15600 },
    { label: "Jun", value: 14200 },
    { label: "Jul", value: 18900 },
  ],
};

export const collegeGrowth: GroupedBarPoint[] = [
  { label: "Feb", colleges: 18, students: 2400 },
  { label: "Mar", colleges: 26, students: 4200 },
  { label: "Apr", colleges: 34, students: 6800 },
  { label: "May", colleges: 42, students: 9100 },
  { label: "Jun", colleges: 39, students: 8300 },
  { label: "Jul", colleges: 52, students: 11200 },
];

export const revenueBreakdown: DonutSlice[] = [
  { name: "Ticket Sales", value: 612000, color: CHART_COLORS.primary },
  { name: "Sponsorships", value: 384000, color: CHART_COLORS.info },
  { name: "Subscriptions", value: 214000, color: CHART_COLORS.success },
  { name: "Add-ons", value: 72000, color: CHART_COLORS.warning },
];

export const revenueTrend: ChartPoint[] = [
  { label: "Jan", value: 68000 },
  { label: "Feb", value: 82000 },
  { label: "Mar", value: 96000 },
  { label: "Apr", value: 89000 },
  { label: "May", value: 118000 },
  { label: "Jun", value: 136000 },
  { label: "Jul", value: 164000 },
];

export const topPerformingColleges = [
  { name: "SRM Institute of Technology", registrations: 27600, events: 276, trend: 18 },
  { name: "VIT Vellore", registrations: 24300, events: 212, trend: 14 },
  { name: "IIT Bombay", registrations: 19800, events: 148, trend: 22 },
  { name: "BITS Pilani", registrations: 17200, events: 158, trend: 11 },
  { name: "Manipal Institute of Technology", registrations: 14900, events: 143, trend: 9 },
];

export const audienceMix: DonutSlice[] = [
  { name: "Students", value: 74, color: CHART_COLORS.primary },
  { name: "Organizers", value: 14, color: CHART_COLORS.info },
  { name: "Volunteers", value: 8, color: CHART_COLORS.success },
  { name: "Admins", value: 4, color: CHART_COLORS.warning },
];
