import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, QrCode, ScrollText, UserCircle } from "lucide-react";

export interface VolunteerNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const VOLUNTEER_NAV_ITEMS: VolunteerNavItem[] = [
  { label: "Dashboard", path: "/admin/volunteer/dashboard", icon: LayoutDashboard },
  { label: "Scan", path: "/admin/volunteer/scan", icon: QrCode },
  { label: "Entries", path: "/admin/volunteer/entries", icon: ScrollText },
  { label: "Profile", path: "/admin/volunteer/profile", icon: UserCircle },
];

export const VOLUNTEER_BOTTOM_NAV_ITEMS = VOLUNTEER_NAV_ITEMS;

export const volunteerRouteTitles: Record<string, string> = Object.fromEntries(
  VOLUNTEER_NAV_ITEMS.map((item) => [item.path, item.label]),
);
