import { postRouter } from "@/server/api/routers/post";
import { listingRouter } from "@/server/api/routers/listing";
import { adminRouter } from "@/server/api/routers/admin";
import { mediaUploadRouter } from "@/server/api/routers/media-upload";
import { tradeInRouter } from "@/server/api/routers/trade-in";
import { valueRequestRouter } from "@/server/api/routers/value-request";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  listing: listingRouter,
  admin: adminRouter,
  mediaUpload: mediaUploadRouter,
  tradeIn: tradeInRouter,
  valueRequest: valueRequestRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
