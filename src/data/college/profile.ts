export type LoginStatus = "success" | "warning" | "danger";

export interface CollegeLoginRecord {
  id: string;
  device: string;
  location: string;
  ip: string;
  time: string;
  status: LoginStatus;
}

export interface CollegeActiveDevice {
  id: string;
  name: string;
  browser: string;
  location: string;
  lastActive: string;
  current?: boolean;
}

export const collegeLoginHistory: CollegeLoginRecord[] = [
  {
    id: "lh-001",
    device: "MacBook Pro 14",
    location: "Kolkata, India",
    ip: "103.95.62.18",
    time: "2026-07-31T09:12:00",
    status: "success",
  },
  {
    id: "lh-002",
    device: "iPhone 15",
    location: "Kolkata, India",
    ip: "103.95.62.22",
    time: "2026-07-31T08:47:00",
    status: "success",
  },
  {
    id: "lh-003",
    device: "Windows PC",
    location: "Kolkata, India",
    ip: "49.36.10.4",
    time: "2026-07-30T21:30:00",
    status: "warning",
  },
  {
    id: "lh-004",
    device: "MacBook Pro 14",
    location: "Kolkata, India",
    ip: "103.95.62.18",
    time: "2026-07-30T09:05:00",
    status: "success",
  },
  {
    id: "lh-005",
    device: "Android Device",
    location: "Mumbai, India",
    ip: "203.110.242.9",
    time: "2026-07-29T23:14:00",
    status: "danger",
  },
  {
    id: "lh-006",
    device: "iPhone 15",
    location: "Kolkata, India",
    ip: "103.95.62.22",
    time: "2026-07-29T08:58:00",
    status: "success",
  },
];

export const collegeActiveDevices: CollegeActiveDevice[] = [
  {
    id: "ad-001",
    name: "MacBook Pro 14",
    browser: "Chrome · macOS",
    location: "Kolkata, India",
    lastActive: "Active now",
    current: true,
  },
  {
    id: "ad-002",
    name: "iPhone 15",
    browser: "Safari · iOS",
    location: "Kolkata, India",
    lastActive: "32 min ago",
  },
  {
    id: "ad-003",
    name: "Windows PC",
    browser: "Edge · Windows 11",
    location: "Kolkata, India",
    lastActive: "Yesterday",
  },
];
