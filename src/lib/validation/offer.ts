/**
 * Offer Validation
 *
 * Zod schemas for offer-related form validation.
 */

import { z } from "zod";

/**
 * Phone number validation regex (allows international formats)
 */
const phoneRegex = /^[\d\s\-\+\(\)\.]+$/;

/**
 * Make offer form validation schema
 */
export const makeOfferSchema = z.object({
  listingId: z.string().min(1, "Listing ID is required"),
  offerAmount: z
    .string()
    .min(1, "Offer amount is required")
    .transform((val) => {
      const num = parseFloat(val.replace(/,/g, ""));
      if (Number.isNaN(num) || num <= 0) {
        throw new z.ZodError([
          {
            code: "custom",
            path: ["offerAmount"],
            message: "Offer amount must be a valid positive number",
          },
        ]);
      }
      return num;
    }),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        return phoneRegex.test(val);
      },
      {
        message: "Please enter a valid phone number",
      },
    )
    .transform((val) => (val ? val.trim() : undefined)),
  message: z.string().optional().transform((val) => (val ? val.trim() : undefined)),
  // Offer conditions (from checkboxes)
  buyerInspection: z.boolean(),
  thirdPartyInspection: z.boolean(),
  financing: z.boolean(),
  otherTerms: z.boolean(),
  condition: z.string().optional(), // Combined from checkboxes
  buyerAdditionalTerms: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val === "") return true;
      const wordCount = val.trim().split(/\s+/).length;
      return wordCount <= 300;
    }, "Maximum 300 words allowed")
    .transform((val) => (val ? val.trim() : undefined)),
});

export type MakeOfferInput = z.infer<typeof makeOfferSchema>;
