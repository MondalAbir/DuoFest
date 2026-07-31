export type ScanResultKind = "allowed" | "invalid" | "duplicate";

export interface TicketRecord {
  ticketId: string;
  studentName: string;
  college: string;
  eventName: string;
  avatarColor: string;
  status: "valid" | "used" | "invalid";
  checkedInAt?: string;
}

export interface ScanOutcome {
  kind: ScanResultKind;
  ticketId: string;
  studentName: string;
  college: string;
  eventName: string;
  gate: string;
  avatarColor: string;
  entryTime: string;
  previousEntryTime?: string;
  reason?: string;
}

export function formatClockTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export const volunteerTickets: TicketRecord[] = [
  {
    ticketId: "DF-8819",
    studentName: "Dev Malhotra",
    college: "Techno India University",
    eventName: "TechNova Hackathon 2026",
    avatarColor: "#3B82F6",
    status: "valid",
  },
  {
    ticketId: "DF-8820",
    studentName: "Ananya Singh",
    college: "Brainware University",
    eventName: "TechNova Hackathon 2026",
    avatarColor: "#5B5CEB",
    status: "used",
    checkedInAt: "10:42 AM",
  },
  {
    ticketId: "DF-8826",
    studentName: "Aarav Kapoor",
    college: "Brainware University",
    eventName: "TechNova Hackathon 2026",
    avatarColor: "#6366F1",
    status: "valid",
  },
  {
    ticketId: "DF-8835",
    studentName: "Tanya Verma",
    college: "Brainware University",
    eventName: "TechNova Hackathon 2026",
    avatarColor: "#EC4899",
    status: "valid",
  },
  {
    ticketId: "DF-8841",
    studentName: "Rohan Gupta",
    college: "JIS Institute of Technology",
    eventName: "TechNova Hackathon 2026",
    avatarColor: "#14B8A6",
    status: "valid",
  },
  {
    ticketId: "DF-8843",
    studentName: "Sara Fernandes",
    college: "St. Xavier's College",
    eventName: "TechNova Hackathon 2026",
    avatarColor: "#22C55E",
    status: "valid",
  },
  {
    ticketId: "DF-8849",
    studentName: "Rohit Jain",
    college: "Brainware University",
    eventName: "TechNova Hackathon 2026",
    avatarColor: "#F97316",
    status: "valid",
  },
  {
    ticketId: "DF-8860",
    studentName: "Priya Das",
    college: "Jadavpur University",
    eventName: "TechNova Hackathon 2026",
    avatarColor: "#F59E0B",
    status: "valid",
  },
  {
    ticketId: "DF-8867",
    studentName: "Ishita Bansal",
    college: "Heritage Institute of Technology",
    eventName: "TechNova Hackathon 2026",
    avatarColor: "#8B5CF6",
    status: "invalid",
  },
  {
    ticketId: "DF-9910",
    studentName: "Unknown",
    college: "—",
    eventName: "TechNova Hackathon 2026",
    avatarColor: "#EF4444",
    status: "invalid",
  },
  {
    ticketId: "DF-9951",
    studentName: "Meera Pillai",
    college: "Vivekananda College",
    eventName: "TechNova Hackathon 2026",
    avatarColor: "#22C55E",
    status: "used",
    checkedInAt: "09:33 AM",
  },
];

export const SIMULATED_SCAN_ORDER: string[] = [
  "DF-8843",
  "DF-9910",
  "DF-8819",
  "DF-8820",
  "DF-8841",
  "DF-8867",
  "DF-8849",
  "DF-9951",
];

export function lookupTicket(ticketId: string): ScanOutcome {
  const id = ticketId.trim().toUpperCase();
  const ticket = volunteerTickets.find((t) => t.ticketId === id);

  if (!ticket) {
    return {
      kind: "invalid",
      ticketId: id || "—",
      studentName: "Unknown",
      college: "—",
      eventName: VOLUNTEER_EVENT_NAME,
      gate: VOLUNTEER_GATE,
      avatarColor: "#EF4444",
      entryTime: formatClockTime(new Date()),
      reason: "No ticket found for this ID.",
    };
  }

  const base = {
    ticketId: ticket.ticketId,
    studentName: ticket.studentName,
    college: ticket.college,
    eventName: ticket.eventName,
    gate: VOLUNTEER_GATE,
    avatarColor: ticket.avatarColor,
    entryTime: formatClockTime(new Date()),
  };

  if (ticket.status === "invalid") {
    return {
      ...base,
      kind: "invalid" as const,
      reason: "This ticket has been flagged as invalid.",
    };
  }

  if (ticket.status === "used") {
    return {
      ...base,
      kind: "duplicate" as const,
      previousEntryTime: ticket.checkedInAt ?? base.entryTime,
      reason: "Ticket already checked in at this gate.",
    };
  }

  return { ...base, kind: "allowed" as const };
}

export const VOLUNTEER_EVENT_NAME = "TechNova Hackathon 2026";
export const VOLUNTEER_GATE = "Main Gate";
