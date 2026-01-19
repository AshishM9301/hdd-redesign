import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a unique reference number for listings
 * Format: REF-{timestamp}-{randomAlphanumeric}
 * Example: REF-20250116123456-A7B9
 */
export function generateReferenceNumber(): string {
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14); // YYYYMMDDHHmmss
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 random alphanumeric
  return `REF-${timestamp}-${randomChars}`;
}

/**
 * Checks if a reference number exists in the database
 * @param db - Prisma database instance
 * @param referenceNumber - Reference number to check
 * @returns Promise<boolean> - true if exists, false otherwise
 */
export async function referenceNumberExists(
  db: {
    listing: {
      findUnique: (args: {
        where: { referenceNumber: string }
        select?: { id: boolean }
      }) => Promise<{ id: string } | null>
    }
  },
  referenceNumber: string,
): Promise<boolean> {
  const existing = await db.listing.findUnique({
    where: { referenceNumber },
    select: { id: true },
  });
  return existing !== null;
}

/**
 * Generates a unique reference number by checking database
 * @param db - Prisma database instance
 * @returns Promise<string> - A unique reference number
 */
export async function generateUniqueReferenceNumber(
  db: {
    listing: {
      findUnique: (args: {
        where: { referenceNumber: string }
        select?: { id: boolean }
      }) => Promise<{ id: string } | null>
    }
  },
): Promise<string> {
  let referenceNumber = generateReferenceNumber();
  let attempts = 0;
  const maxAttempts = 10;

  while (await referenceNumberExists(db, referenceNumber)) {
    attempts++;
    if (attempts > maxAttempts) {
      // Fallback: add random suffix to ensure uniqueness
      referenceNumber = generateReferenceNumber() + `-${Math.random().toString(36).substring(2, 4).toUpperCase()}`;
      break;
    }
    referenceNumber = generateReferenceNumber();
  }

  return referenceNumber;
}
