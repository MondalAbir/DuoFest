export interface CollegeGalleryImage {
  id: string;
  label: string;
  gradient: string;
  eventName: string;
  views: number;
  likes: number;
  uploadedAt: string;
}

export interface CollegeGalleryAlbum {
  id: string;
  eventName: string;
  imageCount: number;
  likes: number;
  views: number;
  coverGradient: string;
}

export const collegeGalleryAlbums: CollegeGalleryAlbum[] = [
  {
    id: "ga-001",
    eventName: "TechNova Hackathon 2025",
    imageCount: 48,
    likes: 1240,
    views: 18600,
    coverGradient: "from-indigo-500 to-violet-500",
  },
  {
    id: "ga-002",
    eventName: "Cultural Extravaganza",
    imageCount: 36,
    likes: 980,
    views: 14200,
    coverGradient: "from-pink-500 to-rose-500",
  },
  {
    id: "ga-003",
    eventName: "Battle of Bands",
    imageCount: 29,
    likes: 760,
    views: 10900,
    coverGradient: "from-amber-500 to-orange-500",
  },
  {
    id: "ga-004",
    eventName: "Inter-College Athletics Meet",
    imageCount: 32,
    likes: 540,
    views: 8200,
    coverGradient: "from-emerald-500 to-teal-500",
  },
  {
    id: "ga-005",
    eventName: "Robo Wars Championship",
    imageCount: 41,
    likes: 890,
    views: 13400,
    coverGradient: "from-sky-500 to-blue-600",
  },
  {
    id: "ga-006",
    eventName: "Poetry Slam & Storytelling",
    imageCount: 18,
    likes: 320,
    views: 4600,
    coverGradient: "from-fuchsia-500 to-purple-500",
  },
];

export const collegeGalleryImages: CollegeGalleryImage[] = [
  {
    id: "gi-001",
    label: "Inauguration ceremony",
    gradient: "from-indigo-500 to-violet-500",
    eventName: "TechNova Hackathon 2025",
    views: 3200,
    likes: 214,
    uploadedAt: "2025-08-16",
  },
  {
    id: "gi-002",
    label: "Team pitch round",
    gradient: "from-violet-500 to-purple-500",
    eventName: "TechNova Hackathon 2025",
    views: 2800,
    likes: 187,
    uploadedAt: "2025-08-16",
  },
  {
    id: "gi-003",
    label: "Winner announcement",
    gradient: "from-sky-500 to-blue-600",
    eventName: "TechNova Hackathon 2025",
    views: 4100,
    likes: 342,
    uploadedAt: "2025-08-17",
  },
  {
    id: "gi-004",
    label: "Stage performance",
    gradient: "from-pink-500 to-rose-500",
    eventName: "Cultural Extravaganza",
    views: 2600,
    likes: 198,
    uploadedAt: "2026-07-28",
  },
  {
    id: "gi-005",
    label: "Audience crowd",
    gradient: "from-rose-500 to-orange-500",
    eventName: "Cultural Extravaganza",
    views: 2200,
    likes: 154,
    uploadedAt: "2026-07-28",
  },
  {
    id: "gi-006",
    label: "Band performing live",
    gradient: "from-amber-500 to-orange-500",
    eventName: "Battle of Bands",
    views: 1900,
    likes: 121,
    uploadedAt: "2026-07-29",
  },
  {
    id: "gi-007",
    label: "100m sprint final",
    gradient: "from-emerald-500 to-teal-500",
    eventName: "Inter-College Athletics Meet",
    views: 1500,
    likes: 98,
    uploadedAt: "2026-07-25",
  },
  {
    id: "gi-008",
    label: "Robo arena battle",
    gradient: "from-sky-500 to-blue-600",
    eventName: "Robo Wars Championship",
    views: 3400,
    likes: 276,
    uploadedAt: "2026-07-19",
  },
  {
    id: "gi-009",
    label: "Crowd cheering",
    gradient: "from-fuchsia-500 to-purple-500",
    eventName: "Poetry Slam & Storytelling",
    views: 1100,
    likes: 74,
    uploadedAt: "2026-07-23",
  },
];
