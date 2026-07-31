export interface VolunteerProfileInfo {
  name: string;
  id: string;
  email: string;
  phone: string;
  eventName: string;
  gate: string;
  shift: string;
  joinedAt: string;
  avatarColor: string;
  todayScans: number;
  weeklyScans: number;
}

export const volunteerProfile: VolunteerProfileInfo = {
  name: "Sneha Patel",
  id: "VLD-0231",
  email: "sneha.patel@brainware.edu",
  phone: "+91 90001 11223",
  eventName: "TechNova Hackathon 2026",
  gate: "Main Gate",
  shift: "08:00 AM – 02:00 PM",
  joinedAt: "2026-01-12",
  avatarColor: "#5B5CEB",
  todayScans: 1286,
  weeklyScans: 6842,
};
