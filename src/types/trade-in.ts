import { z } from "zod";
import { sanitizeText } from "@/lib/validation";

const phoneRegex = /^[\d\s\-\+\(\)\.]+$/;
const currentYear = new Date().getFullYear();

export const tradeInLanguageEnum = z.enum(["english", "spanish", "french", "other"]);

export const tradeInCreateInput = z
  .object({
    name: z.string().trim().min(1, "Name is required").transform((v) => sanitizeText(v).trim()),
    company: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? sanitizeText(v).trim() : undefined)),
    phone: z
      .string()
      .trim()
      .min(7, "Phone is required")
      .regex(phoneRegex, "Enter a valid phone number")
      .transform((v) => sanitizeText(v).trim()),
    email: z.string().trim().email("Enter a valid email address").toLowerCase(),
    preferredLanguage: tradeInLanguageEnum.default("english"),
    category: z.string().trim().min(1, "Category is required").transform((v) => sanitizeText(v).trim()),
    manufacturer: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? sanitizeText(v).trim() : undefined)),
    model: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? sanitizeText(v).trim() : undefined)),
    year: z
      .string()
      .trim()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          const n = Number(val);
          return Number.isInteger(n) && n >= 1900 && n <= currentYear + 1;
        },
        { message: `Year must be between 1900 and ${currentYear + 1}` },
      )
      .transform((v) => (v ? sanitizeText(v).trim() : undefined)),
    hours: z
      .string()
      .trim()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          const n = Number(val);
          return !Number.isNaN(n) && n >= 0;
        },
        { message: "Hours must be a valid number" },
      )
      .transform((v) => (v ? sanitizeText(v).trim() : undefined)),
    condition: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? sanitizeText(v).trim() : undefined)),
    country: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? sanitizeText(v).trim() : undefined)),
    stateProvince: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? sanitizeText(v).trim() : undefined)),
    message: z
      .string()
      .trim()
      .min(10, "Please describe your equipment and needs (min 10 characters)")
      .max(2000, "Message is too long")
      .transform((v) => sanitizeText(v).trim()),
    consent: z.boolean().refine((v) => v === true, "Please confirm you agree to be contacted"),
    honeypot: z.string().optional(),
  })
  .refine((data) => !data.honeypot?.trim(), {
    message: "Invalid submission",
    path: ["honeypot"],
  });

export type TradeInCreateInput = z.infer<typeof tradeInCreateInput>;

