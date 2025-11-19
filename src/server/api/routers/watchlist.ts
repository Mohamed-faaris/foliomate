import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import clientPromise, { dbName } from "~/lib/db";

export const watchlistRouter = createTRPCRouter({
  getWatchlist: protectedProcedure.query(async ({ ctx }) => {
    const client = await clientPromise;
    const db = client.db(dbName);
    const userId = ctx.session.user.id;

    const watchlist = await db
      .collection("watchlists")
      .find({ userId })
      .toArray();
    return watchlist;
  }),

  addToWatchlist: protectedProcedure
    .input(z.object({ symbol: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const client = await clientPromise;
      const db = client.db(dbName);
      const userId = ctx.session.user.id;

      const existing = await db.collection("watchlists").findOne({
        userId,
        symbol: input.symbol,
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Stock already in watchlist",
        });
      }

      await db.collection("watchlists").insertOne({
        userId,
        symbol: input.symbol,
        addedAt: new Date(),
      });

      return { success: true };
    }),

  removeFromWatchlist: protectedProcedure
    .input(z.object({ symbol: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const client = await clientPromise;
      const db = client.db(dbName);
      const userId = ctx.session.user.id;

      await db.collection("watchlists").deleteOne({
        userId,
        symbol: input.symbol,
      });

      return { success: true };
    }),
});
