export type VolunteerEntryStatus = "checked-in" | "rejected" | "duplicate";

export interface VolunteerEntryRecord {
  id: string;
  ticketId: string;
  studentName: string;
  college: string;
  entryTime: string;
  gate: string;
  status: VolunteerEntryStatus;
  avatarColor: string;
}

export const volunteerEntries: VolunteerEntryRecord[] = [
  {
    id: "ve-001",
    ticketId: "DF-8820",
    studentName: "Ananya Singh",
    college: "Brainware University",
    entryTime: "10:42 AM",
    gate: "Main Gate",
    status: "checked-in",
    avatarColor: "#5B5CEB",
  },
  {
    id: "ve-002",
    ticketId: "DF-8841",
    studentName: "Rohan Gupta",
    college: "JIS Institute of Technology",
    entryTime: "10:38 AM",
    gate: "Main Gate",
    status: "checked-in",
    avatarColor: "#14B8A6",
  },
  {
    id: "ve-003",
    ticketId: "DF-8802",
    studentName: "Kabir Roy",
    college: "St. Xavier's College",
    entryTime: "10:31 AM",
    gate: "Main Gate",
    status: "checked-in",
    avatarColor: "#10B981",
  },
  {
    id: "ve-004",
    ticketId: "DF-9910",
    studentName: "Unknown",
    college: "—",
    entryTime: "10:24 AM",
    gate: "Main Gate",
    status: "rejected",
    avatarColor: "#EF4444",
  },
  {
    id: "ve-005",
    ticketId: "DF-8820",
    studentName: "Ananya Singh",
    college: "Brainware University",
    entryTime: "10:20 AM",
    gate: "Main Gate",
    status: "duplicate",
    avatarColor: "#5B5CEB",
  },
  {
    id: "ve-006",
    ticketId: "DF-8835",
    studentName: "Tanya Verma",
    college: "Brainware University",
    entryTime: "10:12 AM",
    gate: "Main Gate",
    status: "checked-in",
    avatarColor: "#EC4899",
  },
  {
    id: "ve-007",
    ticketId: "DF-8867",
    studentName: "Ishita Bansal",
    college: "Heritage Institute of Technology",
    entryTime: "09:58 AM",
    gate: "Main Gate",
    status: "rejected",
    avatarColor: "#8B5CF6",
  },
  {
    id: "ve-008",
    ticketId: "DF-8819",
    studentName: "Dev Malhotra",
    college: "Techno India University",
    entryTime: "09:47 AM",
    gate: "Main Gate",
    status: "checked-in",
    avatarColor: "#3B82F6",
  },
  {
    id: "ve-009",
    ticketId: "DF-8849",
    studentName: "Rohit Jain",
    college: "Brainware University",
    entryTime: "09:40 AM",
    gate: "Main Gate",
    status: "checked-in",
    avatarColor: "#F97316",
  },
  {
    id: "ve-010",
    ticketId: "DF-9951",
    studentName: "Meera Pillai",
    college: "Vivekananda College",
    entryTime: "09:33 AM",
    gate: "Main Gate",
    status: "duplicate",
    avatarColor: "#22C55E",
  },
  {
    id: "ve-011",
    ticketId: "DF-8860",
    studentName: "Priya Das",
    college: "Jadavpur University",
    entryTime: "09:26 AM",
    gate: "Main Gate",
    status: "checked-in",
    avatarColor: "#F59E0B",
  },
  {
    id: "ve-012",
    ticketId: "DF-8826",
    studentName: "Aarav Kapoor",
    college: "Brainware University",
    entryTime: "09:18 AM",
    gate: "Main Gate",
    status: "checked-in",
    avatarColor: "#6366F1",
  },
];

export const entryStats = {
  total: volunteerEntries.length,
  successful: volunteerEntries.filter((e) => e.status === "checked-in").length,
  rejected: volunteerEntries.filter((e) => e.status === "rejected").length,
  duplicate: volunteerEntries.filter((e) => e.status === "duplicate").length,
};
