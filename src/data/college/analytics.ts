export interface WeeklyRegistrationPoint {
  label: string;
  value: number;
}

export interface EventStatusSlice {
  name: string;
  value: number;
  color: string;
}

export interface CategoryShare {
  id: string;
  category: string;
  value: number;
  percent: number;
  color: string;
}

export const registrationTrends: Record<
  "thisWeek" | "lastWeek" | "thisMonth",
  WeeklyRegistrationPoint[]
> = {
  thisWeek: [
    { label: "Mon", value: 320 },
    { label: "Tue", value: 480 },
    { label: "Wed", value: 410 },
    { label: "Thu", value: 620 },
    { label: "Fri", value: 540 },
    { label: "Sat", value: 780 },
    { label: "Sun", value: 690 },
  ],
  lastWeek: [
    { label: "Mon", value: 260 },
    { label: "Tue", value: 390 },
    { label: "Wed", value: 450 },
    { label: "Thu", value: 510 },
    { label: "Fri", value: 470 },
    { label: "Sat", value: 660 },
    { label: "Sun", value: 580 },
  ],
  thisMonth: [
    { label: "Week 1", value: 1240 },
    { label: "Week 2", value: 1680 },
    { label: "Week 3", value: 1450 },
    { label: "Week 4", value: 2120 },
  ],
};

export const eventStatusSlices: EventStatusSlice[] = [
  { name: "Upcoming", value: 8, color: "#3B82F6" },
  { name: "Live", value: 2, color: "#22C55E" },
  { name: "Completed", value: 12, color: "#94A3B8" },
  { name: "Cancelled", value: 2, color: "#EF4444" },
];

export const categoryShares: CategoryShare[] = [
  {
    id: "tech",
    category: "Technical",
    value: 4200,
    percent: 49,
    color: "#5B5CEB",
  },
  {
    id: "cultural",
    category: "Cultural",
    value: 2870,
    percent: 34,
    color: "#8B5CF6",
  },
  {
    id: "sports",
    category: "Sports",
    value: 980,
    percent: 11,
    color: "#10B981",
  },
  {
    id: "others",
    category: "Others",
    value: 492,
    percent: 6,
    color: "#F59E0B",
  },
];
