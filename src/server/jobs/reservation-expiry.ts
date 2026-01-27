/**
 * Reservation Expiry Job
 * 
 * Background job to automatically expire reservations that have passed their expiry time
 */

import { ListingStatus, AvailabilityStatus } from "@prisma/client";
import { db } from "@/server/db";

/**
 * Checks and expires reservations that have passed their expiry time
 * 
 * @returns Object with count of expired reservations and details
 */
export async function checkAndExpireReservations(): Promise<{
  expiredCount: number;
  expiredListingIds: string[];
  errors: string[];
}> {
  const now = new Date();
  const errors: string[] = [];
  const expiredListingIds: string[] = [];

  try {
    // Find all RESERVED listings where reservedUntil has passed
    const expiredReservations = await db.listing.findMany({
      where: {
        status: ListingStatus.RESERVED,
        reservedUntil: {
          lt: now,
        },
      },
      select: {
        id: true,
        userId: true,
        reservedUntil: true,
      },
    });

    // Update each expired reservation
    for (const listing of expiredReservations) {
      try {
        await db.listing.update({
          where: { id: listing.id },
          data: {
            status: ListingStatus.PUBLISHED,
            availabilityStatus: AvailabilityStatus.AVAILABLE,
            reservedAt: null,
            reservedUntil: null,
          },
        });

        expiredListingIds.push(listing.id);

        // Log expired reservation
        console.log("Reservation expired:", {
          listingId: listing.id,
          userId: listing.userId,
          expiredAt: listing.reservedUntil,
          processedAt: now,
        });
      } catch (error) {
        const errorMessage = `Failed to expire reservation for listing ${listing.id}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
        errors.push(errorMessage);
        console.error(errorMessage, error);
      }
    }

    return {
      expiredCount: expiredListingIds.length,
      expiredListingIds,
      errors,
    };
  } catch (error) {
    const errorMessage = `Error checking expired reservations: ${
      error instanceof Error ? error.message : "Unknown error"
    }`;
    errors.push(errorMessage);
    console.error(errorMessage, error);
    return {
      expiredCount: 0,
      expiredListingIds: [],
      errors,
    };
  }
}

