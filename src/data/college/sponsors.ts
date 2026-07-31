export type CollegeSponsorTier = "Platinum" | "Gold" | "Silver" | "Bronze";

export interface CollegeSponsor {
  id: string;
  name: string;
  category: string;
  tier: CollegeSponsorTier;
  color: string;
  contribution: number;
  eventsSupported: string[];
  active: boolean;
}

export const collegeSponsors: CollegeSponsor[] = [
  {
    id: "sp-001",
    name: "Apex Financial",
    category: "Fintech",
    tier: "Platinum",
    color: "#5B5CEB",
    contribution: 200000,
    eventsSupported: ["TechNova Hackathon 2026", "Cultural Extravaganza"],
    active: true,
  },
  {
    id: "sp-002",
    name: "CodeCraft Labs",
    category: "Software",
    tier: "Gold",
    color: "#06B6D4",
    contribution: 150000,
    eventsSupported: ["TechNova Hackathon 2026", "AI & ML Bootcamp"],
    active: true,
  },
  {
    id: "sp-003",
    name: "Skyline Sports",
    category: "Sportswear",
    tier: "Gold",
    color: "#10B981",
    contribution: 120000,
    eventsSupported: ["Sports Carnival 2025", "Inter-College Athletics Meet"],
    active: true,
  },
  {
    id: "sp-004",
    name: "Aura Entertainment",
    category: "Media",
    tier: "Silver",
    color: "#8B5CF6",
    contribution: 80000,
    eventsSupported: ["Cultural Extravaganza", "Battle of Bands"],
    active: true,
  },
  {
    id: "sp-005",
    name: "Nova Foods",
    category: "F&B",
    tier: "Silver",
    color: "#F59E0B",
    contribution: 60000,
    eventsSupported: ["Cultural Extravaganza", "Sports Carnival 2025"],
    active: true,
  },
  {
    id: "sp-006",
    name: "RoboTech Systems",
    category: "Robotics",
    tier: "Silver",
    color: "#EC4899",
    contribution: 50000,
    eventsSupported: ["Robo Wars Championship"],
    active: true,
  },
  {
    id: "sp-007",
    name: "PrintWorks Studio",
    category: "Printing",
    tier: "Bronze",
    color: "#3B82F6",
    contribution: 30000,
    eventsSupported: ["TechNova Hackathon 2026", "Cultural Extravaganza"],
    active: true,
  },
  {
    id: "sp-008",
    name: "TransitGo",
    category: "Logistics",
    tier: "Bronze",
    color: "#14B8A6",
    contribution: 25000,
    eventsSupported: ["Inter-College Athletics Meet"],
    active: false,
  },
];

export const sponsorTierOrder: CollegeSponsorTier[] = [
  "Platinum",
  "Gold",
  "Silver",
  "Bronze",
];
