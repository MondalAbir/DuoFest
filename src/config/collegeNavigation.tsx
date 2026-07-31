import type { LucideIcon } from "lucide-react";
import {
  Award,
  BarChart3,
  CalendarDays,
  CheckSquare,
  GraduationCap,
  HandCoins,
  Images,
  LayoutDashboard,
  Megaphone,
  PlusCircle,
  QrCode,
  Settings,
  Ticket,
  UserCircle,
  Users,
} from "lucide-react";

export interface CollegeNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface CollegeNavSection {
  label: string;
  items: CollegeNavItem[];
}

export const COLLEGE_NAV_SECTIONS: CollegeNavSection[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", path: "/admin/college", icon: LayoutDashboard }],
  },
  {
    label: "Event Management",
    items: [
      { label: "Events", path: "/admin/college/events", icon: CalendarDays },
      { label: "Create Event", path: "/admin/college/events/create", icon: PlusCircle },
      { label: "My Events", path: "/admin/college/my-events", icon: CheckSquare },
    ],
  },
  {
    label: "Registrations",
    items: [
      { label: "Registrations", path: "/admin/college/registrations", icon: Ticket },
      { label: "Check-in (QR Entry)", path: "/admin/college/check-in", icon: QrCode },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Volunteers", path: "/admin/college/volunteers", icon: Users },
      { label: "Students", path: "/admin/college/students", icon: GraduationCap },
    ],
  },
  {
    label: "Other",
    items: [
      { label: "Certificates", path: "/admin/college/certificates", icon: Award },
      { label: "Sponsors", path: "/admin/college/sponsors", icon: HandCoins },
      { label: "Gallery", path: "/admin/college/gallery", icon: Images },
      { label: "Announcements", path: "/admin/college/announcements", icon: Megaphone },
      { label: "Reports", path: "/admin/college/reports", icon: BarChart3 },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Settings", path: "/admin/college/settings", icon: Settings },
      { label: "Profile", path: "/admin/college/profile", icon: UserCircle },
    ],
  },
];

export const collegeNavItems: CollegeNavItem[] = COLLEGE_NAV_SECTIONS.flatMap(
  (section) => section.items,
);

export const collegeRouteTitles: Record<string, string> = Object.fromEntries(
  collegeNavItems.map((item) => [item.path, item.label]),
);
