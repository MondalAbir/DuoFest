import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  CalendarDays,
  ClipboardList,
  FileBarChart2,
  LayoutDashboard,
  Megaphone,
  Settings,
  ShieldCheck,
  Ticket,
  UserCheck,
  Users,
  Wallet,
  ScrollText,
} from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
      { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
      { label: "Reports", path: "/admin/reports", icon: FileBarChart2 },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Colleges", path: "/admin/colleges", icon: Building2 },
      { label: "College Admins", path: "/admin/admins", icon: ShieldCheck },
      { label: "All Events", path: "/admin/events", icon: CalendarDays },
      { label: "Registrations", path: "/admin/registrations", icon: Ticket },
      { label: "Users", path: "/admin/users", icon: Users },
      { label: "Volunteers", path: "/admin/volunteers", icon: UserCheck },
      { label: "Payments", path: "/admin/payments", icon: Wallet },
    ],
  },
  {
    label: "Engagement",
    items: [
      { label: "Announcements", path: "/admin/announcements", icon: Megaphone },
      { label: "Activity Logs", path: "/admin/activity-logs", icon: ScrollText },
      { label: "Settings", path: "/admin/settings", icon: Settings },
    ],
  },
];

export const allNavItems: NavItem[] = NAV_SECTIONS.flatMap(
  (section) => section.items,
);

export const routeTitles: Record<string, string> = Object.fromEntries(
  allNavItems.map((item) => [item.path, item.label]),
);
