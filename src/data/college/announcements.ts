export type CollegeAnnouncementTone = "event" | "info" | "reward" | "alert";

export interface CollegeAnnouncement {
  id: string;
  title: string;
  description: string;
  time: string;
  tone: CollegeAnnouncementTone;
}

export type CollegeAnnouncementAudience =
  | "All Participants"
  | "Volunteers"
  | "Specific Event"
  | "Registered Students";

export interface CollegeAnnouncementPlan {
  id: string;
  title: string;
  audience: CollegeAnnouncementAudience;
  event?: string;
  scheduledAt: string;
  status: "scheduled" | "sent";
  tone: CollegeAnnouncementTone;
}

export const collegeAnnouncementPlans: CollegeAnnouncementPlan[] = [
  {
    id: "ap-001",
    title: "Venue map for Cultural Extravaganza",
    audience: "All Participants",
    scheduledAt: "2026-08-02T10:00:00",
    status: "scheduled",
    tone: "info",
  },
  {
    id: "ap-002",
    title: "TechNova onboarding slots",
    audience: "Registered Students",
    event: "TechNova Hackathon 2026",
    scheduledAt: "2026-08-01T09:00:00",
    status: "scheduled",
    tone: "event",
  },
  {
    id: "ap-003",
    title: "Volunteer briefing for Athletics Meet",
    audience: "Volunteers",
    scheduledAt: "2026-07-31T16:00:00",
    status: "sent",
    tone: "alert",
  },
  {
    id: "ap-004",
    title: "Robo Wars safety inspection notice",
    audience: "Registered Students",
    event: "Robo Wars Championship",
    scheduledAt: "2026-07-30T11:00:00",
    status: "sent",
    tone: "event",
  },
];

export const collegeAnnouncements: CollegeAnnouncement[] = [
  {
    id: "ca-001",
    title: "TechNova Hackathon registrations open",
    description:
      "Pre-registration for the 48-hour hackathon is now live on the portal.",
    time: "2h ago",
    tone: "event",
  },
  {
    id: "ca-002",
    title: "Venue change for Battle of Bands",
    description:
      "The semi-finals move to the Open Air Theatre due to capacity.",
    time: "5h ago",
    tone: "alert",
  },
  {
    id: "ca-003",
    title: "Volunteer appreciation drive",
    description:
      "Top volunteers this month get certified and rewarded on Founders' Day.",
    time: "Yesterday",
    tone: "reward",
  },
  {
    id: "ca-004",
    title: "New sponsor onboarded",
    description:
      "Apex Financial joins as the Gold sponsor for Cultural Extravaganza.",
    time: "Yesterday",
    tone: "info",
  },
  {
    id: "ca-005",
    title: "Deadline reminder",
    description:
      "Submit event budgets for the autumn semester by Friday.",
    time: "2 days ago",
    tone: "info",
  },
];
