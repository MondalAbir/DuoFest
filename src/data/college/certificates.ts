export type CollegeCertificateStatus = "eligible" | "generated" | "sent" | "downloaded";
export type CollegeEmailStatus = "sent" | "failed" | "pending";

export interface CollegeCertificate {
  id: string;
  studentName: string;
  eventName: string;
  attendance: number;
  certificateStatus: CollegeCertificateStatus;
  emailStatus: CollegeEmailStatus;
  avatarColor: string;
  issuedOn: string;
}

export const collegeCertificates: CollegeCertificate[] = [
  {
    id: "cc-001",
    studentName: "Ananya Singh",
    eventName: "TechNova Hackathon 2025",
    attendance: 96,
    certificateStatus: "downloaded",
    emailStatus: "sent",
    avatarColor: "#5B5CEB",
    issuedOn: "2025-08-20",
  },
  {
    id: "cc-002",
    studentName: "Rohan Gupta",
    eventName: "AI & ML Bootcamp",
    attendance: 88,
    certificateStatus: "sent",
    emailStatus: "sent",
    avatarColor: "#14B8A6",
    issuedOn: "2026-08-06",
  },
  {
    id: "cc-003",
    studentName: "Kabir Roy",
    eventName: "Battle of Bands",
    attendance: 100,
    certificateStatus: "downloaded",
    emailStatus: "sent",
    avatarColor: "#10B981",
    issuedOn: "2026-07-29",
  },
  {
    id: "cc-004",
    studentName: "Arjun Mehta",
    eventName: "Inter-College Athletics Meet",
    attendance: 92,
    certificateStatus: "generated",
    emailStatus: "pending",
    avatarColor: "#8B5CF6",
    issuedOn: "2026-08-10",
  },
  {
    id: "cc-005",
    studentName: "Tanya Verma",
    eventName: "Cultural Extravaganza",
    attendance: 90,
    certificateStatus: "sent",
    emailStatus: "sent",
    avatarColor: "#EC4899",
    issuedOn: "2026-08-01",
  },
  {
    id: "cc-006",
    studentName: "Dev Malhotra",
    eventName: "Robo Wars Championship",
    attendance: 84,
    certificateStatus: "eligible",
    emailStatus: "pending",
    avatarColor: "#3B82F6",
    issuedOn: "2026-07-19",
  },
  {
    id: "cc-007",
    studentName: "Yash Agarwal",
    eventName: "AI & ML Bootcamp",
    attendance: 95,
    certificateStatus: "generated",
    emailStatus: "pending",
    avatarColor: "#F97316",
    issuedOn: "2026-08-06",
  },
  {
    id: "cc-008",
    studentName: "Meera Pillai",
    eventName: "Cultural Extravaganza",
    attendance: 78,
    certificateStatus: "eligible",
    emailStatus: "pending",
    avatarColor: "#22C55E",
    issuedOn: "2026-08-01",
  },
  {
    id: "cc-009",
    studentName: "Aarav Kapoor",
    eventName: "TechNova Hackathon 2025",
    attendance: 100,
    certificateStatus: "downloaded",
    emailStatus: "sent",
    avatarColor: "#6366F1",
    issuedOn: "2025-08-20",
  },
  {
    id: "cc-010",
    studentName: "Sneha Nair",
    eventName: "TechNova Hackathon 2025",
    attendance: 91,
    certificateStatus: "sent",
    emailStatus: "failed",
    avatarColor: "#06B6D4",
    issuedOn: "2025-08-20",
  },
  {
    id: "cc-011",
    studentName: "Ishita Bansal",
    eventName: "Poetry Slam & Storytelling",
    attendance: 100,
    certificateStatus: "eligible",
    emailStatus: "pending",
    avatarColor: "#EF4444",
    issuedOn: "2026-07-23",
  },
  {
    id: "cc-012",
    studentName: "Kabir Roy",
    eventName: "Startup Pitch Fest",
    attendance: 97,
    certificateStatus: "generated",
    emailStatus: "failed",
    avatarColor: "#10B981",
    issuedOn: "2026-07-31",
  },
];
