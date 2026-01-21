import { TRPCError } from "@trpc/server";
import { ValueRequestStatus } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { valueRequestCreateInput } from "@/types/value-request";
import { checkRateLimit } from "@/lib/validation";
import { generateUniqueReferenceNumber } from "@/lib/utils";

export const valueRequestRouter = createTRPCRouter({
  create: publicProcedure
    .input(valueRequestCreateInput)
    .mutation(async ({ ctx, input }) => {
      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
      const rateKey = ctx.session?.user?.id ?? `anon:${input.email}`;
      const rateLimit = checkRateLimit(rateKey);

      if (!rateLimit.allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Too many submissions. Try again in ${rateLimit.retryAfter} seconds.`,
        });
      }

      if (input.honeypot?.trim()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid submission" });
      }

      const referenceNumber = await generateUniqueReferenceNumber(ctx.db);

      const record = await ctx.db.valueRequest.create({
        data: {
          referenceNumber,
          name: input.name,
          company: input.company,
          phone: input.phone,
          email: input.email,
          preferredLanguage: input.preferredLanguage,
          manufacturer: input.manufacturer,
          model: input.model,
          year: input.year,
          hours: input.hours,
          description: input.description,
          files: input.files ?? undefined,
          status: ValueRequestStatus.PENDING,
          userId: ctx.session?.user?.id ?? null,
        },
        select: {
          id: true,
          referenceNumber: true,
          createdAt: true,
          status: true,
        },
      });

      return {
        id: record.id,
        referenceNumber: record.referenceNumber,
        createdAt: record.createdAt,
        status: record.status,
      };
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    }),
});

export type ValueRequestRouter = typeof valueRequestRouter;

