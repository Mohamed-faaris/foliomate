import { postRouter } from "~/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
import { stockRouter } from "~/server/api/routers/stock";
import { portfolioRouter } from "~/server/api/routers/portfolio";
import { watchlistRouter } from "~/server/api/routers/watchlist";

export const appRouter = createTRPCRouter({
  post: postRouter,
  stock: stockRouter,
  portfolio: portfolioRouter,
  watchlist: watchlistRouter,
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
