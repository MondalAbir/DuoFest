import type {
  College,
  CollegeStatus,
  EventStatus,
  PaymentStatus,
  UserStatus,
} from "@/types";

export type StatusKey =
  | CollegeStatus
  | PaymentStatus
  | EventStatus
  | UserStatus
  | "confirmed"
  | "cancelled"
  | "refunded"
  | "published"
  | "draft"
  | "scheduled"
  | "ready"
  | "generating"
  | "onboarding"
  | "active"
  | "inactive"
  | "blocked"
  | "assigned"
  | "live"
  | "upcoming"
  | "completed"
  | "failed"
  | "paid"
  | "pending"
  | "trial"
  | "expired"
  | "success"
  | "warning"
  | "danger"
  | "checked-in"
  | "late"
  | "duplicate"
  | "rejected"
  | "attended"
  | "eligible"
  | "generated"
  | "sent"
  | "downloaded"
  | "current";

export function searchInArray<T>(
  items: T[],
  query: string,
  keys: Array<keyof T>,
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) =>
    keys.some((key) => {
      const value = item[key];
      return String(value).toLowerCase().includes(q);
    }),
  );
}

export function filterByStatus<T>(
  items: T[],
  key: keyof T,
  status: string,
): T[] {
  if (!status || status === "all") return items;
  return items.filter((item) => item[key] === status);
}

export function hasActiveCollege(c: College): boolean {
  return c.status === "active";
}
