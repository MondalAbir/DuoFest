import { z } from "zod";

export const EVENT_CATEGORIES = [
  "Technical",
  "Cultural",
  "Music",
  "Sports",
  "Literary",
  "Arts",
  "Gaming",
  "Business",
] as const;

export const TIMEZONES = [
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Dubai",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
] as const;

export const CERTIFICATE_TEMPLATES = [
  "Standard",
  "Modern",
  "Minimal",
  "Celebration",
] as const;

export const VOLUNTEER_DAY_OPTIONS = [
  "Day 1",
  "Day 2",
  "Day 3",
  "Day 4",
  "Day 5",
] as const;

export const SHIFT_SLOTS = [
  "Morning (9 AM – 12 PM)",
  "Afternoon (12 – 4 PM)",
  "Evening (4 – 8 PM)",
] as const;

const optionalUrl = z.union([
  z.url("Enter a valid URL (e.g. https://example.com)"),
  z.literal(""),
]);

const wholeNumber = z.union([
  z.literal(""),
  z
    .string()
    .trim()
    .regex(/^\d+$/, "Enter a whole number"),
]);

const sponsorSchema = z.object({
  name: z
    .string()
    .min(2, "Sponsor name is required")
    .max(80, "Sponsor name must be under 80 characters"),
  amount: wholeNumber,
  url: optionalUrl,
});

const shiftSchema = z.object({
  day: z.string().min(1, "Select a day"),
  slot: z.string().min(1, "Select a time slot"),
  count: z
    .string()
    .trim()
    .regex(/^\d+$/, "Enter a whole number")
    .refine((value) => Number(value) >= 1, "At least 1 volunteer"),
});

function toDate(date: string, time = "00:00") {
  return new Date(`${date}T${time}`);
}

export const createEventSchema = z
  .object({
    eventName: z
      .string()
      .min(3, "Event name must be at least 3 characters")
      .max(100, "Event name must be under 100 characters"),
    category: z.string().min(1, "Select an event category"),
    hostCollege: z.string().min(1, "Select the host college"),
    organizer: z
      .string()
      .min(2, "Organizer is required")
      .max(80, "Organizer must be under 80 characters"),
    description: z
      .string()
      .max(500, "Description must be under 500 characters"),
    banner: z.instanceof(File).nullable(),

    venueName: z
      .string()
      .min(2, "Venue name is required")
      .max(80, "Venue name must be under 80 characters"),
    address: z.string().min(5, "Enter the venue address"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    mapLink: optionalUrl,

    startDate: z.string().min(1, "Start date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endDate: z.string().min(1, "End date is required"),
    endTime: z.string().min(1, "End time is required"),
    timezone: z.string().min(1, "Select a timezone"),

    registrationDeadline: z.string().min(1, "Registration deadline is required"),
    registrationFee: wholeNumber,
    maxCapacity: wholeNumber,
    paymentRequired: z.boolean(),

    volunteersNeeded: wholeNumber,
    volunteerShifts: z.array(shiftSchema).min(1, "Add at least one shift"),

    certificateTemplate: z.string().min(1, "Select a certificate template"),
    issuerName: z
      .string()
      .min(2, "Issuer name is required")
      .max(80, "Issuer name must be under 80 characters"),
    autoGenerateCertificates: z.boolean(),

    sponsors: z.array(sponsorSchema),
  })
  .superRefine((values, ctx) => {
    const start = toDate(values.startDate, values.startTime);
    const end = toDate(values.endDate, values.endTime);
    if (start >= end) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date & time must be after the start",
      });
    }

    const deadline = toDate(values.registrationDeadline);
    if (deadline > start) {
      ctx.addIssue({
        code: "custom",
        path: ["registrationDeadline"],
        message: "Deadline must be before the event starts",
      });
    }
  });

export type CreateEventFormValues = z.infer<typeof createEventSchema>;

export const createEventDefaultValues: CreateEventFormValues = {
  eventName: "",
  category: "",
  hostCollege: "",
  organizer: "",
  description: "",
  banner: null,

  venueName: "",
  address: "",
  city: "",
  state: "",
  mapLink: "",

  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  timezone: "Asia/Kolkata",

  registrationDeadline: "",
  registrationFee: "",
  maxCapacity: "",
  paymentRequired: false,

  volunteersNeeded: "",
  volunteerShifts: [{ day: "Day 1", slot: "", count: "" }],

  certificateTemplate: "",
  issuerName: "",
  autoGenerateCertificates: true,

  sponsors: [],
};

export const STEP_FIELDS: (keyof CreateEventFormValues)[][] = [
  ["eventName", "category", "hostCollege", "organizer", "description"],
  ["banner"],
  ["venueName", "address", "city", "state", "mapLink"],
  ["startDate", "startTime", "endDate", "endTime", "timezone"],
  ["registrationDeadline", "registrationFee", "maxCapacity", "paymentRequired"],
  ["volunteersNeeded", "volunteerShifts"],
  ["certificateTemplate", "issuerName", "autoGenerateCertificates"],
  ["sponsors"],
  [],
];
