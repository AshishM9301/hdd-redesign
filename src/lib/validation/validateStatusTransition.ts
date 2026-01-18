/**
 * Status transition validation utilities
 * 
 * Validates listing status transitions according to business rules
 */

import { ListingStatus, AvailabilityStatus } from "../../../generated/prisma";
import { TRPCError } from "@trpc/server";

/**
 * Allowed status transitions
 */
const ALLOWED_TRANSITIONS: Record<ListingStatus, ListingStatus[]> = {
  [ListingStatus.DRAFT]: [ListingStatus.PUBLISHED, ListingStatus.ARCHIVED],
  [ListingStatus.PENDING_REVIEW]: [
    ListingStatus.PUBLISHED,
    ListingStatus.DRAFT,
    ListingStatus.ARCHIVED,
  ],
  [ListingStatus.PUBLISHED]: [
    ListingStatus.RESERVED,
    ListingStatus.SOLD,
    ListingStatus.ARCHIVED,
  ],
  [ListingStatus.RESERVED]: [
    ListingStatus.PUBLISHED,
    ListingStatus.SOLD,
    ListingStatus.ARCHIVED,
  ],
  [ListingStatus.SOLD]: [ListingStatus.ARCHIVED],
  [ListingStatus.ARCHIVED]: [], // Cannot transition from archived
} as const;

/**
 * Validates a status transition
 * 
 * @param currentStatus - Current listing status
 * @param newStatus - Desired new status
 * @throws TRPCError if transition is not allowed
 */
export function validateStatusTransition(
  currentStatus: ListingStatus,
  newStatus: ListingStatus,
): void {
  // Same status is always allowed (no-op)
  if (currentStatus === newStatus) {
    return;
  }

  const allowed = ALLOWED_TRANSITIONS[currentStatus];

  if (!allowed || !allowed.includes(newStatus)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Cannot transition from ${currentStatus} to ${newStatus}`,
    });
  }
}

/**
 * Validates that a listing can be reserved
 * 
 * @param currentStatus - Current listing status
 * @param availabilityStatus - Current availability status
 * @throws TRPCError if listing cannot be reserved
 */
export function validateCanReserve(
  currentStatus: ListingStatus,
  availabilityStatus: AvailabilityStatus,
): void {
  if (currentStatus === ListingStatus.SOLD) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Cannot reserve a listing that is already sold",
    });
  }

  if (currentStatus === ListingStatus.RESERVED) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Listing is already reserved",
    });
  }

  if (availabilityStatus !== AvailabilityStatus.AVAILABLE) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Listing must be available to be reserved",
    });
  }
}

/**
 * Validates that a listing can be marked as sold
 * 
 * @param currentStatus - Current listing status
 * @throws TRPCError if listing cannot be marked as sold
 */
export function validateCanMarkAsSold(currentStatus: ListingStatus): void {
  if (currentStatus === ListingStatus.SOLD) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Listing is already marked as sold",
    });
  }

  if (
    currentStatus !== ListingStatus.PUBLISHED &&
    currentStatus !== ListingStatus.RESERVED
  ) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Listing must be published or reserved to be marked as sold",
    });
  }
}

/**
 * Validates that a listing can be published
 * 
 * @param currentStatus - Current listing status
 * @throws TRPCError if listing cannot be published
 */
export function validateCanPublish(currentStatus: ListingStatus): void {
  if (currentStatus === ListingStatus.SOLD) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Cannot publish a listing that is already sold",
    });
  }

  if (currentStatus === ListingStatus.ARCHIVED) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Cannot publish an archived listing",
    });
  }

  // DRAFT and PENDING_REVIEW can be published
}

