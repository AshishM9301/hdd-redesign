/**
 * Admin Router
 * 
 * Handles admin-only operations for listing management and assurance.
 */

import { z } from "zod";
import { ListingStatus } from "../../../../generated/prisma";
import {
  createTRPCRouter,
  adminProcedure,
} from "@/server/api/trpc";

export const adminRouter = createTRPCRouter({
  /**
   * Get all listings with filters (admin only)
   */
  getAllListings: adminProcedure
    .input(
      z.object({
        status: z.nativeEnum(ListingStatus).optional(),
        assured: z.boolean().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { status, assured, page, limit, search } = input;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: Record<string, unknown> = {};

      if (status) {
        where.status = status;
      }

      if (assured !== undefined) {
        where.assured = assured;
      }

      if (search) {
        where.OR = [
          { referenceNumber: { contains: search, mode: "insensitive" } },
          { manufacturer: { contains: search, mode: "insensitive" } },
          { model: { contains: search, mode: "insensitive" } },
          { serialNumber: { contains: search, mode: "insensitive" } },
        ];
      }

      // Get listings with relations
      const [listings, total] = await Promise.all([
        ctx.db.listing.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            contactInfo: true,
            listingDetails: true,
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
        }),
        ctx.db.listing.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        listings,
        total,
        page,
        limit,
        totalPages,
      };
    }),

  /**
   * Mark listing as assured
   */
  assureListing: adminProcedure
    .input(
      z.object({
        listingId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { listingId } = input;
      const userId = ctx.session.user.id;

      // Check if listing exists
      const listing = await ctx.db.listing.findUnique({
        where: { id: listingId },
      });

      if (!listing) {
        throw new Error("Listing not found");
      }

      // Update listing with assurance
      const updatedListing = await ctx.db.listing.update({
        where: { id: listingId },
        data: {
          assured: true,
          assuredAt: new Date(),
          assuredById: userId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          contactInfo: true,
          listingDetails: true,
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

      return updatedListing;
    }),

  /**
   * Remove assurance from listing
   */
  unassureListing: adminProcedure
    .input(
      z.object({
        listingId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { listingId } = input;

      // Check if listing exists
      const listing = await ctx.db.listing.findUnique({
        where: { id: listingId },
      });

      if (!listing) {
        throw new Error("Listing not found");
      }

      // Remove assurance
      const updatedListing = await ctx.db.listing.update({
        where: { id: listingId },
        data: {
          assured: false,
          assuredAt: null,
          assuredById: null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          contactInfo: true,
          listingDetails: true,
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

      return updatedListing;
    }),

  /**
   * Get all connection requests with filters (admin only)
   */
  getConnectionRequests: adminProcedure
    .input(
      z.object({
        status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { status, page, limit } = input;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: Record<string, unknown> = {};
      if (status) {
        where.status = status;
      }

      // Get requests with relations
      const [requests, total] = await Promise.all([
        ctx.db.listingConnectionRequest.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
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
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            reviewedByUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        ctx.db.listingConnectionRequest.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        requests,
        total,
        page,
        limit,
        totalPages,
      };
    }),

  /**
   * Approve a connection request and link listing to user
   */
  approveConnectionRequest: adminProcedure
    .input(
      z.object({
        requestId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { requestId } = input;
      const adminUserId = ctx.session.user.id;

      // Find request with relations
      const request = await ctx.db.listingConnectionRequest.findUnique({
        where: { id: requestId },
        include: {
          listing: true,
          user: true,
        },
      });

      if (!request) {
        throw new Error("Connection request not found");
      }

      // Verify request status is PENDING
      if (request.status !== "PENDING") {
        throw new Error(
          `Cannot approve request with status ${request.status}. Only pending requests can be approved.`,
        );
      }

      // Verify listing userId is still null (no concurrent approval)
      if (request.listing.userId !== null) {
        // Update request to REJECTED since listing is already linked
        await ctx.db.listingConnectionRequest.update({
          where: { id: requestId },
          data: {
            status: "REJECTED",
            reviewedById: adminUserId,
            reviewedAt: new Date(),
            rejectionReason: "Listing is already linked to another account",
          },
        });

        throw new Error("Listing is already linked to another account");
      }

      // Update listing userId to request's userId
      await ctx.db.listing.update({
        where: { id: request.listingId },
        data: {
          userId: request.userId,
        },
      });

      // Update request status to APPROVED
      const updatedRequest = await ctx.db.listingConnectionRequest.update({
        where: { id: requestId },
        data: {
          status: "APPROVED",
          reviewedById: adminUserId,
          reviewedAt: new Date(),
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
          reviewedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return updatedRequest;
    }),

  /**
   * Reject a connection request
   */
  rejectConnectionRequest: adminProcedure
    .input(
      z.object({
        requestId: z.string().min(1),
        rejectionReason: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { requestId, rejectionReason } = input;
      const adminUserId = ctx.session.user.id;

      // Find request
      const request = await ctx.db.listingConnectionRequest.findUnique({
        where: { id: requestId },
        include: {
          listing: true,
        },
      });

      if (!request) {
        throw new Error("Connection request not found");
      }

      // Verify request status is PENDING
      if (request.status !== "PENDING") {
        throw new Error(
          `Cannot reject request with status ${request.status}. Only pending requests can be rejected.`,
        );
      }

      // Update request status to REJECTED
      const updatedRequest = await ctx.db.listingConnectionRequest.update({
        where: { id: requestId },
        data: {
          status: "REJECTED",
          reviewedById: adminUserId,
          reviewedAt: new Date(),
          rejectionReason: rejectionReason || null,
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
          reviewedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return updatedRequest;
    }),
});

