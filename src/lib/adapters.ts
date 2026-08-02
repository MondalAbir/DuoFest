import type {
  College as ApiCollege,
  FestEvent as ApiEvent,
  Registration as ApiRegistration,
  Transaction as ApiTransaction,
  User as ApiUser,
  Volunteer as ApiVolunteer,
  Attendance as ApiAttendance,
  ActivityLog as ApiActivityLog,
  AnalyticsDashboard as ApiAnalytics,
  EventCategory,
} from "@/lib/api/types";
import type {
  AdminUser,
  ActivityEntry,
  ActivityLogItem,
  ChartPoint,
  College,
  DashboardStat,
  DonutSlice,
  FestEvent,
  GroupedBarPoint,
  Payment,
  PlatformUser,
  Registration,
  Volunteer,
} from "@/types";
import type { CollegeEvent, CollegeEventStatus } from "@/data/college/events";
import type { LandingEvent } from "@/types/landing";
import type { VolunteerEntryRecord, VolunteerEntryStatus } from "@/data/volunteer/entries";
import { CATEGORY_GRADIENTS, CHART_COLORS, getAvatarColor } from "@/utils/constants";
import { formatDate, timeAgo } from "@/utils/format";

const GRADIENTS = Object.values(CATEGORY_GRADIENTS);
const TINTS = [
  "blue",
  "violet",
  "emerald",
  "rose",
  "amber",
  "cyan",
  "indigo",
  "teal",
];

function pick<T>(values: T[], seed: number): T {
  return values[Math.abs(seed) % values.length];
}

/* ------------------------------------------------------------------ */
/* Colleges                                                            */
/* ------------------------------------------------------------------ */

export function adaptCollege(college: ApiCollege): College {
  return {
    id: String(college.id),
    name: college.name,
    city: college.city ?? "—",
    state: "",
    students: college.users_count ?? 0,
    events: college.events_count ?? 0,
    adminName: "",
    adminEmail: "",
    status: college.is_active ? "active" : "suspended",
    plan: "Growth",
    joinedAt: college.created_at ?? "",
    logoColor: getAvatarColor(college.id),
  };
}

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

function mapEventStatus(event: ApiEvent): FestEvent["status"] {
  switch (event.status) {
    case "cancelled":
      return "cancelled";
    case "completed":
      return "completed";
    case "live":
      return "live";
    case "published":
      return "upcoming";
    default:
      return "upcoming";
  }
}

export function adaptEvent(event: ApiEvent): FestEvent {
  return {
    id: String(event.id),
    name: event.title,
    collegeName: event.college?.name ?? "",
    category: event.category?.name ?? "Technical",
    date: event.starts_at ?? event.created_at ?? "",
    registrations: event.registration_count ?? 0,
    revenue: 0,
    status: mapEventStatus(event),
    gradient: pick(GRADIENTS, event.id),
  };
}

function mapCollegeEventStatus(status: ApiEvent["status"]): CollegeEventStatus {
  switch (status) {
    case "draft":
      return "draft";
    case "live":
      return "live";
    case "completed":
      return "completed";
    case "cancelled":
      return "cancelled";
    case "archived":
      return "completed";
    default:
      return "upcoming";
  }
}

export function adaptCollegeEvent(event: ApiEvent): CollegeEvent {
  return {
    id: String(event.id),
    name: event.title,
    category: event.category?.name ?? "Technical",
    date: event.starts_at ?? event.created_at ?? "",
    venue: event.venue ?? "TBA",
    registrations: event.registration_count ?? 0,
    capacity: event.capacity ?? 0,
    revenue: 0,
    volunteers: 0,
    status: mapCollegeEventStatus(event.status),
    gradient: pick(GRADIENTS, event.id),
  };
}

/* ------------------------------------------------------------------ */
/* Registrations                                                       */
/* ------------------------------------------------------------------ */

const REG_STATUS: Record<string, Registration["status"]> = {
  pending: "pending",
  confirmed: "confirmed",
  checked_in: "confirmed",
  cancelled: "cancelled",
  refunded: "refunded",
};

export function adaptRegistration(registration: ApiRegistration): Registration {
  const attendeeName =
    registration.name ??
    registration.user?.name ??
    registration.attendee_details?.name ??
    "";
  const attendeeEmail = registration.email ?? registration.user?.email ?? "";

  return {
    id: String(registration.id),
    studentName: String(attendeeName),
    email: String(attendeeEmail),
    collegeName: registration.event?.college?.name ?? "",
    eventName: registration.event?.title ?? "",
    amount: 0,
    date: registration.created_at ?? "",
    status: REG_STATUS[registration.status] ?? "pending",
  };
}

/* ------------------------------------------------------------------ */
/* Payments                                                            */
/* ------------------------------------------------------------------ */

const PAY_STATUS: Record<string, Payment["status"]> = {
  pending: "pending",
  completed: "paid",
  failed: "failed",
  refunded: "paid",
};

export function adaptPayment(transaction: ApiTransaction): Payment {
  return {
    id: String(transaction.id),
    invoice: transaction.reference ?? `TX-${transaction.uuid.slice(0, 8).toUpperCase()}`,
    collegeName: transaction.user?.college?.name ?? "",
    amount: transaction.amount,
    date: transaction.paid_at ?? transaction.created_at ?? "",
    status: PAY_STATUS[transaction.status] ?? "pending",
    method: (transaction.payment_method ?? "Bank Transfer") as Payment["method"],
  };
}

/* ------------------------------------------------------------------ */
/* Users / admins                                                      */
/* ------------------------------------------------------------------ */

export function adaptAdminUser(user: ApiUser): AdminUser {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    collegeName: user.college?.name ?? "—",
    role: user.roles?.[0] ?? "college_admin",
    status: user.is_active ? "active" : "blocked",
    lastActive: user.last_seen_at ?? user.created_at ?? "",
    joinedAt: user.created_at ?? "",
    avatarColor: getAvatarColor(user.id),
  };
}

export function adaptPlatformUser(user: ApiUser): PlatformUser {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    collegeName: user.college?.name ?? "—",
    role: (user.roles?.[0] ?? "Student") as PlatformUser["role"],
    registeredAt: user.created_at ?? "",
    status: user.is_active ? "active" : "blocked",
    avatarColor: getAvatarColor(user.id),
  };
}

/* ------------------------------------------------------------------ */
/* Volunteers                                                          */
/* ------------------------------------------------------------------ */

const VOLUNTEER_STATUS: Record<string, Volunteer["status"]> = {
  assigned: "onboarding",
  accepted: "active",
  completed: "inactive",
  cancelled: "inactive",
};

export function adaptVolunteer(volunteer: ApiVolunteer): Volunteer {
  return {
    id: String(volunteer.id),
    name: volunteer.user?.name ?? "",
    email: volunteer.user?.email ?? "",
    collegeName: volunteer.user?.college?.name ?? "",
    eventName: volunteer.event?.title ?? "",
    hours: volunteer.hours_volunteered ?? 0,
    status: VOLUNTEER_STATUS[volunteer.status ?? ""] ?? "onboarding",
    avatarColor: getAvatarColor(volunteer.id),
  };
}

const ENTRY_STATUS: Record<string, VolunteerEntryStatus> = {
  present: "checked-in",
  late: "checked-in",
  excused: "checked-in",
};

export function adaptVolunteerEntry(attendance: ApiAttendance): VolunteerEntryRecord {
  return {
    id: String(attendance.id),
    ticketId: attendance.ticket_number ?? "—",
    studentName: attendance.attendee?.name ?? "",
    college: attendance.event?.college?.name ?? attendance.event?.title ?? "",
    entryTime: timeAgo(attendance.attended_at ?? attendance.created_at ?? ""),
    gate: attendance.event?.venue ?? "—",
    status: ENTRY_STATUS[attendance.status] ?? "checked-in",
    avatarColor: getAvatarColor(attendance.id),
  };
}

/* ------------------------------------------------------------------ */
/* Activity logs                                                       */
/* ------------------------------------------------------------------ */

const ACTIVITY_CATEGORY: Record<string, ActivityEntry["type"]> = {
  login: "system",
  logout: "system",
  college_created: "college",
  created: "system",
  updated: "system",
  deleted: "system",
  payment_recorded: "payment",
  registered: "event",
  check_in: "event",
  certificate_issued: "event",
  certificate_revoked: "event",
  published: "event",
  suspended: "admin",
  role_assigned: "admin",
};

export function adaptActivityEntry(log: ApiActivityLog): ActivityEntry {
  return {
    id: String(log.id),
    type: ACTIVITY_CATEGORY[log.type] ?? "system",
    title: log.type.replace(/_/g, " "),
    description: log.description ?? "",
    time: log.created_at ?? "",
  };
}

export function adaptActivityLog(log: ApiActivityLog): ActivityLogItem {
  return {
    id: String(log.id),
    actor: "",
    actorRole: "",
    action: log.type.replace(/_/g, " "),
    target: log.subject_type ? log.subject_type.split("\\").pop() ?? "" : "",
    category: ACTIVITY_CATEGORY[log.type] ?? "system",
    timestamp: log.created_at ?? "",
    ip: log.ip_address ?? "",
    status: "success",
  };
}

/* ------------------------------------------------------------------ */
/* Landing events                                                      */
/* ------------------------------------------------------------------ */

const LANDING_CATEGORIES: Array<LandingEvent["category"]> = [
  "Technical",
  "Cultural",
  "Workshop",
  "Sports",
  "Gaming",
  "Hackathon",
];

export function adaptLandingEvent(event: ApiEvent): LandingEvent {
  const category = LANDING_CATEGORIES.find(
    (candidate) => candidate.toLowerCase() === (event.category?.name ?? "").toLowerCase(),
  ) ?? "Technical";
  const gradient = pick(GRADIENTS, event.id);
  const tint = pick(TINTS, event.id);

  return {
    id: String(event.id),
    slug: event.slug,
    name: event.title,
    tagline: "",
    category,
    college: event.college?.name ?? "",
    city: event.college?.city ?? "",
    mode: "Offline",
    date: event.starts_at?.slice(0, 10) ?? "",
    startTime: formatClock(event.starts_at),
    endTime: formatClock(event.ends_at),
    venue: event.venue ?? "",
    capacity: event.capacity ?? 0,
    registered: event.registration_count ?? 0,
    fee: 0,
    gradient,
    tint,
    featured: event.is_featured ?? false,
    description: event.description ?? "",
    highlights: [],
    schedule: [],
    prizes: [],
    team: 1,
  };
}

function formatClock(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

export function adaptCategory(category: EventCategory): { value: string; label: string } {
  return { value: String(category.id), label: category.name };
}

/* ------------------------------------------------------------------ */
/* Analytics                                                           */
/* ------------------------------------------------------------------ */

const STAT_CONFIG: Record<
  string,
  { id: string; title: string; icon: string; tint: string; prefix?: string }
> = {
  total_colleges: { id: "stat-total-colleges", title: "Total Colleges", icon: "building", tint: "primary" },
  active_colleges: { id: "stat-active-colleges", title: "Active Colleges", icon: "check-circle", tint: "success" },
  total_events: { id: "stat-total-events", title: "Total Events", icon: "sparkles", tint: "info" },
  total_students: { id: "stat-total-students", title: "Total Students", icon: "users", tint: "warning" },
  total_registrations: { id: "stat-total-registrations", title: "Total Registrations", icon: "ticket", tint: "secondary" },
  total_revenue: { id: "stat-total-revenue", title: "Total Revenue", icon: "dollar", tint: "danger", prefix: "$" },
};

const REVENUE_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.info,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.danger,
];

export interface AnalyticsSummary {
  stats: DashboardStat[];
  registrationTrends: Record<"today" | "week" | "month" | "year", ChartPoint[]>;
  revenueBreakdown: DonutSlice[];
  collegeGrowth: GroupedBarPoint[];
}

export function adaptAnalytics(data: ApiAnalytics): AnalyticsSummary {
  const stats = Object.entries(STAT_CONFIG).map(([key, config]) => {
    const value = data.stats[key] ?? 0;
    const delta = data.deltas[key] ?? 0;

    return {
      ...config,
      value,
      delta: {
        value: Math.abs(delta),
        direction: delta >= 0 ? "up" : "down",
        label: "vs last month",
      },
    } satisfies DashboardStat;
  });

  return {
    stats,
    registrationTrends: data.registration_trends,
    revenueBreakdown: data.revenue_breakdown.map((slice, index) => ({
      name: slice.name,
      value: slice.value,
      color: REVENUE_COLORS[index % REVENUE_COLORS.length],
    })),
    collegeGrowth: data.college_growth,
  };
}

export { formatDate };
