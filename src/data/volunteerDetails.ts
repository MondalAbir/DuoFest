import type { Volunteer } from "@/types";
import { events } from "@/data/events";

export type VolunteerAssignmentStatus =
  | "confirmed"
  | "completed"
  | "upcoming"
  | "cancelled";

export interface VolunteerEventAssignment {
  id: string;
  eventName: string;
  date: string;
  role: string;
  status: VolunteerAssignmentStatus;
}

export interface VolunteerShift {
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  duty: string;
  onDuty: boolean;
}

export type VolunteerActivityType = "event" | "scan" | "shift" | "reward" | "system";

export interface VolunteerActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: VolunteerActivityType;
}

export interface VolunteerDetails {
  phone: string;
  joinedAt: string;
  assignedEvents: VolunteerEventAssignment[];
  todayShift: VolunteerShift | null;
  qrScans: {
    total: number;
    unique: number;
    thisWeek: number;
  };
  attendance: {
    attended: number;
    total: number;
    rate: number;
  };
  performance: {
    rating: number;
    completedShifts: number;
    onTimeRate: number;
    rewards: number;
  };
  recentActivity: VolunteerActivityItem[];
}

function hashCode(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seeded(seed: string): () => number {
  let state = hashCode(seed);
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const ROLES = [
  "Registration Desk",
  "Crowd Management",
  "Stage Coordination",
  "Hospitality & Guide",
  "Logistics Support",
  "Media & Coverage",
  "Check-in Booth",
];

const VENUES = [
  "Main Auditorium",
  "Open Air Theatre",
  "Sports Arena",
  "Convention Centre",
  "Innovation Hub",
  "Cultural Complex",
];

const DUTIES = [
  "Check-in & badge scanning",
  "Entry gate verification",
  "Vendor coordination",
  "Ushering & seat guidance",
  "Stage backstage support",
  "Feedback & helpdesk",
];

const ACTIVITY_TEMPLATES: Array<{
  type: VolunteerActivityType;
  title: string;
  description: string;
}> = [
  { type: "scan", title: "QR badge scanned", description: "Verified 12 attendee entries at the registration desk." },
  { type: "shift", title: "Shift completed", description: "Logged 4 hours for the evening slot." },
  { type: "event", title: "Assigned to event", description: "Added to the event crew for stage coordination." },
  { type: "reward", title: "Recognition earned", description: "Received an appreciation note from the event lead." },
  { type: "scan", title: "Attendance marked", description: "Checked in for the day's shift via QR." },
  { type: "system", title: "Profile updated", description: "Contact and shift preferences were updated." },
  { type: "shift", title: "Shift swapped", description: "Swapped the evening shift with a teammate." },
];

const TIME_AGO = ["2 min ago", "48 min ago", "1h ago", "3h ago", "Yesterday", "2 days ago", "3 days ago"];

export function getVolunteerDetails(volunteer: Volunteer): VolunteerDetails {
  const random = seeded(volunteer.id);
  const pick = <T,>(items: T[]): T =>
    items[Math.floor(random() * items.length)];

  const ownEvent = events.find((event) => event.name === volunteer.eventName);
  const otherEvents = events.filter((event) => event.name !== volunteer.eventName);

  const assignedCount = 2 + Math.floor(random() * 2);
  const primaryAssignment: VolunteerEventAssignment = {
    id: `volass-${volunteer.id}-1`,
    eventName: volunteer.eventName,
    date: ownEvent?.date ?? "2026-08-14",
    role: pick(ROLES),
    status:
      volunteer.status === "inactive"
        ? "completed"
        : ownEvent?.status === "completed"
          ? "completed"
          : ownEvent?.status === "live"
            ? "confirmed"
            : "upcoming",
  };

  const extraAssignments: VolunteerEventAssignment[] = Array.from(
    { length: assignedCount },
    (_, index) => {
      const event = otherEvents[(hashCode(volunteer.id) + index) % otherEvents.length];
      const statuses: VolunteerAssignmentStatus[] = [
        "completed",
        "completed",
        "confirmed",
        "cancelled",
      ];
      return {
        id: `volass-${volunteer.id}-${index + 2}`,
        eventName: event.name,
        date: event.date,
        role: pick(ROLES),
        status: statuses[index % statuses.length],
      };
    },
  );

  const totalScans = 25 + Math.floor(random() * 110);
  const uniqueScans = Math.round(totalScans * (0.6 + random() * 0.25));
  const totalEvents = 10 + Math.floor(random() * 6);
  const rate = 70 + Math.floor(random() * 28);
  const attended = Math.round((rate / 100) * totalEvents);
  const rating = Math.round((3.5 + random() * 1.5) * 10) / 10;

  const todayShift: VolunteerShift | null =
    volunteer.status === "inactive" || volunteer.status === "onboarding"
      ? null
      : {
          date: new Date().toISOString().slice(0, 10),
          startTime: "09:00 AM",
          endTime: "01:00 PM",
          venue: pick(VENUES),
          duty: pick(DUTIES),
          onDuty: volunteer.status === "active",
        };

  const recentActivity: VolunteerActivityItem[] = Array.from(
    { length: 6 },
    (_, index) => {
      const template = ACTIVITY_TEMPLATES[
        (hashCode(volunteer.id) + index) % ACTIVITY_TEMPLATES.length
      ];
      return {
        id: `volact-${volunteer.id}-${index + 1}`,
        title: template.title,
        description: template.description,
        time: TIME_AGO[(hashCode(volunteer.id) + index) % TIME_AGO.length],
        type: template.type,
      };
    },
  );

  return {
    phone: `+91 9${(8000 + Math.floor(random() * 1900))} ${(10000 + Math.floor(random() * 89999))}`,
    joinedAt: "2026-02-10",
    assignedEvents: [primaryAssignment, ...extraAssignments],
    todayShift,
    qrScans: {
      total: totalScans,
      unique: uniqueScans,
      thisWeek: 3 + Math.floor(random() * 14),
    },
    attendance: {
      attended,
      total: totalEvents,
      rate,
    },
    performance: {
      rating,
      completedShifts: 8 + Math.floor(random() * 24),
      onTimeRate: 82 + Math.floor(random() * 17),
      rewards: 1 + Math.floor(random() * 5),
    },
    recentActivity,
  };
}
