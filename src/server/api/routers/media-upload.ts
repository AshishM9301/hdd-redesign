import { randomBytes } from "crypto";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { env } from "@/env";
import { sendUploadRequestEmails } from "@/lib/email";
import { StorageFactory } from "@/lib/storage";
import { DEFAULT_STORAGE_CONFIG } from "@/lib/storage/types";
import {
  extractMimeType,
  generateStoragePath,
  validateFileSize,
  validateMimeType,
} from "@/lib/storage/utils";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { MediaFileType } from "@prisma/client";

const fileMetadataSchema = z.object({
  fileName: z.string().min(1),
  storagePath: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().positive(),
});

const uploadFileSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  data: z.string().min(1), // base64 string from multipart/form-data conversion
});

const submitUploadSchema = z.object({
  contactName: z.string().min(1, "Contact name is required").trim(),
  email: z.string().email("Valid email required").trim().toLowerCase(),
  phone: z.string().optional(),
  message: z.string().optional(),
  referenceNumber: z.string().optional(),
  files: z.array(fileMetadataSchema).min(1, "At least one file is required"),
});

const cancelSchema = z
  .object({
    requestId: z.string().optional(),
    cancellationToken: z.string().optional(),
  })
  .refine(
    (data) => Boolean(data.requestId) || Boolean(data.cancellationToken),
    "Provide requestId or cancellationToken",
  );

const allowedMimeTypes = DEFAULT_STORAGE_CONFIG.allowedMimeTypes;
const maxFileSize = DEFAULT_STORAGE_CONFIG.maxFileSize;

function toBuffer(base64: string): Buffer {
  const cleaned = base64.includes(",") ? base64.split(",").pop() || "" : base64;
  return Buffer.from(cleaned, "base64");
}

function classifyFileType(mimeType: string): MediaFileType {
  if (mimeType.startsWith("image/")) return MediaFileType.IMAGE;
  if (mimeType.startsWith("video/")) return MediaFileType.VIDEO;
  return MediaFileType.DOCUMENT;
}

async function isAdmin(db: typeof import("@/server/db").db, userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === "admin";
}

export const mediaUploadRouter = createTRPCRouter({
  /**
   * Upload raw files to storage (Railway by default)
   */
  uploadFiles: publicProcedure
    .input(z.object({ files: z.array(uploadFileSchema).min(1).max(10) }))
    .mutation(async ({ ctx, input }) => {
      const storageProvider = StorageFactory.getProvider();
      const userId = ctx.session?.user?.id;

      const uploads = [];

      for (const file of input.files) {
        const buffer = toBuffer(file.data);
        const fileSize = buffer.length;
        const mimeType = extractMimeType(buffer, file.fileName) || file.mimeType;

        if (!validateMimeType(mimeType, allowedMimeTypes)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `File type ${mimeType} is not allowed.`,
          });
        }

        if (!validateFileSize(buffer, maxFileSize)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `File ${file.fileName} exceeds the maximum size.`,
          });
        }

        const storagePath = generateStoragePath(
          "upload-requests",
          file.fileName,
          userId || "anonymous",
        );

        const uploadResult = await storageProvider.upload(buffer, storagePath, {
          contentType: mimeType,
          customMetadata: {
            fileName: file.fileName,
            uploaderId: userId || "anonymous",
          },
        });

        uploads.push({
          fileName: file.fileName,
          storagePath: uploadResult.path,
          fileType: mimeType,
          fileSize,
        });
      }

      return uploads;
    }),

  /**
   * Submit media upload request (logged in or anonymous)
   */
  submitUploadRequest: publicProcedure
    .input(submitUploadSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id || null;

      let listingId: string | null = null;
      let listingMeta: {
        referenceNumber?: string | null;
        manufacturer?: string | null;
        model?: string | null;
      } | null = null;

      if (input.referenceNumber) {
        const matchedListing = await ctx.db.listing.findUnique({
          where: { referenceNumber: input.referenceNumber },
          select: {
            id: true,
            referenceNumber: true,
            manufacturer: true,
            model: true,
          },
        });
        listingId = matchedListing?.id || null;
        if (matchedListing) {
          listingMeta = {
            referenceNumber: matchedListing.referenceNumber,
            manufacturer: matchedListing.manufacturer,
            model: matchedListing.model,
          };
        }
      } else {
        const listingsByEmail = await ctx.db.listing.findMany({
          where: {
            contactInfo: {
              email: input.email,
            },
          },
          select: {
            id: true,
            referenceNumber: true,
            manufacturer: true,
            model: true,
          },
        });

        if (listingsByEmail.length === 1) {
          const listing = listingsByEmail[0]!;
          listingId = listing.id;
          listingMeta = {
            referenceNumber: listing.referenceNumber,
            manufacturer: listing.manufacturer,
            model: listing.model,
          };
        }
      }

      const cancellationToken = randomBytes(24).toString("hex");

      const request = await ctx.db.mediaUploadRequest.create({
        data: {
          listingId,
          userId,
          contactName: input.contactName,
          email: input.email,
          phone: input.phone,
          message: input.message,
          status: "PENDING",
          referenceNumber: input.referenceNumber,
          mediaFiles: input.files,
          cancellationToken,
        },
        select: {
          id: true,
          cancellationToken: true,
        },
      });

      // Fire-and-forget email notifications (admin + user)
      // Errors are logged but do not block the response.
      void (async () => {
        try {
          const admins = await ctx.db.user.findMany({
            where: { role: "admin" },
            select: { email: true },
          });
          const adminEmails = admins
            .map((a) => a.email)
            .filter((email): email is string => Boolean(email));

          await sendUploadRequestEmails({
            requestId: request.id,
            contactName: input.contactName,
            email: input.email,
            phone: input.phone,
            message: input.message,
            referenceNumber: input.referenceNumber,
            files: input.files,
            listing: listingMeta,
            siteUrl: env.SITE_URL || "",
            cancellationToken,
            isAuthenticated: Boolean(userId),
            adminEmails,
          });
        } catch (err) {
          console.error("Upload request email send failed", err);
        }
      })();

      return request;
    }),

  /**
   * Fetch logged-in user's upload requests
   */
  getMyUploadRequests: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    return ctx.db.mediaUploadRequest.findMany({
      where: { userId },
      include: {
        listing: {
          select: {
            id: true,
            referenceNumber: true,
            manufacturer: true,
            model: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  /**
   * Cancel a request via id (logged in) or cancellation token (anonymous)
   */
  cancelUploadRequest: publicProcedure
    .input(cancelSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;

      const request =
        input.requestId && userId
          ? await ctx.db.mediaUploadRequest.findUnique({
            where: { id: input.requestId },
          })
          : input.cancellationToken
            ? await ctx.db.mediaUploadRequest.findUnique({
              where: { cancellationToken: input.cancellationToken },
            })
            : null;

      if (!request) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Upload request not found",
        });
      }

      if (userId && request.userId && request.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only cancel your own requests",
        });
      }

      if (!userId && input.cancellationToken !== request.cancellationToken) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Invalid cancellation token",
        });
      }

      const updated = await ctx.db.mediaUploadRequest.update({
        where: { id: request.id },
        data: { status: "CANCELLED" },
        select: { id: true, status: true },
      });

      return updated;
    }),

  /**
   * Get a single upload request (owner or admin)
   */
  getUploadRequest: protectedProcedure
    .input(z.object({ requestId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const admin = await isAdmin(ctx.db, userId);

      const request = await ctx.db.mediaUploadRequest.findUnique({
        where: { id: input.requestId },
        include: {
          listing: {
            select: {
              id: true,
              referenceNumber: true,
              manufacturer: true,
              model: true,
            },
          },
        },
      });

      if (!request) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Upload request not found",
        });
      }

      if (!admin && request.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to view this request",
        });
      }

      return request;
    }),
});

