export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export const USER_ROLES = [
  "super_admin",
  "college_admin",
  "event_manager",
  "volunteer",
  "student",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const EVENT_STATUSES = [
  "draft",
  "published",
  "upcoming",
  "live",
  "completed",
  "archived",
  "cancelled",
] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export const REGISTRATION_STATUSES = [
  "pending",
  "confirmed",
  "checked_in",
  "cancelled",
  "refunded",
] as const;

export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export const PAYMENT_STATUSES = ["pending", "completed", "failed", "refunded"] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const VOLUNTEER_STATUSES = [
  "assigned",
  "accepted",
  "completed",
  "cancelled",
] as const;

export type VolunteerStatus = (typeof VOLUNTEER_STATUSES)[number];

export const CERTIFICATE_STATUSES = ["issued", "revoked"] as const;

export type CertificateStatus = (typeof CERTIFICATE_STATUSES)[number];

export const ATTENDANCE_STATUSES = ["present", "late", "excused"] as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export interface College {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  is_active: boolean;
  events_count?: number;
  users_count?: number;
  created_at: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  phone: string | null;
  college_id: number | null;
  college?: College | null;
  roles?: string[];
  is_active: boolean;
  blocked_at: string | null;
  last_seen_at: string | null;
  created_at: string | null;
}

export interface AuthUser {
  user: User;
  token: string;
  token_type: string;
  expires_at: string | null;
  permissions: string[];
}

export interface EventCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface EventMedia {
  id: number;
  event_id: number;
  type: "banner" | "gallery";
  url: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string | null;
}

export interface EventSponsor {
  id: number;
  event_id: number;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  tier: string | null;
  sort_order: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface FestEvent {
  id: number;
  college_id: number | null;
  college?: College | null;
  organizer_id: number | null;
  organizer?: User | null;
  category_id: number | null;
  category?: EventCategory | null;
  title: string;
  slug: string;
  description: string | null;
  venue: string | null;
  starts_at: string | null;
  ends_at: string | null;
  status: EventStatus;
  phase: string;
  archived_from: string | null;
  capacity: number | null;
  registration_count: number;
  remaining_capacity?: number | null;
  requires_approval: boolean;
  registration_enabled: boolean;
  registration_open_at: string | null;
  registration_closes_at: string | null;
  is_featured: boolean;
  cover_image_url: string | null;
  banner?: EventMedia[];
  gallery?: EventMedia[];
  sponsors?: EventSponsor[];
  created_at: string | null;
  updated_at: string | null;
}

export interface Registration {
  id: number;
  event_id: number;
  event?: FestEvent | null;
  user_id: number | null;
  user?: User | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  ticket_number: string | null;
  status: RegistrationStatus;
  attendee_details: Record<string, unknown> | null;
  ticket_issued_at: string | null;
  ticket_qr_url?: string;
  ticket_pdf_url?: string;
  checked_in_at: string | null;
  checked_in_by: number | null;
  created_at: string | null;
}

export interface Transaction {
  id: number;
  uuid: string;
  registration_id: number | null;
  event_id: number | null;
  user_id: number | null;
  user?: User | null;
  amount: number;
  currency: string;
  payment_method: string | null;
  reference: string | null;
  status: PaymentStatus;
  paid_at: string | null;
  created_at: string | null;
}

export interface Volunteer {
  id: number;
  uuid: string;
  event_id: number;
  event?: FestEvent | null;
  user_id: number;
  user?: User | null;
  assigned_by: number | null;
  role: string | null;
  shift_start_at: string | null;
  shift_end_at: string | null;
  hours_volunteered: number;
  status: VolunteerStatus | null;
  notes: string | null;
  created_at: string | null;
}

export interface Attendance {
  id: number;
  uuid: string;
  event_id: number;
  event?: FestEvent | null;
  registration_id: number | null;
  registration?: Registration | null;
  user_id: number | null;
  attendee: { name: string; email: string } | null;
  ticket_number: string | null;
  checked_in_by: number | null;
  attended_at: string | null;
  status: AttendanceStatus;
  created_at: string | null;
}

export interface Certificate {
  id: number;
  registration_id: number | null;
  user_id: number | null;
  user?: User | null;
  attendee: { name: string; email: string } | null;
  certificate_number: string;
  template: string;
  status: CertificateStatus;
  file_url: string | null;
  issued_at: string | null;
  expires_at: string | null;
  emailed_at: string | null;
  created_at: string | null;
}

export interface ActivityLog {
  id: number;
  type: string;
  description: string | null;
  subject_type: string | null;
  subject_id: number | null;
  causer_id: number | null;
  properties: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string | null;
}

export interface ReportColumn {
  key: string;
  label: string;
}

export interface ReportResult {
  type: string;
  title: string;
  filters: Record<string, string | number>;
  columns: ReportColumn[];
  rows: Array<Record<string, string | number | null>>;
  summary: Record<string, string | number | null>;
}

export interface AnalyticsTrendPoint {
  label: string;
  value: number;
}

export interface AnalyticsRevenueSlice {
  name: string;
  value: number;
}

export interface AnalyticsCollegeGrowthPoint {
  label: string;
  colleges: number;
  students: number;
}

export interface AnalyticsDashboard {
  stats: Record<string, number>;
  deltas: Record<string, number>;
  registration_trends: Record<"today" | "week" | "month" | "year", AnalyticsTrendPoint[]>;
  revenue_breakdown: AnalyticsRevenueSlice[];
  college_growth: AnalyticsCollegeGrowthPoint[];
}

export interface ScanResult {
  status: "valid" | "invalid_ticket" | "cancelled_ticket" | "already_entered";
  registration: Registration | null;
}

export interface VolunteerProfile {
  user: User;
  assigned_events_count: number;
  today_entries_count: number;
}

export interface VolunteerAssignResult {
  assigned: number[];
  skipped: number[];
}
