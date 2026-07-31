export interface CollegeStat {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  growth: number;
  icon: string;
  tileGradient: string;
  softGradient: string;
  tint: string;
}

export interface CollegeCheckIn {
  id: string;
  studentName: string;
  avatarColor: string;
  eventName: string;
  time: string;
  status: "checked-in" | "pending" | "late";
}

export interface CollegeNotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  kind: "event" | "registration" | "announcement" | "alert";
  read: boolean;
}

export const COLLEGE_ADMIN = {
  name: "Rahul Sharma",
  role: "College Admin",
  email: "rahul.sharma@brainware.edu",
  color: "#5B5CEB",
};

export const collegeOptions = [
  "Brainware University",
  "JIS Institute of Technology",
  "St. Xavier's College",
  "Techno India University",
];

export const collegeStats: CollegeStat[] = [
  {
    id: "cs-total-events",
    label: "Total Events",
    value: 24,
    growth: 12.4,
    icon: "calendar",
    tileGradient: "from-indigo-500 to-violet-500",
    softGradient: "from-indigo-500/[0.07]",
    tint: "text-indigo-500",
  },
  {
    id: "cs-upcoming-events",
    label: "Upcoming Events",
    value: 8,
    growth: 6.2,
    icon: "sparkles",
    tileGradient: "from-sky-500 to-blue-500",
    softGradient: "from-sky-500/[0.07]",
    tint: "text-sky-500",
  },
  {
    id: "cs-registrations",
    label: "Total Registrations",
    value: 8542,
    growth: 18.7,
    icon: "ticket",
    tileGradient: "from-fuchsia-500 to-purple-500",
    softGradient: "from-fuchsia-500/[0.07]",
    tint: "text-fuchsia-500",
  },
  {
    id: "cs-checkins",
    label: "Today's Check-ins",
    value: 412,
    growth: 9.3,
    icon: "qr",
    tileGradient: "from-emerald-500 to-teal-500",
    softGradient: "from-emerald-500/[0.07]",
    tint: "text-emerald-500",
  },
  {
    id: "cs-volunteers",
    label: "Total Volunteers",
    value: 96,
    growth: 4.8,
    icon: "users",
    tileGradient: "from-amber-500 to-orange-500",
    softGradient: "from-amber-500/[0.07]",
    tint: "text-amber-500",
  },
  {
    id: "cs-revenue",
    label: "Total Revenue",
    value: 248500,
    prefix: "$",
    growth: 21.5,
    icon: "wallet",
    tileGradient: "from-rose-500 to-pink-500",
    softGradient: "from-rose-500/[0.07]",
    tint: "text-rose-500",
  },
];

export const todayCheckIns: CollegeCheckIn[] = [
  {
    id: "ci-001",
    studentName: "Ananya Singh",
    avatarColor: "#5B5CEB",
    eventName: "Battle of Bands",
    time: "09:12 AM",
    status: "checked-in",
  },
  {
    id: "ci-002",
    studentName: "Rohan Gupta",
    avatarColor: "#14B8A6",
    eventName: "Startup Pitch Fest",
    time: "09:24 AM",
    status: "checked-in",
  },
  {
    id: "ci-003",
    studentName: "Priya Nair",
    avatarColor: "#F59E0B",
    eventName: "Battle of Bands",
    time: "09:31 AM",
    status: "checked-in",
  },
  {
    id: "ci-004",
    studentName: "Kabir Malhotra",
    avatarColor: "#0EA5E9",
    eventName: "Startup Pitch Fest",
    time: "09:47 AM",
    status: "late",
  },
  {
    id: "ci-005",
    studentName: "Diya Rao",
    avatarColor: "#10B981",
    eventName: "Battle of Bands",
    time: "—",
    status: "pending",
  },
];

export const collegeNotifications: CollegeNotificationItem[] = [
  {
    id: "cn-001",
    title: "Check-in spike",
    description: "412 students checked in today so far.",
    time: "2 min ago",
    kind: "registration",
    read: false,
  },
  {
    id: "cn-002",
    title: "New registration",
    description: "Meera Joshi registered for TechNova Hackathon.",
    time: "18 min ago",
    kind: "event",
    read: false,
  },
  {
    id: "cn-003",
    title: "Announcement published",
    description: "Your announcement reached 4,800 students.",
    time: "1h ago",
    kind: "announcement",
    read: false,
  },
  {
    id: "cn-004",
    title: "Capacity warning",
    description: "Battle of Bands is at 74% capacity.",
    time: "3h ago",
    kind: "alert",
    read: true,
  },
];
