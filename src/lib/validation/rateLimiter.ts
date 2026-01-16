/**
 * Rate limiting utilities
 * 
 * Provides rate limiting functionality for API operations
 */

/**
 * In-memory rate limit store
 * In production, consider using Redis or a database
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Default rate limit configuration
 */
export const RATE_LIMIT_CONFIG = {
  uploadsPerHour: 10,
  windowMs: 60 * 60 * 1000, // 1 hour in milliseconds
} as const;

/**
 * Cleans up expired rate limit entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Checks if a user has exceeded the rate limit
 * 
 * @param userId - User ID
 * @param limit - Maximum number of operations allowed
 * @param windowMs - Time window in milliseconds
 * @returns Object with allowed status and reset time
 */
export function checkRateLimit(
  userId: string,
  limit: number = RATE_LIMIT_CONFIG.uploadsPerHour,
  windowMs: number = RATE_LIMIT_CONFIG.windowMs,
): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
} {
  // Clean up expired entries periodically
  if (Math.random() < 0.1) {
    // 10% chance to cleanup on each check
    cleanupExpiredEntries();
  }

  const now = Date.now();
  const entry = rateLimitStore.get(userId);

  if (!entry || entry.resetAt < now) {
    // Create new entry or reset expired entry
    const resetAt = now + windowMs;
    rateLimitStore.set(userId, {
      count: 1,
      resetAt,
    });

    return {
      allowed: true,
      remaining: limit - 1,
      resetAt,
    };
  }

  // Entry exists and is not expired
  if (entry.count >= limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000); // seconds
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter,
    };
  }

  // Increment count
  entry.count += 1;
  rateLimitStore.set(userId, entry);

  return {
    allowed: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Resets rate limit for a user (useful for testing or manual overrides)
 * 
 * @param userId - User ID
 */
export function resetRateLimit(userId: string): void {
  rateLimitStore.delete(userId);
}

/**
 * Gets current rate limit status for a user
 * 
 * @param userId - User ID
 * @param limit - Maximum number of operations allowed
 * @param windowMs - Time window in milliseconds
 * @returns Current rate limit status
 */
export function getRateLimitStatus(
  userId: string,
  limit: number = RATE_LIMIT_CONFIG.uploadsPerHour,
  windowMs: number = RATE_LIMIT_CONFIG.windowMs,
): {
  count: number;
  limit: number;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(userId);

  if (!entry || entry.resetAt < now) {
    return {
      count: 0,
      limit,
      remaining: limit,
      resetAt: now + windowMs,
    };
  }

  return {
    count: entry.count,
    limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt: entry.resetAt,
  };
}

