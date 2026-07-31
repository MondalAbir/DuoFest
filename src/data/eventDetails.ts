import type {
  DonutSlice,
  FestEvent,
  Registration,
  Volunteer,
} from "@/types";
import { colleges } from "@/data/colleges";

export interface EventSponsor {
  id: string;
  name: string;
  tier: "Platinum" | "Gold" | "Silver";
  amount: number;
  color: string;
}

export interface EventTimelineItem {
  id: string;
  title: string;
  description: string;
  date: string;
  status: "done" | "current" | "upcoming";
}

export interface EventDetails {
  description: string;
  venue: string;
  city: string;
  address: string;
  organizer: string;
  organizerEmail: string;
  timezone: string;
  capacity: number;
  timeline: EventTimelineItem[];
  revenueBreakdown: DonutSlice[];
  gallery: { id: string; label: string; gradient: string }[];
  sponsors: EventSponsor[];
  registrations: Registration[];
  volunteers: Volunteer[];
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

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const FIRST_NAMES = [
  "Ananya",
  "Rahul",
  "Sneha",
  "Aditya",
  "Priya",
  "Arjun",
  "Ishita",
  "Vikram",
  "Nisha",
  "Rohan",
  "Kavya",
  "Manish",
  "Divya",
  "Siddharth",
  "Tanvi",
  "Harsh",
  "Meera",
  "Akash",
  "Ritika",
  "Varun",
];

const LAST_NAMES = [
  "Singh",
  "Verma",
  "Patel",
  "Kumar",
  "Sharma",
  "Iyer",
  "Nair",
  "Gupta",
  "Reddy",
  "Das",
  "Joshi",
  "Mehta",
  "Chopra",
  "Bose",
  "Kapoor",
  "Agarwal",
  "Rao",
  "Saxena",
  "Malhotra",
  "Bhat",
];

const AVATAR_COLORS = [
  "#6366F1",
  "#14B8A6",
  "#F59E0B",
  "#0EA5E9",
  "#10B981",
  "#EC4899",
  "#8B5CF6",
  "#EF4444",
];

const GALLERY_GRADIENTS = [
  "from-blue-500 to-cyan-500",
  "from-violet-500 to-indigo-500",
  "from-fuchsia-500 to-purple-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
];

const SPONSOR_NAMES = [
  "NovaTech Solutions",
  "Apex Financial",
  "Vertex Labs",
  "Orbit Media",
  "Quantum Foods",
  "Zenith Motors",
  "Pulse Energy",
  "Stellar Apps",
];

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Technical:
    "A hands-on technical experience designed to challenge participants with real-world problem solving, rapid prototyping, and code-first thinking under tight deadlines.",
  Cultural:
    "A vibrant celebration of talent spanning music, dance, theatre, and the performing arts, bringing together artists from colleges across the country.",
  Music:
    "An electrifying showcase of live music — from indie and rock to classical and electronic — curated to keep audiences on their feet.",
  Sports:
    "A high-energy multi-sport meet built around teamwork, fair play, and friendly rivalry, with events across track, field, and indoor disciplines.",
  Literary:
    "A stage for wordsmiths and storytellers, featuring debates, poetry slams, quizzes, and creative writing that celebrate the written and spoken word.",
  Arts:
    "An immersive celebration of visual and performing arts, including exhibitions, live painting, photography walks, and craft workshops.",
  Gaming:
    "A competitive gaming arena spanning esports titles, retro classics, and tabletop tournaments, complete with live streaming and cash prizes.",
  Entrepreneurship:
    "A platform for founders and dreamers to pitch bold ideas, network with mentors, and win funding from a panel of investors.",
  Workshop:
    "An intensive learning sprint led by industry experts, blending hands-on labs, mentorship, and real-world case studies.",
  Dance:
    "A dazzling showcase of dance — classical, contemporary, and hip-hop — celebrating rhythm, movement, and stage presence.",
};

const VENUES = [
  { venue: "Main Auditorium", address: "Central Campus Block" },
  { venue: "Open Air Theatre", address: "Cultural Complex" },
  { venue: "Sports Arena", address: "North Campus Grounds" },
  { venue: "Convention Centre", address: "Administrative Block" },
  { venue: "Innovation Hub", address: "Startup Pavilion" },
];

const TIMELINE_TEMPLATE = (event: FestEvent) => [
  {
    id: "created",
    title: "Event created",
    description: `${event.name} was created and reviewed by the fest committee.`,
    date: addDays(event.date, -45),
  },
  {
    id: "registration-open",
    title: "Registration opened",
    description: "Online registrations went live for all colleges.",
    date: addDays(event.date, -30),
  },
  {
    id: "registration-closes",
    title: "Registration closes",
    description: "Deadline for students to confirm their spot.",
    date: addDays(event.date, -3),
  },
  {
    id: "event-starts",
    title: "Event begins",
    description: `${event.name} kicks off at the ${event.collegeName} campus.`,
    date: event.date,
  },
  {
    id: "event-ends",
    title: "Event concludes",
    description: "Closing ceremony and results announcement.",
    date: addDays(event.date, 1),
  },
  {
    id: "certificates",
    title: "Certificates issued",
    description: "Digital certificates are distributed to participants.",
    date: addDays(event.date, 7),
  },
];

const TODAY = new Date().toISOString().slice(0, 10);

export function getEventDetails(event: FestEvent): EventDetails {
  const random = seeded(event.id);
  const pick = <T,>(items: T[]): T =>
    items[Math.floor(random() * items.length)];

  const venue = pick(VENUES);
  const hostCollege =
    colleges.find((college) => college.name === event.collegeName) ?? colleges[0];

  const timeline = TIMELINE_TEMPLATE(event).map((item) => {
    let status: EventTimelineItem["status"] =
      item.date <= TODAY ? "done" : "upcoming";
    if (event.status === "live" && item.id === "event-starts") {
      status = "current";
    }
    if (event.status === "completed" && item.id === "certificates") {
      status = item.date > TODAY ? "current" : "done";
    }
    return { ...item, status };
  });

  const fee = 150 + Math.floor(random() * 350);
  const regCount = Math.min(12, Math.max(6, Math.round(event.registrations / 160)));
  const registrations: Registration[] = Array.from(
    { length: regCount },
    (_, index) => {
      const first = pick(FIRST_NAMES);
      const last = pick(LAST_NAMES);
      const college = pick(colleges);
      const statuses: Registration["status"][] = [
        "confirmed",
        "confirmed",
        "confirmed",
        "confirmed",
        "pending",
        "pending",
        "cancelled",
        "refunded",
      ];
      return {
        id: `evreg-${event.id}-${index + 1}`,
        studentName: `${first} ${last}`,
        email: `${first.toLowerCase()}.${last.toLowerCase()}@college.edu`,
        collegeName: college.name,
        eventName: event.name,
        amount: fee,
        date: addDays(event.date, -(index % 5) - 1),
        status: statuses[index % statuses.length],
      };
    },
  );

  const volCount = 3 + Math.floor(random() * 5);
  const volunteers: Volunteer[] = Array.from(
    { length: volCount },
    (_, index) => {
      const first = pick(FIRST_NAMES);
      const last = pick(LAST_NAMES);
      const college = pick(colleges);
      const statuses: Volunteer["status"][] = [
        "active",
        "active",
        "active",
        "onboarding",
        "inactive",
      ];
      return {
        id: `evvol-${event.id}-${index + 1}`,
        name: `${first} ${last}`,
        email: `${first.toLowerCase()}.${last.toLowerCase()}@college.edu`,
        collegeName: college.name,
        eventName: event.name,
        hours: 10 + Math.floor(random() * 55),
        status: statuses[index % statuses.length],
        avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
      };
    },
  );

  const feeShare = Math.round(event.revenue * 0.55);
  const sponsorShare = Math.round(event.revenue * 0.25);
  const merchShare = Math.round(event.revenue * 0.12);
  const miscShare = event.revenue - feeShare - sponsorShare - merchShare;

  const sponsorCount = 2 + Math.floor(random() * 3);
  const tiers: EventSponsor["tier"][] = ["Platinum", "Gold", "Silver"];
  const sponsors: EventSponsor[] = Array.from(
    { length: sponsorCount },
    (_, index) => {
      const name = SPONSOR_NAMES[
        (hashCode(event.id) + index) % SPONSOR_NAMES.length
      ];
      return {
        id: `evs-${event.id}-${index + 1}`,
        name,
        tier: tiers[index],
        amount: Math.round(sponsorShare / (index + 1) / 100) * 100,
        color: AVATAR_COLORS[(hashCode(event.id) + index) % AVATAR_COLORS.length],
      };
    },
  );

  return {
    description:
      CATEGORY_DESCRIPTIONS[event.category] ??
      `${event.name} is a flagship ${event.category.toLowerCase()} event hosted by ${event.collegeName}, bringing together students from across the country for a day of competition, learning, and celebration.`,
    venue: venue.venue,
    city: hostCollege.city,
    address: `${venue.address}, ${hostCollege.city}, ${hostCollege.state}`,
    organizer: hostCollege.adminName,
    organizerEmail: hostCollege.adminEmail,
    timezone: "Asia/Kolkata",
    capacity: Math.round((event.registrations / 0.72 / 100) * 100),
    timeline,
    revenueBreakdown: [
      { name: "Registration fees", value: feeShare, color: "#6366F1" },
      { name: "Sponsorships", value: sponsorShare, color: "#14B8A6" },
      { name: "Merchandise", value: merchShare, color: "#F59E0B" },
      { name: "Other income", value: miscShare, color: "#94A3B8" },
    ],
    gallery: [
      { id: "g1", label: "Stage & setup", gradient: GALLERY_GRADIENTS[0] },
      { id: "g2", label: "Crowd moments", gradient: GALLERY_GRADIENTS[1] },
      { id: "g3", label: "Competition floor", gradient: GALLERY_GRADIENTS[2] },
      { id: "g4", label: "Winners podium", gradient: GALLERY_GRADIENTS[3] },
      { id: "g5", label: "Backstage", gradient: GALLERY_GRADIENTS[4] },
      { id: "g6", label: "Media coverage", gradient: GALLERY_GRADIENTS[5] },
    ],
    sponsors,
    registrations,
    volunteers,
  };
}
