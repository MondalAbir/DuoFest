import { z } from "zod";

export const PERMISSIONS = [
  { value: "manageEvents", label: "Manage Events" },
  { value: "manageVolunteers", label: "Manage Volunteers" },
  { value: "registrations", label: "Registrations" },
  { value: "certificates", label: "Certificates" },
  { value: "announcements", label: "Announcements" },
] as const;

export const ADMIN_ROLES = [
  "College Admin",
  "Events Manager",
  "Support",
  "Viewer",
] as const;

export const INVITE_STATUS = ["invited", "pending", "active"] as const;

export const inviteAdminSchema = z.object({
  photo: z.instanceof(File).nullable(),
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(80, "Full name must be under 80 characters"),
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
  collegeId: z.string().min(1, "Please select a college"),
  role: z.string().min(1, "Please select a role"),
  permissions: z
    .array(z.string())
    .min(1, "Select at least one permission"),
  requirePasswordChange: z.boolean(),
  sendInvitationEmail: z.boolean(),
  status: z.enum(INVITE_STATUS),
});

export type InviteAdminFormValues = z.infer<typeof inviteAdminSchema>;

export const inviteAdminDefaultValues: InviteAdminFormValues = {
  photo: null,
  fullName: "",
  email: "",
  phone: "",
  collegeId: "",
  role: "",
  permissions: [],
  requirePasswordChange: true,
  sendInvitationEmail: true,
  status: "invited",
};
