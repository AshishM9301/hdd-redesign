/**
 * Account Types
 *
 * TypeScript types for account-related data structures and tRPC router outputs.
 */

import type { User } from "@prisma/client";

// Re-export User type
export type { User };

/**
 * User profile for display purposes
 */
export type UserProfile = Pick<
  User,
  "id" | "name" | "email" | "image" | "createdAt"
>;

/**
 * Profile update input
 */
export type ProfileUpdateInput = {
  name?: string;
  phone?: string;
  bio?: string;
  location?: string;
};

/**
 * Email change input
 */
export type EmailChangeInput = {
  newEmail: string;
  password: string;
};

/**
 * Notification types
 */
export type NotificationType = "offer" | "message" | "system" | "price_drop" | "listing_update";

/**
 * Notification for user
 */
export type UserNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  metadata?: Record<string, unknown>;
  listingId?: string;
  listing?: {
    id: string;
    manufacturer: string;
    model: string;
    year: string;
  };
};

/**
 * Paginated notifications response
 */
export type PaginatedNotifications = {
  notifications: UserNotification[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  unreadCount: number;
};

/**
 * Watched listing with listing details
 */
export type WatchedListing = {
  id: string;
  listingId: string;
  addedAt: Date;
  priceDrop?: number | null;
  listing: {
    id: string;
    manufacturer: string;
    model: string;
    year: string;
    askingPrice: number;
    currency: string;
    status: string;
    availabilityStatus: string;
    mediaAttachments: Array<{
      id: string;
      thumbnailUrl: string | null;
    }>;
  };
};

/**
 * Paginated watched listings response
 */
export type PaginatedWatchedListings = {
  listings: WatchedListing[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/**
 * Account statistics for dashboard
 */
export type AccountStats = {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  watchedCount: number;
  unreadNotifications: number;
  totalOffers: number;
  pendingOffers: number;
};

