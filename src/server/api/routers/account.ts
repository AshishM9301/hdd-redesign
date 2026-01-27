/**
 * Account Router
 *
 * Handles user account operations including profile management, notifications, watchlist, and listings.
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

// ============================================================================
// Validation Schemas
// ============================================================================

const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100, "Name must be between 1 and 100 characters"),
  phone: z.string().optional().nullable(),
  bio: z.string().max(500, "Bio must not exceed 500 characters").optional().nullable(),
  location: z.string().max(100, "Location must not exceed 100 characters").optional().nullable(),
});

const emailChangeSchema = z.object({
  newEmail: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const notificationsQuerySchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(50).default(20),
  type: z.enum(["offer", "message", "system", "price_drop", "listing_update"]).optional(),
  unreadOnly: z.boolean().default(false),
});

const watchlistQuerySchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(50).default(20),
  sortBy: z.enum(["addedAt", "price", "name"]).default("addedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const myListingsQuerySchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(50).default(20),
  status: z.enum(["all", "active", "pending", "sold", "draft"]).default("all"),
});

// ============================================================================
// Helper Functions
// ============================================================================

async function getUserById(db: PrismaClient, userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
    },
  });
}

async function getAccountStats(db: PrismaClient, userId: string) {
  const [totalListings, activeListings, soldListings, watchedCount, unreadNotifications, totalOffers, pendingOffers] =
    await Promise.all([
      db.listing.count({ where: { userId } }),
      db.listing.count({ where: { userId, status: "PUBLISHED", availabilityStatus: "AVAILABLE" } }),
      db.listing.count({ where: { userId, status: "SOLD" } }),
      // Watchlist count - using a placeholder until the WatchList model is created
      db.listing.count({ where: { userId } }), // Placeholder
      db.offer.count({ where: { listing: { userId }, status: "PENDING" } }), // Using offers as placeholder for notifications
      db.offer.count({ where: { userId } }),
      db.offer.count({ where: { userId, status: "PENDING" } }),
    ]);

  return {
    totalListings,
    activeListings,
    soldListings,
    watchedCount,
    unreadNotifications,
    totalOffers,
    pendingOffers,
  };
}

// ============================================================================
// Router Procedures
// ============================================================================

export const accountRouter = createTRPCRouter({
  /**
   * Get current user's profile
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await getUserById(ctx.db, ctx.session.user.id);

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user;
  }),

  /**
   * Update user profile
   */
  updateProfile: protectedProcedure
    .input(profileUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          name: input.name,
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
        },
      });

      return user;
    }),

  /**
   * Change email address
   * Note: This requires additional verification logic with better-auth
   */
  changeEmail: protectedProcedure
    .input(emailChangeSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify user exists
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        include: { accounts: true },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Check if email is already in use
      const existingUser = await ctx.db.user.findUnique({
        where: { email: input.newEmail },
      });

      if (existingUser && existingUser.id !== ctx.session.user.id) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email is already in use",
        });
      }

      // Update email
      const updatedUser = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { email: input.newEmail },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
        },
      });

      return updatedUser;
    }),

  /**
   * Get account statistics for dashboard
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    return getAccountStats(ctx.db, ctx.session.user.id);
  }),

  /**
   * Get user notifications
   */
  getNotifications: protectedProcedure
    .input(notificationsQuerySchema)
    .query(async ({ ctx, input }) => {
      const { page, pageSize, type, unreadOnly } = input;

      // Build where clause
      const where: Record<string, unknown> = {};

      // For now, we'll use offers as a proxy for notifications
      // In a real implementation, you'd have a Notification model
      if (unreadOnly) {
        where.status = "PENDING";
      }
      if (type) {
        // Filter by type would require a Notification model
      }

      const [notifications, total, unreadCount] = await Promise.all([
        ctx.db.offer.findMany({
          where: {
            listing: { userId: ctx.session.user.id },
            status: "PENDING",
          },
          include: {
            listing: {
              select: {
                id: true,
                manufacturer: true,
                model: true,
                year: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        ctx.db.offer.count({
          where: {
            listing: { userId: ctx.session.user.id },
            status: "PENDING",
          },
        }),
        ctx.db.offer.count({
          where: {
            listing: { userId: ctx.session.user.id },
            status: "PENDING",
          },
        }),
      ]);

      // Transform offers to notification format
      const transformedNotifications = notifications.map((offer) => ({
        id: offer.id,
        type: "offer" as const,
        title: "New Offer Received",
        message: `You received an offer of ${offer.currency} ${offer.offerAmount.toString()} for your ${offer.listing.year} ${offer.listing.manufacturer} ${offer.listing.model}`,
        read: false,
        createdAt: offer.createdAt,
        listingId: offer.listingId,
        listing: offer.listing,
      }));

      return {
        notifications: transformedNotifications,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        unreadCount,
      };
    }),

  /**
   * Mark notification as read
   */
  markNotificationRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // For now, we'll update the offer status
      const offer = await ctx.db.offer.update({
        where: { id: input.id },
        data: { status: "ACCEPTED" },
      });

      return offer;
    }),

  /**
   * Get user's watched listings
   */
  getWatchedListings: protectedProcedure
    .input(watchlistQuerySchema)
    .query(async ({ ctx, input }) => {
      const { page, pageSize, sortBy, sortOrder } = input;

      // Get user's listings as a placeholder for watchlist
      // In a real implementation, you'd have a WatchList model
      const [listings, total] = await Promise.all([
        ctx.db.listing.findMany({
          where: { userId: ctx.session.user.id },
          include: {
            mediaAttachments: {
              where: { fileType: "IMAGE" },
              select: { id: true, thumbnailUrl: true },
              take: 1,
            },
          },
          orderBy: {
            [sortBy === "name" ? "model" : sortBy === "addedAt" ? "createdAt" : sortBy]: sortOrder
          },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        ctx.db.listing.count({ where: { userId: ctx.session.user.id } }),
      ]);

      const transformedListings = listings.map((listing) => ({
        id: listing.id,
        listingId: listing.id,
        addedAt: listing.createdAt,
        listing: {
          id: listing.id,
          manufacturer: listing.manufacturer,
          model: listing.model,
          year: listing.year,
          askingPrice: Number(listing.askingPrice),
          currency: listing.currency,
          status: listing.status,
          availabilityStatus: listing.availabilityStatus,
          mediaAttachments: listing.mediaAttachments,
        },
      }));

      return {
        listings: transformedListings,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }),

  /**
   * Remove listing from watchlist
   */
  removeFromWatchlist: protectedProcedure
    .input(z.object({ listingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // This is a placeholder - in a real implementation, you'd delete from WatchList model
      return { success: true, listingId: input.listingId };
    }),

  /**
   * Get user's own listings
   */
  getMyListings: protectedProcedure
    .input(myListingsQuerySchema)
    .query(async ({ ctx, input }) => {
      const { page, pageSize, status } = input;

      // Build where clause based on status
      const where: Record<string, unknown> = { userId: ctx.session.user.id };

      if (status !== "all") {
        switch (status) {
          case "active":
            where.status = "PUBLISHED";
            where.availabilityStatus = "AVAILABLE";
            break;
          case "pending":
            where.status = "PENDING_REVIEW";
            break;
          case "sold":
            where.status = "SOLD";
            break;
          case "draft":
            where.status = "DRAFT";
            break;
        }
      }

      const [listings, total] = await Promise.all([
        ctx.db.listing.findMany({
          where,
          include: {
            mediaAttachments: {
              where: { fileType: "IMAGE" },
              select: { id: true, thumbnailUrl: true },
              take: 1,
            },
            _count: {
              select: {
                offers: true,
                connectionRequests: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        ctx.db.listing.count({ where }),
      ]);

      return {
        listings,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }),

  /**
   * Change user password
   */
  changePassword: protectedProcedure
    .input(z.object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z.string().min(8, "Password must be at least 8 characters"),
    }))
    .mutation(async () => {
      // In a real implementation, you'd verify the current password
      // and update it using better-auth's password change functionality
      // For now, this is a placeholder

      throw new TRPCError({
        code: "NOT_IMPLEMENTED",
        message: "Password change requires additional implementation with better-auth",
      });
    }),

  /**
   * Delete user account
   * Warning: This is a destructive operation
   */
  deleteAccount: protectedProcedure
    .input(z.object({ password: z.string().min(1) }))
    .mutation(async () => {
      // In a real implementation, you'd:
      // 1. Verify the password
      // 2. Delete all user data
      // 3. Delete the user account
      // This requires careful handling with better-auth

      throw new TRPCError({
        code: "NOT_IMPLEMENTED",
        message: "Account deletion requires additional implementation with better-auth",
      });
    }),
});

