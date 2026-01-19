/**
 * Cron API Route for Reservation Expiry
 * 
 * This endpoint is called by a cron job (e.g., Vercel Cron) to expire reservations
 * 
 * Security: Requires CRON_SECRET to be provided in the Authorization header
 */

import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
import { checkAndExpireReservations } from "@/server/jobs/reservation-expiry";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET handler for cron job
 * Vercel Cron format: Authorization header with secret
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = env.CRON_SECRET;

    if (!cronSecret) {
      console.error("CRON_SECRET is not configured");
      return NextResponse.json(
        { error: "Cron secret not configured" },
        { status: 500 },
      );
    }

    // Check authorization
    if (authHeader !== `Bearer ${cronSecret}`) {
      // Also check for Vercel Cron format (cron-secret header)
      const cronSecretHeader = request.headers.get("x-cron-secret");
      if (cronSecretHeader !== cronSecret) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 },
        );
      }
    }

    // Run the job
    const result = await checkAndExpireReservations();

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in reservation expiry cron job:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}

/**
 * POST handler (alternative for some cron services)
 */
export async function POST(request: NextRequest) {
  return GET(request);
}

