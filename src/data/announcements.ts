import type { Announcement, Report } from "@/types";

export const announcements: Announcement[] = [
  {
    id: "ann-001",
    title: "New Payout Schedule for August 2026",
    summary:
      "Event payouts for the month of August will be processed on the 5th and 20th. Colleges must submit valid banking details by the 3rd.",
    audience: "Admins",
    author: "Super Admin",
    createdAt: "2026-07-31T08:00:00",
    pinned: true,
    status: "published",
  },
  {
    id: "ann-002",
    title: "Platform Maintenance on Aug 8, 2:00 AM IST",
    summary:
      "DuoFest will undergo scheduled maintenance for up to 45 minutes. No registrations or payments can be made during this window.",
    audience: "All Colleges",
    author: "Super Admin",
    createdAt: "2026-07-30T17:30:00",
    pinned: false,
    status: "scheduled",
  },
  {
    id: "ann-003",
    title: "Fest Season Checklist 2026",
    summary:
      "A quick guide covering event approvals, volunteer badges, QR check-in setup and emergency contacts before your fest goes live.",
    audience: "Organizers",
    author: "Operations Team",
    createdAt: "2026-07-28T11:15:00",
    pinned: false,
    status: "published",
  },
  {
    id: "ann-004",
    title: "Volunteer Onboarding Tutorial",
    summary:
      "New training module for college volunteers covering check-in flow, dispute handling and safety protocols.",
    audience: "Students",
    author: "Operations Team",
    createdAt: "2026-07-25T09:45:00",
    pinned: false,
    status: "published",
  },
  {
    id: "ann-005",
    title: "Ticket Pricing Update (Draft)",
    summary:
      "Proposal to revise the base ticket price bands across categories for the upcoming season.",
    audience: "Admins",
    author: "Finance Team",
    createdAt: "2026-07-22T16:20:00",
    pinned: false,
    status: "draft",
  },
];

export const reports: Report[] = [
  {
    id: "rep-001",
    title: "Monthly Revenue Report",
    type: "Finance",
    generatedAt: "2026-07-31T06:00:00",
    rows: 12840,
    size: "4.2 MB",
    status: "ready",
  },
  {
    id: "rep-002",
    title: "College Performance Summary",
    type: "Operations",
    generatedAt: "2026-07-30T18:00:00",
    rows: 248,
    size: "680 KB",
    status: "ready",
  },
  {
    id: "rep-003",
    title: "Event Registration Analytics",
    type: "Analytics",
    generatedAt: "2026-07-30T09:00:00",
    rows: 52310,
    size: "9.1 MB",
    status: "ready",
  },
  {
    id: "rep-004",
    title: "Volunteer Hours Ledger",
    type: "HR",
    generatedAt: "2026-07-29T14:30:00",
    rows: 3890,
    size: "1.1 MB",
    status: "generating",
  },
  {
    id: "rep-005",
    title: "Payment Failure Analysis",
    type: "Finance",
    generatedAt: "2026-07-28T11:00:00",
    rows: 342,
    size: "210 KB",
    status: "ready",
  },
];
