export type CollegeEventStatus =
  | "upcoming"
  | "live"
  | "completed"
  | "cancelled"
  | "draft";

export interface CollegeEvent {
  id: string;
  name: string;
  category: string;
  date: string;
  venue: string;
  registrations: number;
  capacity: number;
  revenue: number;
  volunteers: number;
  status: CollegeEventStatus;
  gradient: string;
}

export interface CollegeEventSchedule {
  title: string;
  time: string;
  venue: string;
}

export interface CollegeEventSponsor {
  name: string;
  tier: string;
  color: string;
}

export interface CollegeEventGalleryItem {
  label: string;
  gradient: string;
}

export interface CollegeEventDetails {
  description: string;
  rules: string[];
  eligibility: string;
  registrationStart: string;
  registrationEnd: string;
  fee: number;
  qrEntry: boolean;
  certificateEnabled: boolean;
  schedule: CollegeEventSchedule[];
  sponsors: CollegeEventSponsor[];
  gallery: CollegeEventGalleryItem[];
}

export const collegeEvents: CollegeEvent[] = [
  {
    id: "ce-001",
    name: "TechNova Hackathon 2026",
    category: "Technical",
    date: "2026-08-14",
    venue: "Main Auditorium",
    registrations: 1840,
    capacity: 2500,
    revenue: 736000,
    volunteers: 42,
    status: "upcoming",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "ce-002",
    name: "Cultural Extravaganza",
    category: "Cultural",
    date: "2026-08-21",
    venue: "Open Air Theatre",
    registrations: 3200,
    capacity: 4000,
    revenue: 960000,
    volunteers: 58,
    status: "upcoming",
    gradient: "from-violet-500 to-indigo-500",
  },
  {
    id: "ce-003",
    name: "AI & ML Bootcamp",
    category: "Workshop",
    date: "2026-08-05",
    venue: "Innovation Hub",
    registrations: 1120,
    capacity: 1500,
    revenue: 392000,
    volunteers: 24,
    status: "upcoming",
    gradient: "from-cyan-500 to-sky-500",
  },
  {
    id: "ce-004",
    name: "Inter-College Athletics Meet",
    category: "Sports",
    date: "2026-08-09",
    venue: "Sports Arena",
    registrations: 980,
    capacity: 1200,
    revenue: 196000,
    volunteers: 36,
    status: "upcoming",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    id: "ce-005",
    name: "Battle of Bands",
    category: "Music",
    date: "2026-07-28",
    venue: "Open Air Theatre",
    registrations: 1470,
    capacity: 2000,
    revenue: 588000,
    volunteers: 31,
    status: "live",
    gradient: "from-fuchsia-500 to-purple-500",
  },
  {
    id: "ce-006",
    name: "Startup Pitch Fest",
    category: "Entrepreneurship",
    date: "2026-07-30",
    venue: "Convention Centre",
    registrations: 620,
    capacity: 900,
    revenue: 248000,
    volunteers: 18,
    status: "live",
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    id: "ce-007",
    name: "Poetry Slam & Storytelling",
    category: "Literary",
    date: "2026-07-22",
    venue: "Convention Centre",
    registrations: 540,
    capacity: 800,
    revenue: 162000,
    volunteers: 14,
    status: "completed",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    id: "ce-008",
    name: "Robo Wars Championship",
    category: "Technical",
    date: "2026-07-18",
    venue: "Innovation Hub",
    registrations: 760,
    capacity: 1000,
    revenue: 304000,
    volunteers: 22,
    status: "completed",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "ce-009",
    name: "Fusion Dance Battle",
    category: "Cultural",
    date: "2026-06-30",
    venue: "Open Air Theatre",
    registrations: 0,
    capacity: 800,
    revenue: 0,
    volunteers: 0,
    status: "cancelled",
    gradient: "from-rose-500 to-red-500",
  },
];

export const collegeEventDetails: Record<string, CollegeEventDetails> = {
  "ce-001": {
    description:
      "A 48-hour coding sprint where student teams build products for social good. Mentors from leading tech companies guide participants through ideation, prototyping and demo day.",
    rules: [
      "Teams of 2–4 members",
      "Open to all undergraduate students",
      "A working prototype and demo must be presented",
      "Use of open-source libraries is allowed",
      "Judges' decision is final",
    ],
    eligibility: "All undergraduate students with a valid college ID",
    registrationStart: "2026-07-01",
    registrationEnd: "2026-08-10",
    fee: 400,
    qrEntry: true,
    certificateEnabled: true,
    schedule: [
      { title: "Registration & onboarding", time: "08:00 AM", venue: "Main Auditorium" },
      { title: "Kickoff & problem statement", time: "10:00 AM", venue: "Main Auditorium" },
      { title: "Hacking begins", time: "11:00 AM", venue: "Innovation Hub" },
      { title: "Mentor check-in", time: "04:00 PM", venue: "Innovation Hub" },
      { title: "Demo day & judging", time: "10:00 AM", venue: "Main Auditorium" },
      { title: "Prize distribution", time: "02:00 PM", venue: "Main Auditorium" },
    ],
    sponsors: [
      { name: "TechNova Labs", tier: "Title", color: "#5B5CEB" },
      { name: "CloudBase", tier: "Gold", color: "#F59E0B" },
      { name: "DevForge", tier: "Silver", color: "#94A3B8" },
    ],
    gallery: [
      { label: "Auditorium setup", gradient: "from-blue-500 to-cyan-500" },
      { label: "Hackers in action", gradient: "from-violet-500 to-indigo-500" },
      { label: "Mentor sessions", gradient: "from-emerald-500 to-teal-500" },
      { label: "Demo day", gradient: "from-amber-500 to-orange-500" },
    ],
  },
  "ce-002": {
    description:
      "An evening celebrating dance, drama and music from across colleges. Cultural troupes compete across ten categories with a grand finale under the stars.",
    rules: [
      "Individual and group entries allowed",
      "Props must be approved by the organizing committee",
      "Each performance limited to 12 minutes",
      "Original and cover acts both accepted",
    ],
    eligibility: "Open to all students; auditions held one week prior",
    registrationStart: "2026-07-05",
    registrationEnd: "2026-08-15",
    fee: 300,
    qrEntry: true,
    certificateEnabled: false,
    schedule: [
      { title: "Auditions", time: "10:00 AM", venue: "Cultural Hall" },
      { title: "Opening act", time: "05:00 PM", venue: "Open Air Theatre" },
      { title: "Dance finals", time: "06:30 PM", venue: "Open Air Theatre" },
      { title: "Grand finale & awards", time: "09:00 PM", venue: "Open Air Theatre" },
    ],
    sponsors: [
      { name: "CampusCrest", tier: "Title", color: "#8B5CF6" },
      { name: "SoundWave", tier: "Gold", color: "#F59E0B" },
    ],
    gallery: [
      { label: "Dance finals", gradient: "from-violet-500 to-indigo-500" },
      { label: "Crowd moments", gradient: "from-fuchsia-500 to-purple-500" },
    ],
  },
  "ce-003": {
    description:
      "Hands-on bootcamp covering machine learning fundamentals to deep learning with real datasets. Participants ship a capstone project by the end of week.",
    rules: [
      "Laptop with at least 8GB RAM required",
      "Beginner friendly, prior Python helpful",
      "Attendance of all sessions mandatory for certificate",
    ],
    eligibility: "Students in 2nd year and above",
    registrationStart: "2026-07-10",
    registrationEnd: "2026-07-28",
    fee: 350,
    qrEntry: false,
    certificateEnabled: true,
    schedule: [
      { title: "Python & NumPy primer", time: "09:00 AM", venue: "Innovation Hub" },
      { title: "Model building workshop", time: "11:00 AM", venue: "Innovation Hub" },
      { title: "Deep learning lab", time: "02:00 PM", venue: "Innovation Hub" },
      { title: "Capstone showcase", time: "10:00 AM", venue: "Innovation Hub" },
    ],
    sponsors: [
      { name: "AItelligent", tier: "Gold", color: "#06B6D4" },
    ],
    gallery: [
      { label: "Workshop floor", gradient: "from-cyan-500 to-sky-500" },
    ],
  },
  "ce-004": {
    description:
      "Inter-college athletics meet featuring track, field and relay events across junior and senior categories.",
    rules: [
      "Athletes must carry college ID",
      "Single-day events on a first-come first-registered basis",
      "Anti-doping policy applies",
    ],
    eligibility: "Registered athletes with medical fitness certificate",
    registrationStart: "2026-07-15",
    registrationEnd: "2026-08-05",
    fee: 200,
    qrEntry: false,
    certificateEnabled: true,
    schedule: [
      { title: "Opening ceremony", time: "07:00 AM", venue: "Sports Arena" },
      { title: "Track events", time: "08:00 AM", venue: "Sports Arena" },
      { title: "Field events", time: "12:00 PM", venue: "Sports Arena" },
      { title: "Relays & closing", time: "04:00 PM", venue: "Sports Arena" },
    ],
    sponsors: [
      { name: "FitFirst", tier: "Title", color: "#10B981" },
      { name: "SportZone", tier: "Silver", color: "#94A3B8" },
    ],
    gallery: [
      { label: "Track finals", gradient: "from-emerald-500 to-teal-500" },
    ],
  },
  "ce-005": {
    description:
      "Inter-college band competition with rock, metal and indie categories. Eight finalists battle for the Battle of Bands crown.",
    rules: [
      "Minimum 3 members per band",
      "Set duration 20 minutes including sound check",
      "Original compositions get bonus points",
    ],
    eligibility: "All student bands from registered colleges",
    registrationStart: "2026-06-20",
    registrationEnd: "2026-07-20",
    fee: 400,
    qrEntry: true,
    certificateEnabled: false,
    schedule: [
      { title: "Sound check", time: "02:00 PM", venue: "Open Air Theatre" },
      { title: "Round 1", time: "05:00 PM", venue: "Open Air Theatre" },
      { title: "Finals", time: "07:00 PM", venue: "Open Air Theatre" },
    ],
    sponsors: [
      { name: "RhythmZone", tier: "Title", color: "#C026D3" },
    ],
    gallery: [
      { label: "Finalists", gradient: "from-fuchsia-500 to-purple-500" },
    ],
  },
  "ce-006": {
    description:
      "Student founders pitch to a panel of investors and VCs. Top three startups win incubation support and seed funding.",
    rules: [
      "Pitch deck in PDF mandatory",
      "5 minute pitch + 3 minute Q&A",
      "One startup per team",
    ],
    eligibility: "Student-run startups with a working prototype",
    registrationStart: "2026-07-01",
    registrationEnd: "2026-07-25",
    fee: 400,
    qrEntry: false,
    certificateEnabled: true,
    schedule: [
      { title: "Deck submission deadline", time: "11:59 PM", venue: "Online" },
      { title: "Semi-final pitches", time: "09:00 AM", venue: "Convention Centre" },
      { title: "Investor demo day", time: "02:00 PM", venue: "Convention Centre" },
    ],
    sponsors: [
      { name: "VenturePath", tier: "Title", color: "#4F46E5" },
      { name: "SeedNow", tier: "Gold", color: "#F59E0B" },
    ],
    gallery: [
      { label: "Pitch arena", gradient: "from-indigo-500 to-blue-500" },
    ],
  },
  "ce-007": {
    description:
      "An intimate evening of spoken word, poetry and storytelling with featured artists and open mic slots.",
    rules: [
      "Open mic slots limited to 5 minutes",
      "Content must be appropriate for all ages",
    ],
    eligibility: "Open mic open to all",
    registrationStart: "2026-07-01",
    registrationEnd: "2026-07-18",
    fee: 150,
    qrEntry: false,
    certificateEnabled: false,
    schedule: [
      { title: "Featured performances", time: "06:00 PM", venue: "Convention Centre" },
      { title: "Open mic", time: "08:00 PM", venue: "Convention Centre" },
    ],
    sponsors: [],
    gallery: [
      { label: "Open mic night", gradient: "from-amber-500 to-orange-500" },
    ],
  },
  "ce-008": {
    description:
      "Robotics championship with combat, maze and sumo categories built on open hardware kits.",
    rules: [
      "Bots under 5kg in combat category",
      "Teams may field multiple bots in different categories",
      "Safety inspection before every match",
    ],
    eligibility: "All students; robotics club members get priority slots",
    registrationStart: "2026-06-25",
    registrationEnd: "2026-07-12",
    fee: 400,
    qrEntry: true,
    certificateEnabled: true,
    schedule: [
      { title: "Weigh-in & inspection", time: "09:00 AM", venue: "Innovation Hub" },
      { title: "Combat qualifiers", time: "11:00 AM", venue: "Innovation Hub" },
      { title: "Sumo finals", time: "03:00 PM", venue: "Innovation Hub" },
    ],
    sponsors: [
      { name: "Robotika", tier: "Title", color: "#0EA5E9" },
    ],
    gallery: [
      { label: "Arena battles", gradient: "from-blue-500 to-cyan-500" },
    ],
  },
};
