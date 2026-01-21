import { z } from "zod";
import { sanitizeText } from "@/lib/validation";

const phoneRegex = /^[\d\s\-\+\(\)\.]+$/;
const currentYear = new Date().getFullYear();

export const valueRequestLanguageEnum = z.enum(["english", "spanish", "french", "other"]);

const fileMetadataSchema = z.object({
  fileName: z.string().min(1),
  storagePath: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().positive(),
});

export const valueRequestCreateInput = z
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
    preferredLanguage: valueRequestLanguageEnum.default("english"),
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
    description: z
      .string()
      .trim()
      .min(10, "Please describe your equipment (min 10 characters)")
      .max(2000, "Description is too long")
      .transform((v) => sanitizeText(v).trim()),
    files: z.array(fileMetadataSchema).max(10).optional(),
    consent: z.boolean().refine((v) => v === true, "Please confirm you agree to be contacted"),
    honeypot: z.string().optional(),
  })
  .refine((data) => !data.honeypot?.trim(), {
    message: "Invalid submission",
    path: ["honeypot"],
  });

export type ValueRequestCreateInput = z.input<typeof valueRequestCreateInput>;

