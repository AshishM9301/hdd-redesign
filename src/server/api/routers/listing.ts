/**
 * Listing Router
 * 
 * Handles all listing CRUD operations, status management, media uploads, and availability tracking.
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  ListingStatus,
  AvailabilityStatus,
  MediaFileType,
  StorageProvider,
} from "../../../../generated/prisma-client";
import { StorageFactory } from "@/lib/storage";
import { DEFAULT_STORAGE_CONFIG } from "@/lib/storage/types";
import {
  generateStoragePath,
  validateFileSize,
  validateMimeType,
  extractMimeType,
  getFileSize,
} from "@/lib/storage/utils";
import { env } from "@/env";
import { db } from "@/server/db";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { generateUniqueReferenceNumber } from "@/lib/utils";
import {
  sanitizeText,
  validateFile,
  validateFileExtension,
  checkRateLimit,
  validateUrl,
  validateCanReserve,
  validateCanMarkAsSold,
  validateCanPublish,
  validateStatusTransition as validateStatusTransitionUtil,
} from "@/lib/validation";

// ============================================================================
// Validation Schemas
// ============================================================================

// Phone number validation regex (allows international formats)
const phoneRegex = /^[\d\s\-\+\(\)\.]+$/;

const contactInfoSchema = z
  .object({
    contactName: z
      .string()
      .min(1, "Contact name is required")
      .transform((val) => sanitizeText(val).trim()),
    companyName: z
      .string()
      .optional()
      .transform((val) => (val ? sanitizeText(val).trim() : undefined)),
    addressLine1: z
      .string()
      .min(1, "Address line 1 is required")
      .transform((val) => sanitizeText(val).trim()),
    addressLine2: z
      .string()
      .optional()
      .transform((val) => (val ? sanitizeText(val).trim() : undefined)),
    city: z
      .string()
      .min(1, "City is required")
      .transform((val) => sanitizeText(val).trim()),
    stateProvince: z
      .string()
      .min(1, "State/Province is required")
      .transform((val) => sanitizeText(val).trim()),
    postalCode: z
      .string()
      .optional()
      .transform((val) => (val ? sanitizeText(val).trim() : undefined)),
    country: z
      .string()
      .min(1, "Country is required")
      .transform((val) => sanitizeText(val).trim()),
    phone: z
      .string()
      .min(1, "Phone is required")
      .regex(phoneRegex, "Invalid phone number format")
      .transform((val) => sanitizeText(val).trim()),
    email: z.string().email("Invalid email address").toLowerCase().trim(),
    website: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine(
        (val) => {
          if (!val || val === "") return true;
          const urlValidation = validateUrl(val);
          return urlValidation.valid;
        },
        {
          message: "Invalid website URL. Only http and https URLs are allowed.",
        },
      )
      .transform((val) => {
        if (!val || val === "") return undefined;
        const urlValidation = validateUrl(val);
        return urlValidation.normalizedUrl || val;
      }),
    hearAboutUs: z.array(z.string()).default([]),
    hearAboutUsOther: z
      .string()
      .optional()
      .transform((val) => (val ? sanitizeText(val).trim() : undefined)),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms",
    }),
  })
  .transform((data) => ({
    ...data,
    website: data.website === "" ? undefined : data.website,
  }));

const listingDetailsSchema = z.object({
  generalDescription: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeText(val).trim() : undefined)),
  locatingSystems: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeText(val).trim() : undefined)),
  mixingSystems: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeText(val).trim() : undefined)),
  accessories: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeText(val).trim() : undefined)),
  trailers: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeText(val).trim() : undefined)),
  recentWorkModifications: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeText(val).trim() : undefined)),
  additionalInformation: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeText(val).trim() : undefined)),
  pipe: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeText(val).trim() : undefined)),
});

// Serial number validation (alphanumeric with optional dashes/underscores)
const serialNumberRegex = /^[a-zA-Z0-9\-_]+$/;

// Year validation (1900 to current year + 1)
const currentYear = new Date().getFullYear();
const minYear = 1900;
const maxYear = currentYear + 1;

const listingInfoSchema = z.object({
  year: z
    .string()
    .min(1, "Year is required")
    .refine(
      (val) => {
        const yearNum = parseInt(val, 10);
        return !isNaN(yearNum) && yearNum >= minYear && yearNum <= maxYear;
      },
      {
        message: `Year must be between ${minYear} and ${maxYear}`,
      },
    )
    .transform((val) => sanitizeText(val).trim()),
  manufacturer: z
    .string()
    .min(1, "Manufacturer is required")
    .transform((val) => sanitizeText(val).trim()),
  model: z
    .string()
    .min(1, "Model is required")
    .transform((val) => sanitizeText(val).trim()),
  condition: z
    .string()
    .min(1, "Condition is required")
    .transform((val) => sanitizeText(val).trim()),
  serialNumber: z
    .string()
    .min(1, "Serial number is required")
    .regex(serialNumberRegex, "Serial number can only contain letters, numbers, dashes, and underscores")
    .transform((val) => sanitizeText(val).trim()),
  askingPrice: z.string().transform((val) => {
    const num = parseFloat(val);
    if (isNaN(num) || num < 0) {
      throw new z.ZodError([
        {
          code: "custom",
          path: ["askingPrice"],
          message: "Asking price must be a valid positive number",
        },
      ]);
    }
    return num;
  }),
  currency: z
    .string()
    .min(1, "Currency is required")
    .transform((val) => sanitizeText(val).trim()),
  hours: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
      },
      {
        message: "Hours must be a valid positive number",
      },
    )
    .transform((val) => (val ? sanitizeText(val).trim() : undefined)),
  miles: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
      },
      {
        message: "Miles must be a valid positive number",
      },
    )
    .transform((val) => (val ? sanitizeText(val).trim() : undefined)),
  repossessed: z.boolean().default(false),
  equipmentCity: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeText(val).trim() : undefined)),
  equipmentStateProvince: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeText(val).trim() : undefined)),
  equipmentPostalCode: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeText(val).trim() : undefined)),
  equipmentCountry: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeText(val).trim() : undefined)),
});

const createListingSchema = z.object({
  contactInfo: contactInfoSchema,
  listingInfo: listingInfoSchema,
  listingDetails: listingDetailsSchema.optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

// Update schemas - manually define optional fields since .partial() doesn't work with transforms
const updateContactInfoSchema = z.object({
  contactName: z.string().min(1).optional(),
  companyName: z.string().optional(),
  addressLine1: z.string().min(1).optional(),
  addressLine2: z.string().optional(),
  city: z.string().min(1).optional(),
  stateProvince: z.string().min(1).optional(),
  postalCode: z.string().optional(),
  country: z.string().min(1).optional(),
  phone: z.string().min(1).regex(phoneRegex).optional(),
  email: z.string().email().optional(),
  website: z.string().optional().or(z.literal("")),
  hearAboutUs: z.array(z.string()).optional(),
  hearAboutUsOther: z.string().optional(),
  acceptTerms: z.boolean().optional(),
});

const updateListingInfoSchema = z.object({
  year: z.string().min(1).optional(),
  manufacturer: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  condition: z.string().min(1).optional(),
  serialNumber: z.string().min(1).regex(serialNumberRegex).optional(),
  askingPrice: z.string().optional(),
  currency: z.string().min(1).optional(),
  hours: z.string().optional(),
  miles: z.string().optional(),
  repossessed: z.boolean().optional(),
  equipmentCity: z.string().optional(),
  equipmentStateProvince: z.string().optional(),
  equipmentPostalCode: z.string().optional(),
  equipmentCountry: z.string().optional(),
});

const updateListingDetailsSchema = z.object({
  generalDescription: z.string().optional(),
  locatingSystems: z.string().optional(),
  mixingSystems: z.string().optional(),
  accessories: z.string().optional(),
  trailers: z.string().optional(),
  recentWorkModifications: z.string().optional(),
  additionalInformation: z.string().optional(),
  pipe: z.string().optional(),
});

const updateListingSchema = z.object({
  listingId: z.string().min(1),
  contactInfo: updateContactInfoSchema.optional(),
  listingInfo: updateListingInfoSchema.optional(),
  listingDetails: updateListingDetailsSchema.optional(),
});

const publishListingSchema = z.object({
  listingId: z.string().min(1),
});

const reserveListingSchema = z.object({
  listingId: z.string().min(1),
  reservedUntil: z.date().optional(),
});

const markAsSoldSchema = z.object({
  listingId: z.string().min(1),
  soldPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .refine((val) => val === undefined || (!isNaN(val || 0) && (val || 0) >= 0), {
      message: "Sold price must be a valid positive number",
    }),
  soldTo: z.string().optional(),
  soldNotes: z.string().optional(),
});

const releaseReservationSchema = z.object({
  listingId: z.string().min(1),
});

const archiveListingSchema = z.object({
  listingId: z.string().min(1),
});

const getByUserSchema = z.object({
  status: z.nativeEnum(ListingStatus).optional(),
});

const getAvailableSchema = z.object({
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  year: z.string().optional(),
  condition: z.string().optional(),
  minPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  maxPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  assured: z.boolean().optional(),
  sortBy: z.enum(["createdAt", "assured"]).optional().default("createdAt"),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

const getSoldSchema = z.object({
  userId: z.string().optional(),
});

// File upload schema - accepts base64 strings
const fileUploadSchema = z.object({
  data: z.string(), // base64 string
  fileName: z.string(),
  mimeType: z.string(),
});

const uploadMediaSchema = z.object({
  listingId: z.string().min(1),
  files: z.array(fileUploadSchema).min(1).max(5),
});

const deleteMediaSchema = z.object({
  listingId: z.string().min(1),
  mediaId: z.string().min(1),
});

const linkListingToAccountSchema = z.object({
  referenceNumber: z.string().min(1, "Reference number is required"),
});

const requestListingConnectionSchema = z.object({
  referenceNumber: z.string().min(1, "Reference number is required"),
  proofDocument: z
    .object({
      data: z.string(),
      fileName: z.string(),
      mimeType: z.string(),
    })
    .optional(),
  proofNotes: z.string().optional(),
});

const cancelConnectionRequestSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Verifies that the user owns the listing
 * Allows access if listing userId matches current user OR if listing userId is null (anonymous listing)
 */
async function verifyListingOwnership(
  dbInstance: typeof db,
  listingId: string,
  userId: string,
) {
  const listing = await dbInstance.listing.findUnique({
    where: { id: listingId },
    select: { userId: true },
  });

  if (!listing) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Listing not found",
    });
  }

  // Allow if user owns the listing OR if listing is anonymous (userId is null)
  if (listing.userId !== null && listing.userId !== userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have permission to access this listing",
    });
  }

  return listing;
}

/**
 * Validates that a listing has all required fields for publishing
 */
function validateListingForPublish(listing: {
  contactInfo: unknown;
  listingInfo?: unknown;
  manufacturer: string;
  model: string;
  year: string;
  condition: string;
  serialNumber: string;
  askingPrice: unknown;
  currency: string;
}) {
  const errors: string[] = [];

  if (!listing.manufacturer) errors.push("Manufacturer is required");
  if (!listing.model) errors.push("Model is required");
  if (!listing.year) errors.push("Year is required");
  if (!listing.condition) errors.push("Condition is required");
  if (!listing.serialNumber) errors.push("Serial number is required");
  if (!listing.askingPrice) errors.push("Asking price is required");
  if (!listing.currency) errors.push("Currency is required");
  if (!listing.contactInfo) errors.push("Contact information is required");

  if (errors.length > 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Cannot publish listing. Missing required fields: ${errors.join(", ")}`,
    });
  }
}

/**
 * Validates status transitions
 * Uses the validation utility from lib/validation
 */
function validateStatusTransition(
  currentStatus: ListingStatus,
  newStatus: ListingStatus,
) {
  // Use the imported validation utility
  validateStatusTransitionUtil(currentStatus, newStatus);
}

/**
 * Determines MediaFileType from MIME type
 */
function determineMediaFileType(mimeType: string): MediaFileType {
  if (mimeType.startsWith("image/")) {
    return MediaFileType.IMAGE;
  }
  if (mimeType.startsWith("video/")) {
    return MediaFileType.VIDEO;
  }
  return MediaFileType.DOCUMENT;
}

/**
 * Converts base64 string to Buffer
 */
function base64ToBuffer(base64: string): Buffer {
  const base64Data = base64.replace(/^data:.*,/, "");
  return Buffer.from(base64Data, "base64");
}

/**
 * Processes file upload and creates MediaAttachment record
 * Enhanced with comprehensive security validation
 */
async function processFileUpload(
  dbInstance: typeof db,
  file: { data: string; fileName: string; mimeType: string },
  listingId: string,
  displayOrder: number,
): Promise<{
  id: string;
  fileName: string;
  url: string;
  thumbnailUrl: string | null;
}> {
  // Convert base64 to Buffer
  const fileBuffer = base64ToBuffer(file.data);
  const fileSize = fileBuffer.length;

  // Validate file extension is not executable
  if (!validateFileExtension(file.fileName)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `File ${file.fileName} has an executable extension and is not allowed`,
    });
  }

  // Comprehensive file validation (type, size, content)
  const fileValidation = await validateFile(
    fileBuffer,
    file.fileName,
    file.mimeType,
  );

  if (!fileValidation.valid) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `File validation failed for ${file.fileName}: ${fileValidation.errors.join(", ")}`,
    });
  }

  // Generate storage path
  const storagePath = generateStoragePath("listings", file.fileName, listingId);

  // Get storage provider
  const storageProvider = StorageFactory.getProvider();

  // Upload file
  let uploadResult;
  try {
    uploadResult = await storageProvider.upload(fileBuffer, storagePath, {
      contentType: file.mimeType,
    });
  } catch (error) {
    // Log error but don't expose internal details
    console.error("Storage upload error:", {
      listingId,
      fileName: file.fileName,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to upload file. Please try again later.",
    });
  }

  // Determine file type
  const fileType = determineMediaFileType(file.mimeType);

  // Determine storage provider enum
  const storageProviderEnum =
    env.STORAGE_PROVIDER === "firebase"
      ? StorageProvider.FIREBASE
      : env.STORAGE_PROVIDER === "aws"
        ? StorageProvider.AWS
        : StorageProvider.RAILWAY;

  // Create MediaAttachment record
  const mediaAttachment = await dbInstance.mediaAttachment.create({
    data: {
      listingId,
      fileName: file.fileName,
      fileType,
      mimeType: file.mimeType,
      fileSize,
      storageProvider: storageProviderEnum,
      storagePath: uploadResult.path,
      thumbnailUrl: uploadResult.thumbnailUrl || null,
      displayOrder,
    },
  });

  return {
    id: mediaAttachment.id,
    fileName: mediaAttachment.fileName,
    url: uploadResult.url,
    thumbnailUrl: mediaAttachment.thumbnailUrl,
  };
}

// ============================================================================
// Router Procedures
// ============================================================================

export const listingRouter = createTRPCRouter({
  /**
   * Create a new listing
   * Now supports anonymous listings with reference numbers
   */
  create: publicProcedure
    .input(createListingSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id || null;

      // Generate unique reference number
      const referenceNumber = await generateUniqueReferenceNumber(ctx.db);

      // Create ContactInfo
      const contactInfo = await ctx.db.contactInfo.create({
        data: {
          contactName: input.contactInfo.contactName,
          companyName: input.contactInfo.companyName,
          addressLine1: input.contactInfo.addressLine1,
          addressLine2: input.contactInfo.addressLine2,
          city: input.contactInfo.city,
          stateProvince: input.contactInfo.stateProvince,
          postalCode: input.contactInfo.postalCode,
          country: input.contactInfo.country,
          phone: input.contactInfo.phone,
          email: input.contactInfo.email,
          website: input.contactInfo.website,
          hearAboutUs: input.contactInfo.hearAboutUs,
          hearAboutUsOther: input.contactInfo.hearAboutUsOther,
          acceptTerms: input.contactInfo.acceptTerms,
        },
      });

      // Create ListingDetails if provided
      let listingDetails = null;
      if (input.listingDetails) {
        listingDetails = await ctx.db.listingDetails.create({
          data: {
            generalDescription: input.listingDetails.generalDescription,
            locatingSystems: input.listingDetails.locatingSystems,
            mixingSystems: input.listingDetails.mixingSystems,
            accessories: input.listingDetails.accessories,
            trailers: input.listingDetails.trailers,
            recentWorkModifications: input.listingDetails.recentWorkModifications,
            additionalInformation: input.listingDetails.additionalInformation,
            pipe: input.listingDetails.pipe,
          },
        });
      }

      // Determine listing status
      // Default: All listings are PUBLISHED and AVAILABLE (authenticated or anonymous)
      // Users can optionally specify DRAFT if they want to save without publishing
      let listingStatus: ListingStatus = ListingStatus.PUBLISHED;
      let availabilityStatus: AvailabilityStatus = AvailabilityStatus.AVAILABLE;

      if (input.status) {
        // Allow users to specify DRAFT if they want to save without publishing
        if (input.status === "DRAFT") {
          listingStatus = ListingStatus.DRAFT;
          availabilityStatus = AvailabilityStatus.UNAVAILABLE;
        }
        // PUBLISHED is the default, so no need to change if explicitly set
      }

      // Create Listing
      const listing = await ctx.db.listing.create({
        data: {
          status: listingStatus,
          availabilityStatus,
          year: input.listingInfo.year,
          manufacturer: input.listingInfo.manufacturer,
          model: input.listingInfo.model,
          condition: input.listingInfo.condition,
          serialNumber: input.listingInfo.serialNumber,
          askingPrice: input.listingInfo.askingPrice,
          currency: input.listingInfo.currency,
          hours: input.listingInfo.hours,
          miles: input.listingInfo.miles,
          repossessed: input.listingInfo.repossessed,
          equipmentCity: input.listingInfo.equipmentCity,
          equipmentStateProvince: input.listingInfo.equipmentStateProvince,
          equipmentPostalCode: input.listingInfo.equipmentPostalCode,
          equipmentCountry: input.listingInfo.equipmentCountry,
          userId,
          referenceNumber,
          contactInfoId: contactInfo.id,
          listingDetailsId: listingDetails?.id,
        },
        include: {
          contactInfo: true,
          listingDetails: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          mediaAttachments: true,
        },
      });

      return listing;
    }),

  /**
   * Update an existing listing
   */
  update: protectedProcedure
    .input(updateListingSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify ownership
      await verifyListingOwnership(ctx.db, input.listingId, userId);

      // Get current listing
      const currentListing = await ctx.db.listing.findUnique({
        where: { id: input.listingId },
        include: { contactInfo: true, listingDetails: true },
      });

      if (!currentListing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      // Update ContactInfo if provided
      if (input.contactInfo) {
        // Sanitize and validate contact info
        const sanitizedContactInfo: {
          contactName?: string;
          companyName?: string | null;
          addressLine1?: string;
          addressLine2?: string | null;
          city?: string;
          stateProvince?: string;
          postalCode?: string | null;
          country?: string;
          phone?: string;
          email?: string;
          website?: string | null;
          hearAboutUs?: string[];
          hearAboutUsOther?: string | null;
          acceptTerms?: boolean;
        } = {};

        if (input.contactInfo.contactName) {
          sanitizedContactInfo.contactName = sanitizeText(input.contactInfo.contactName).trim();
        }
        if (input.contactInfo.companyName !== undefined) {
          sanitizedContactInfo.companyName = input.contactInfo.companyName
            ? sanitizeText(input.contactInfo.companyName).trim()
            : null;
        }
        if (input.contactInfo.addressLine1) {
          sanitizedContactInfo.addressLine1 = sanitizeText(input.contactInfo.addressLine1).trim();
        }
        if (input.contactInfo.addressLine2 !== undefined) {
          sanitizedContactInfo.addressLine2 = input.contactInfo.addressLine2
            ? sanitizeText(input.contactInfo.addressLine2).trim()
            : null;
        }
        if (input.contactInfo.city) {
          sanitizedContactInfo.city = sanitizeText(input.contactInfo.city).trim();
        }
        if (input.contactInfo.stateProvince) {
          sanitizedContactInfo.stateProvince = sanitizeText(input.contactInfo.stateProvince).trim();
        }
        if (input.contactInfo.postalCode !== undefined) {
          sanitizedContactInfo.postalCode = input.contactInfo.postalCode
            ? sanitizeText(input.contactInfo.postalCode).trim()
            : null;
        }
        if (input.contactInfo.country) {
          sanitizedContactInfo.country = sanitizeText(input.contactInfo.country).trim();
        }
        if (input.contactInfo.phone) {
          sanitizedContactInfo.phone = sanitizeText(input.contactInfo.phone).trim();
        }
        if (input.contactInfo.email) {
          sanitizedContactInfo.email = input.contactInfo.email.toLowerCase().trim();
        }
        if (input.contactInfo.website !== undefined) {
          if (input.contactInfo.website && input.contactInfo.website !== "") {
            const urlValidation = validateUrl(input.contactInfo.website);
            if (!urlValidation.valid) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: urlValidation.error || "Invalid website URL",
              });
            }
            sanitizedContactInfo.website = urlValidation.normalizedUrl || input.contactInfo.website;
          } else {
            sanitizedContactInfo.website = null;
          }
        }
        if (input.contactInfo.hearAboutUs) {
          sanitizedContactInfo.hearAboutUs = input.contactInfo.hearAboutUs;
        }
        if (input.contactInfo.hearAboutUsOther !== undefined) {
          sanitizedContactInfo.hearAboutUsOther = input.contactInfo.hearAboutUsOther
            ? sanitizeText(input.contactInfo.hearAboutUsOther).trim()
            : null;
        }
        if (input.contactInfo.acceptTerms !== undefined) {
          sanitizedContactInfo.acceptTerms = input.contactInfo.acceptTerms;
        }

        await ctx.db.contactInfo.update({
          where: { id: currentListing.contactInfoId },
          data: sanitizedContactInfo,
        });
      }

      // Update or create ListingDetails if provided
      if (input.listingDetails) {
        // Sanitize listing details
        const sanitizedDetails: {
          generalDescription?: string | null;
          locatingSystems?: string | null;
          mixingSystems?: string | null;
          accessories?: string | null;
          trailers?: string | null;
          recentWorkModifications?: string | null;
          additionalInformation?: string | null;
          pipe?: string | null;
        } = {};

        if (input.listingDetails.generalDescription !== undefined) {
          sanitizedDetails.generalDescription = input.listingDetails.generalDescription
            ? sanitizeText(input.listingDetails.generalDescription).trim()
            : null;
        }
        if (input.listingDetails.locatingSystems !== undefined) {
          sanitizedDetails.locatingSystems = input.listingDetails.locatingSystems
            ? sanitizeText(input.listingDetails.locatingSystems).trim()
            : null;
        }
        if (input.listingDetails.mixingSystems !== undefined) {
          sanitizedDetails.mixingSystems = input.listingDetails.mixingSystems
            ? sanitizeText(input.listingDetails.mixingSystems).trim()
            : null;
        }
        if (input.listingDetails.accessories !== undefined) {
          sanitizedDetails.accessories = input.listingDetails.accessories
            ? sanitizeText(input.listingDetails.accessories).trim()
            : null;
        }
        if (input.listingDetails.trailers !== undefined) {
          sanitizedDetails.trailers = input.listingDetails.trailers
            ? sanitizeText(input.listingDetails.trailers).trim()
            : null;
        }
        if (input.listingDetails.recentWorkModifications !== undefined) {
          sanitizedDetails.recentWorkModifications = input.listingDetails.recentWorkModifications
            ? sanitizeText(input.listingDetails.recentWorkModifications).trim()
            : null;
        }
        if (input.listingDetails.additionalInformation !== undefined) {
          sanitizedDetails.additionalInformation = input.listingDetails.additionalInformation
            ? sanitizeText(input.listingDetails.additionalInformation).trim()
            : null;
        }
        if (input.listingDetails.pipe !== undefined) {
          sanitizedDetails.pipe = input.listingDetails.pipe
            ? sanitizeText(input.listingDetails.pipe).trim()
            : null;
        }

        if (currentListing.listingDetailsId) {
          await ctx.db.listingDetails.update({
            where: { id: currentListing.listingDetailsId },
            data: sanitizedDetails,
          });
        } else {
          const newListingDetails = await ctx.db.listingDetails.create({
            data: sanitizedDetails,
          });

          await ctx.db.listing.update({
            where: { id: input.listingId },
            data: { listingDetailsId: newListingDetails.id },
          });
        }
      }

      // Update Listing if provided
      const listingUpdateData: {
        year?: string;
        manufacturer?: string;
        model?: string;
        condition?: string;
        serialNumber?: string;
        askingPrice?: number;
        currency?: string;
        hours?: string | null;
        miles?: string | null;
        repossessed?: boolean;
        equipmentCity?: string | null;
        equipmentStateProvince?: string | null;
        equipmentPostalCode?: string | null;
        equipmentCountry?: string | null;
      } = {};

      if (input.listingInfo) {
        if (input.listingInfo.year) {
          const yearNum = parseInt(input.listingInfo.year, 10);
          if (isNaN(yearNum) || yearNum < minYear || yearNum > maxYear) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Year must be between ${minYear} and ${maxYear}`,
            });
          }
          listingUpdateData.year = sanitizeText(input.listingInfo.year).trim();
        }
        if (input.listingInfo.manufacturer)
          listingUpdateData.manufacturer = sanitizeText(input.listingInfo.manufacturer).trim();
        if (input.listingInfo.model)
          listingUpdateData.model = sanitizeText(input.listingInfo.model).trim();
        if (input.listingInfo.condition)
          listingUpdateData.condition = sanitizeText(input.listingInfo.condition).trim();
        if (input.listingInfo.serialNumber) {
          if (!serialNumberRegex.test(input.listingInfo.serialNumber)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Serial number can only contain letters, numbers, dashes, and underscores",
            });
          }
          listingUpdateData.serialNumber = sanitizeText(input.listingInfo.serialNumber).trim();
        }
        if (input.listingInfo.askingPrice !== undefined) {
          const num = typeof input.listingInfo.askingPrice === "string"
            ? parseFloat(input.listingInfo.askingPrice)
            : input.listingInfo.askingPrice;
          if (isNaN(num) || num < 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Asking price must be a valid positive number",
            });
          }
          listingUpdateData.askingPrice = num;
        }
        if (input.listingInfo.currency)
          listingUpdateData.currency = sanitizeText(input.listingInfo.currency).trim();
        if (input.listingInfo.hours !== undefined) {
          if (input.listingInfo.hours && input.listingInfo.hours !== "") {
            const num = parseFloat(input.listingInfo.hours);
            if (isNaN(num) || num < 0) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Hours must be a valid positive number",
              });
            }
            listingUpdateData.hours = sanitizeText(input.listingInfo.hours).trim();
          } else {
            listingUpdateData.hours = null;
          }
        }
        if (input.listingInfo.miles !== undefined) {
          if (input.listingInfo.miles && input.listingInfo.miles !== "") {
            const num = parseFloat(input.listingInfo.miles);
            if (isNaN(num) || num < 0) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Miles must be a valid positive number",
              });
            }
            listingUpdateData.miles = sanitizeText(input.listingInfo.miles).trim();
          } else {
            listingUpdateData.miles = null;
          }
        }
        if (input.listingInfo.repossessed !== undefined)
          listingUpdateData.repossessed = input.listingInfo.repossessed;
        if (input.listingInfo.equipmentCity !== undefined)
          listingUpdateData.equipmentCity = input.listingInfo.equipmentCity
            ? sanitizeText(input.listingInfo.equipmentCity).trim()
            : null;
        if (input.listingInfo.equipmentStateProvince !== undefined)
          listingUpdateData.equipmentStateProvince = input.listingInfo.equipmentStateProvince
            ? sanitizeText(input.listingInfo.equipmentStateProvince).trim()
            : null;
        if (input.listingInfo.equipmentPostalCode !== undefined)
          listingUpdateData.equipmentPostalCode = input.listingInfo.equipmentPostalCode
            ? sanitizeText(input.listingInfo.equipmentPostalCode).trim()
            : null;
        if (input.listingInfo.equipmentCountry !== undefined)
          listingUpdateData.equipmentCountry = input.listingInfo.equipmentCountry
            ? sanitizeText(input.listingInfo.equipmentCountry).trim()
            : null;
      }

      if (Object.keys(listingUpdateData).length > 0) {
        await ctx.db.listing.update({
          where: { id: input.listingId },
          data: listingUpdateData,
        });
      }

      // Return updated listing
      const updatedListing = await ctx.db.listing.findUnique({
        where: { id: input.listingId },
        include: {
          contactInfo: true,
          listingDetails: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          mediaAttachments: true,
        },
      });

      return updatedListing;
    }),

  /**
   * Publish a listing
   */
  publish: protectedProcedure
    .input(publishListingSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify ownership
      await verifyListingOwnership(ctx.db, input.listingId, userId);

      // Get listing with relations
      const listing = await ctx.db.listing.findUnique({
        where: { id: input.listingId },
        include: {
          contactInfo: true,
          listingDetails: true,
        },
      });

      if (!listing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      // Validate for publishing
      validateListingForPublish(listing);

      // Validate status transition
      validateCanPublish(listing.status);
      validateStatusTransition(listing.status, ListingStatus.PUBLISHED);

      // Update listing
      const updatedListing = await ctx.db.listing.update({
        where: { id: input.listingId },
        data: {
          status: ListingStatus.PUBLISHED,
          availabilityStatus: AvailabilityStatus.AVAILABLE,
        },
        include: {
          contactInfo: true,
          listingDetails: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          mediaAttachments: true,
        },
      });

      return updatedListing;
    }),

  /**
   * Reserve a listing
   */
  reserve: protectedProcedure
    .input(reserveListingSchema)
    .mutation(async ({ ctx, input }) => {
      // Get listing
      const listing = await ctx.db.listing.findUnique({
        where: { id: input.listingId },
      });

      if (!listing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      // Validate can reserve
      validateCanReserve(listing.status, listing.availabilityStatus);

      // Update listing
      const updatedListing = await ctx.db.listing.update({
        where: { id: input.listingId },
        data: {
          status: ListingStatus.RESERVED,
          availabilityStatus: AvailabilityStatus.RESERVED,
          reservedAt: new Date(),
          reservedUntil: input.reservedUntil,
        },
        include: {
          contactInfo: true,
          listingDetails: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          mediaAttachments: true,
        },
      });

      return updatedListing;
    }),

  /**
   * Mark a listing as sold
   */
  markAsSold: protectedProcedure
    .input(markAsSoldSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get listing
      const listing = await ctx.db.listing.findUnique({
        where: { id: input.listingId },
      });

      if (!listing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      // Verify ownership (only owner can mark as sold)
      await verifyListingOwnership(ctx.db, input.listingId, userId);

      // Validate can mark as sold
      validateCanMarkAsSold(listing.status);

      // Update listing
      const updatedListing = await ctx.db.listing.update({
        where: { id: input.listingId },
        data: {
          status: ListingStatus.SOLD,
          availabilityStatus: AvailabilityStatus.SOLD,
          soldAt: new Date(),
          soldPrice: input.soldPrice,
          soldTo: input.soldTo,
          soldNotes: input.soldNotes,
        },
        include: {
          contactInfo: true,
          listingDetails: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          mediaAttachments: true,
        },
      });

      return updatedListing;
    }),

  /**
   * Release a reservation
   */
  releaseReservation: protectedProcedure
    .input(releaseReservationSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify ownership
      await verifyListingOwnership(ctx.db, input.listingId, userId);

      // Get listing
      const listing = await ctx.db.listing.findUnique({
        where: { id: input.listingId },
      });

      if (!listing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      // Verify listing is RESERVED
      if (listing.status !== ListingStatus.RESERVED) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Listing must be reserved to release reservation",
        });
      }

      // Update listing
      const updatedListing = await ctx.db.listing.update({
        where: { id: input.listingId },
        data: {
          status: ListingStatus.PUBLISHED,
          availabilityStatus: AvailabilityStatus.AVAILABLE,
          reservedAt: null,
          reservedUntil: null,
        },
        include: {
          contactInfo: true,
          listingDetails: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          mediaAttachments: true,
        },
      });

      return updatedListing;
    }),

  /**
   * Archive a listing
   */
  archive: protectedProcedure
    .input(archiveListingSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify ownership
      await verifyListingOwnership(ctx.db, input.listingId, userId);

      // Update listing
      const updatedListing = await ctx.db.listing.update({
        where: { id: input.listingId },
        data: {
          status: ListingStatus.ARCHIVED,
          availabilityStatus: AvailabilityStatus.UNAVAILABLE,
        },
        include: {
          contactInfo: true,
          listingDetails: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          mediaAttachments: true,
        },
      });

      return updatedListing;
    }),

  /**
   * Get listing by ID
   * Public queries only return PUBLISHED + AVAILABLE listings
   */
  getById: publicProcedure
    .input(z.object({ listingId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const listing = await ctx.db.listing.findUnique({
        where: { id: input.listingId },
        include: {
          contactInfo: true,
          listingDetails: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          mediaAttachments: {
            orderBy: { displayOrder: "asc" },
          },
          assuredBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!listing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      // Public queries only return PUBLISHED + AVAILABLE listings
      // If user is authenticated and owns the listing, they can see it regardless of status
      const userId = ctx.session?.user?.id;
      const isOwner = userId && listing.userId === userId;

      if (
        !isOwner &&
        (listing.status !== ListingStatus.PUBLISHED ||
          listing.availabilityStatus !== AvailabilityStatus.AVAILABLE)
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      return listing;
    }),

  /**
   * Get listing by reference number
   * Public queries only return PUBLISHED + AVAILABLE listings
   * Owners can see all statuses if authenticated
   */
  getByReference: publicProcedure
    .input(z.object({ referenceNumber: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const listing = await ctx.db.listing.findUnique({
        where: { referenceNumber: input.referenceNumber },
        include: {
          contactInfo: true,
          listingDetails: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          mediaAttachments: {
            orderBy: { displayOrder: "asc" },
          },
          assuredBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!listing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      // Public queries only return PUBLISHED + AVAILABLE listings
      // If user is authenticated and owns listing, show all statuses
      const userId = ctx.session?.user?.id;
      const isOwner = userId && listing.userId === userId;

      if (
        !isOwner &&
        (listing.status !== ListingStatus.PUBLISHED ||
          listing.availabilityStatus !== AvailabilityStatus.AVAILABLE)
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      return listing;
    }),

  /**
   * Get listings by current user
   */
  getByUser: protectedProcedure
    .input(getByUserSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const listings = await ctx.db.listing.findMany({
        where: {
          userId,
          ...(input.status && { status: input.status }),
        },
        include: {
          contactInfo: true,
          listingDetails: true,
          mediaAttachments: {
            orderBy: { displayOrder: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return listings;
    }),

  /**
   * Get available listings with filters and pagination
   */
  getAvailable: publicProcedure
    .input(getAvailableSchema)
    .query(async ({ ctx, input }) => {
      const where: {
        status: ListingStatus;
        availabilityStatus: AvailabilityStatus;
        manufacturer?: { contains: string; mode: "insensitive" };
        model?: { contains: string; mode: "insensitive" };
        year?: string;
        condition?: string;
        askingPrice?: { gte?: number; lte?: number };
        assured?: boolean;
      } = {
        status: ListingStatus.PUBLISHED,
        availabilityStatus: AvailabilityStatus.AVAILABLE,
      };

      if (input.manufacturer) {
        where.manufacturer = {
          contains: input.manufacturer,
          mode: "insensitive",
        };
      }

      if (input.model) {
        where.model = {
          contains: input.model,
          mode: "insensitive",
        };
      }

      if (input.year) {
        where.year = input.year;
      }

      if (input.condition) {
        where.condition = input.condition;
      }

      if (input.minPrice !== undefined || input.maxPrice !== undefined) {
        where.askingPrice = {};
        if (input.minPrice !== undefined) {
          where.askingPrice.gte = input.minPrice;
        }
        if (input.maxPrice !== undefined) {
          where.askingPrice.lte = input.maxPrice;
        }
      }

      if (input.assured !== undefined) {
        where.assured = input.assured;
      }

      // Build orderBy based on sortBy
      const orderBy =
        input.sortBy === "assured"
          ? [{ assured: "desc" as const }, { createdAt: "desc" as const }]
          : { createdAt: "desc" as const };

      const [listings, total] = await Promise.all([
        ctx.db.listing.findMany({
          where,
          include: {
            contactInfo: true,
            listingDetails: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            mediaAttachments: {
              orderBy: { displayOrder: "asc" },
            },
          },
          orderBy,
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        ctx.db.listing.count({ where }),
      ]);

      const totalPages = Math.ceil(total / input.limit);

      return {
        listings,
        total,
        page: input.page,
        limit: input.limit,
        totalPages,
      };
    }),

  /**
   * Get sold listings
   */
  getSold: protectedProcedure
    .input(getSoldSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const where: {
        status: ListingStatus;
        userId?: string;
      } = {
        status: ListingStatus.SOLD,
      };

      // Only allow filtering by userId if it's the current user
      if (input.userId && input.userId === userId) {
        where.userId = input.userId;
      } else if (input.userId) {
        // For now, only allow users to see their own sold listings
        // In the future, add admin check here
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only view your own sold listings",
        });
      } else {
        // If no userId specified, show current user's sold listings
        where.userId = userId;
      }

      const listings = await ctx.db.listing.findMany({
        where,
        include: {
          contactInfo: true,
          listingDetails: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          mediaAttachments: {
            orderBy: { displayOrder: "asc" },
          },
        },
        orderBy: { soldAt: "desc" },
      });

      return listings;
    }),

  /**
   * Upload media files for a listing
   * Enhanced with rate limiting and comprehensive validation
   */
  uploadMedia: protectedProcedure
    .input(uploadMediaSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Rate limiting check
      const rateLimit = checkRateLimit(userId);
      if (!rateLimit.allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Rate limit exceeded. Please try again in ${rateLimit.retryAfter} seconds.`,
        });
      }

      // Verify ownership
      await verifyListingOwnership(ctx.db, input.listingId, userId);

      // Get current media count
      const currentMediaCount = await ctx.db.mediaAttachment.count({
        where: { listingId: input.listingId },
      });

      // Check total file count (current + new)
      if (currentMediaCount + input.files.length > 5) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot upload ${input.files.length} files. Listing already has ${currentMediaCount} files. Maximum is 5 files per listing.`,
        });
      }

      // Process each file
      const uploadResults = await Promise.all(
        input.files.map((file, index) =>
          processFileUpload(
            ctx.db,
            file,
            input.listingId,
            currentMediaCount + index,
          ),
        ),
      );

      return uploadResults;
    }),

  /**
   * Delete a media file from a listing
   */
  deleteMedia: protectedProcedure
    .input(deleteMediaSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify ownership
      await verifyListingOwnership(ctx.db, input.listingId, userId);

      // Get MediaAttachment record
      const mediaAttachment = await ctx.db.mediaAttachment.findUnique({
        where: { id: input.mediaId },
      });

      if (!mediaAttachment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Media attachment not found",
        });
      }

      // Verify it belongs to the listing
      if (mediaAttachment.listingId !== input.listingId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Media attachment does not belong to this listing",
        });
      }

      // Delete file from storage
      try {
        const storageProvider = StorageFactory.getProvider();
        await storageProvider.delete(mediaAttachment.storagePath);
      } catch (error) {
        console.error("Error deleting file from storage:", error);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete MediaAttachment record
      await ctx.db.mediaAttachment.delete({
        where: { id: input.mediaId },
      });

      return {
        success: true,
        message: "Media deleted successfully",
      };
    }),

  /**
   * Link an anonymous listing to the current user's account
   * Now creates a connection request instead of directly linking
   */
  linkListingToAccount: protectedProcedure
    .input(linkListingToAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Find listing by reference number
      const listing = await ctx.db.listing.findUnique({
        where: { referenceNumber: input.referenceNumber },
      });

      if (!listing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found with the provided reference number",
        });
      }

      // Check if userId is null (anonymous listing)
      if (listing.userId === null) {
        // Check if request already exists
        const existingRequest = await ctx.db.listingConnectionRequest.findUnique({
          where: {
            listingId_userId: {
              listingId: listing.id,
              userId,
            },
          },
        });

        if (existingRequest) {
          return existingRequest;
        }

        // Create connection request with status "PENDING"
        const connectionRequest = await ctx.db.listingConnectionRequest.create({
          data: {
            listingId: listing.id,
            userId,
            status: "PENDING",
          },
          include: {
            listing: {
              include: {
                contactInfo: true,
                listingDetails: true,
                mediaAttachments: {
                  orderBy: { displayOrder: "asc" },
                },
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        return connectionRequest;
      }

      // If not null, check if already owned by user
      if (listing.userId === userId) {
        // Return success - listing already linked
        return listing;
      }

      // If owned by different user, return error
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "This listing is already linked to another account",
      });
    }),

  /**
   * Request connection to an anonymous listing with optional proof document
   */
  requestListingConnection: protectedProcedure
    .input(requestListingConnectionSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Find listing by reference number
      const listing = await ctx.db.listing.findUnique({
        where: { referenceNumber: input.referenceNumber },
      });

      if (!listing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found with the provided reference number",
        });
      }

      // Verify listing userId is null (anonymous listing)
      if (listing.userId !== null) {
        if (listing.userId === userId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This listing is already linked to your account",
          });
        }
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This listing is already linked to another account",
        });
      }

      // Check for existing request
      const existingRequest = await ctx.db.listingConnectionRequest.findUnique({
        where: {
          listingId_userId: {
            listingId: listing.id,
            userId,
          },
        },
      });

      if (existingRequest) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A connection request for this listing already exists",
        });
      }

      let proofDocumentUrl: string | null = null;

      // Upload proof document if provided
      if (input.proofDocument) {
        // Validate file type (images and PDFs only)
        const allowedMimeTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
          "application/pdf",
        ];
        if (!validateMimeType(input.proofDocument.mimeType, allowedMimeTypes)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Proof document must be an image (JPEG, PNG, WebP) or PDF",
          });
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        const fileBuffer = base64ToBuffer(input.proofDocument.data);
        if (!validateFileSize(fileBuffer, maxSize)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Proof document must be 10MB or smaller",
          });
        }

        // Validate file extension
        if (!validateFileExtension(input.proofDocument.fileName)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `File ${input.proofDocument.fileName} has an executable extension and is not allowed`,
          });
        }

        // Create request first to get ID for storage path
        const tempRequest = await ctx.db.listingConnectionRequest.create({
          data: {
            listingId: listing.id,
            userId,
            status: "PENDING",
            proofNotes: input.proofNotes,
          },
        });

        // Generate storage path using request ID
        const storagePath = generateStoragePath(
          "listings/connection-proofs",
          input.proofDocument.fileName,
          tempRequest.id,
        );

        // Get storage provider
        const storageProvider = StorageFactory.getProvider();

        // Upload file
        try {
          const uploadResult = await storageProvider.upload(fileBuffer, storagePath, {
            contentType: input.proofDocument.mimeType,
          });
          proofDocumentUrl = uploadResult.url;

          // Update request with proof document URL
          const connectionRequest = await ctx.db.listingConnectionRequest.update({
            where: { id: tempRequest.id },
            data: { proofDocument: proofDocumentUrl },
            include: {
              listing: {
                include: {
                  contactInfo: true,
                  listingDetails: true,
                  mediaAttachments: {
                    orderBy: { displayOrder: "asc" },
                  },
                },
              },
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          });

          return connectionRequest;
        } catch (error) {
          // Rollback: delete request if upload fails
          await ctx.db.listingConnectionRequest.delete({
            where: { id: tempRequest.id },
          });

          console.error("Proof document upload error:", {
            requestId: tempRequest.id,
            fileName: input.proofDocument.fileName,
            error: error instanceof Error ? error.message : "Unknown error",
          });

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to upload proof document. Please try again later.",
          });
        }
      } else {
        // Create request without proof document
        const connectionRequest = await ctx.db.listingConnectionRequest.create({
          data: {
            listingId: listing.id,
            userId,
            status: "PENDING",
            proofNotes: input.proofNotes,
          },
          include: {
            listing: {
              include: {
                contactInfo: true,
                listingDetails: true,
                mediaAttachments: {
                  orderBy: { displayOrder: "asc" },
                },
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        return connectionRequest;
      }
    }),

  /**
   * Get current user's connection requests
   */
  getMyConnectionRequests: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const requests = await ctx.db.listingConnectionRequest.findMany({
      where: { userId },
      include: {
        listing: {
          select: {
            id: true,
            referenceNumber: true,
            manufacturer: true,
            model: true,
            year: true,
            condition: true,
            askingPrice: true,
            currency: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return requests;
  }),

  /**
   * Cancel a pending connection request
   */
  cancelConnectionRequest: protectedProcedure
    .input(cancelConnectionRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Find request
      const request = await ctx.db.listingConnectionRequest.findUnique({
        where: { id: input.requestId },
      });

      if (!request) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Connection request not found",
        });
      }

      // Verify request belongs to current user
      if (request.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only cancel your own connection requests",
        });
      }

      // Only allow canceling pending requests
      if (request.status !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only pending requests can be canceled",
        });
      }

      // Delete request (proof document will remain in storage, but that's okay)
      await ctx.db.listingConnectionRequest.delete({
        where: { id: input.requestId },
      });

      return {
        success: true,
        message: "Connection request canceled successfully",
      };
    }),
});

export type ListingRouter = typeof listingRouter;

