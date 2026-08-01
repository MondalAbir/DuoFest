import { z } from "zod";

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Enter your full name")
    .max(80, "Name is too long"),
  email: z.email("Enter a valid email address"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  college: z.string().min(2, "Enter your college name"),
  year: z.string().min(1, "Select your year of study"),
  paymentMethod: z.string().min(1, "Select a payment method"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const YEAR_OPTIONS = [
  { value: "1st", label: "1st year" },
  { value: "2nd", label: "2nd year" },
  { value: "3rd", label: "3rd year" },
  { value: "4th", label: "4th year" },
  { value: "5th", label: "5th year+" },
  { value: "Alumni", label: "Alumni" },
];

export const PAYMENT_METHODS = [
  { value: "upi", label: "UPI", hint: "GPay, PhonePe, Paytm" },
  { value: "card", label: "Card", hint: "Credit & debit cards" },
  { value: "netbanking", label: "Net banking", hint: "All major banks" },
];
