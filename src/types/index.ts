export type CollegeStatus = "active" | "pending" | "suspended";
export type PaymentStatus = "paid" | "pending" | "failed";
export type EventStatus = "upcoming" | "live" | "completed" | "cancelled";
export type UserStatus = "active" | "inactive" | "blocked";
export type PlanStatus = "active" | "trial" | "expired";

export interface College {
  id: string;
  name: string;
  city: string;
  state: string;
  students: number;
  events: number;
  adminName: string;
  adminEmail: string;
  status: CollegeStatus;
  plan: "Enterprise" | "Growth" | "Starter";
  joinedAt: string;
  logoColor: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  collegeName: string;
  role: string;
  status: UserStatus;
  lastActive: string;
  joinedAt: string;
  avatarColor: string;
}

export interface FestEvent {
  id: string;
  name: string;
  collegeName: string;
  category: string;
  date: string;
  registrations: number;
  revenue: number;
  status: EventStatus;
  gradient: string;
}

export interface Registration {
  id: string;
  studentName: string;
  email: string;
  collegeName: string;
  eventName: string;
  amount: number;
  date: string;
  status: "confirmed" | "pending" | "cancelled" | "refunded";
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  collegeName: string;
  role: "Student" | "Organizer" | "Admin";
  registeredAt: string;
  status: UserStatus;
  avatarColor: string;
}

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  collegeName: string;
  eventName: string;
  hours: number;
  status: "active" | "onboarding" | "inactive";
  avatarColor: string;
}

export interface Payment {
  id: string;
  invoice: string;
  collegeName: string;
  amount: number;
  date: string;
  status: PaymentStatus;
  method: "UPI" | "Card" | "Net Banking" | "Bank Transfer";
}

export interface ActivityEntry {
  id: string;
  type:
    | "college"
    | "admin"
    | "payment"
    | "event"
    | "volunteer"
    | "student"
    | "system";
  title: string;
  description: string;
  time: string;
}

export interface ActivityLogItem {
  id: string;
  actor: string;
  actorRole: string;
  action: string;
  target: string;
  category: ActivityEntry["type"];
  timestamp: string;
  ip: string;
  status: "success" | "warning" | "danger";
}

export interface Announcement {
  id: string;
  title: string;
  summary: string;
  audience: "All Colleges" | "Admins" | "Students" | "Organizers";
  author: string;
  createdAt: string;
  pinned: boolean;
  status: "published" | "draft" | "scheduled";
}

export interface Report {
  id: string;
  title: string;
  type: string;
  generatedAt: string;
  rows: number;
  size: string;
  status: "ready" | "generating" | "failed";
}

export interface StatDelta {
  value: number;
  direction: "up" | "down";
  label: string;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface GroupedBarPoint {
  label: string;
  colleges: number;
  students: number;
}

export interface DonutSlice {
  name: string;
  value: number;
  color: string;
}

export interface DashboardStat {
  id: string;
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  delta: StatDelta;
  icon: string;
  tint: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  kind: "payment" | "college" | "event" | "alert";
}
