import { z } from "zod";

export const COLLEGE_TYPES = [
  "Government",
  "Private",
  "Deemed",
  "Autonomous",
] as const;

export const NAAC_GRADES = [
  "A++",
  "A+",
  "A",
  "B+",
  "B",
  "C",
  "Not accredited",
] as const;

export const COLLEGE_STATUS = ["active", "pending", "suspended"] as const;

export const addCollegeSchema = z.object({
  logo: z.instanceof(File).nullable(),
  name: z
    .string()
    .min(2, "College name must be at least 2 characters")
    .max(100, "College name must be under 100 characters"),
  code: z
    .string()
    .min(2, "College code must be at least 2 characters")
    .max(20, "College code must be under 20 characters"),
  university: z.string().min(2, "University name is required"),
  type: z.string().min(1, "Please select a college type"),
  email: z.email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(/^\+?[\d\s()-]+$/, "Phone number can only contain digits")
    .refine(
      (value) => value.replace(/\D/g, "").length >= 10,
      "Please enter a valid phone number",
    )
    .refine(
      (value) => value.replace(/\D/g, "").length <= 15,
      "Please enter a valid phone number",
    ),
  website: z.union([
    z.url("Please enter a valid website URL (e.g. https://www.college.edu)"),
    z.literal(""),
  ]),
  address: z.string().min(5, "Please enter the college address"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  pinCode: z
    .string()
    .regex(/^\d{6}$/, "PIN code must be exactly 6 digits"),
  description: z.string().max(500, "Description must be under 500 characters"),
  naacGrade: z.string().min(1, "Please select a NAAC grade"),
  aicteApproved: z.boolean(),
  status: z.enum(COLLEGE_STATUS),
});

export type AddCollegeFormValues = z.infer<typeof addCollegeSchema>;

export const addCollegeDefaultValues: AddCollegeFormValues = {
  logo: null,
  name: "",
  code: "",
  university: "",
  type: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  pinCode: "",
  description: "",
  naacGrade: "",
  aicteApproved: true,
  status: "pending",
};
