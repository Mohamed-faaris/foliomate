import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import clientPromise, { dbName } from "~/lib/db";
import { ObjectId } from "mongodb";

export const portfolioRouter = createTRPCRouter({
    getPortfolio: protectedProcedure.query(async ({ ctx }) => {
        const client = await clientPromise;
        const db = client.db(dbName);
        const userId = ctx.session.user.id;

        const portfolio = await db.collection("portfolios").find({ userId }).toArray();
        // Calculate total value, etc. if needed.
        // For now, just return the holdings.

        // Also get cash balance
        // Assuming we store cash in a separate collection or user document.
        // Let's assume user document has 'cash' field, or we create a 'wallets' collection.
        // For simplicity, let's store cash in 'portfolios' collection as a special entry or just use a 'wallets' collection.

        // Let's use a 'wallets' collection.
        const wallet = await db.collection("wallets").findOne({ userId });
        const cash = wallet ? wallet.cash : 10000; // Default 10k virtual cash

        return {
            holdings: portfolio,
            cash,
        };
    }),

    buyStock: protectedProcedure
        .input(
            z.object({
                symbol: z.string(),
                quantity: z.number().min(1),
                price: z.number().positive(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const client = await clientPromise;
            const db = client.db(dbName);
            const userId = ctx.session.user.id;
            const totalCost = input.quantity * input.price;

            // Check cash
            const wallet = await db.collection("wallets").findOne({ userId });
            const currentCash = wallet ? wallet.cash : 10000;

            if (currentCash < totalCost) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Insufficient funds",
                });
            }

            // Update cash
            await db.collection("wallets").updateOne(
                { userId },
                { $set: { cash: currentCash - totalCost }, $setOnInsert: { userId } },
                { upsert: true }
            );

            // Update portfolio
            const existingHolding = await db.collection("portfolios").findOne({
                userId,
                symbol: input.symbol,
            });

            if (existingHolding) {
                const newQuantity = existingHolding.quantity + input.quantity;
                const newAvgPrice =
                    (existingHolding.quantity * existingHolding.avgPrice + totalCost) /
                    newQuantity;

                await db.collection("portfolios").updateOne(
                    { _id: existingHolding._id },
                    { $set: { quantity: newQuantity, avgPrice: newAvgPrice } }
                );
            } else {
                await db.collection("portfolios").insertOne({
                    userId,
                    symbol: input.symbol,
                    quantity: input.quantity,
                    avgPrice: input.price,
                });
            }

            // Record transaction
            await db.collection("transactions").insertOne({
                userId,
                type: "BUY",
                symbol: input.symbol,
                quantity: input.quantity,
                price: input.price,
                date: new Date(),
            });

            return { success: true };
        }),

    sellStock: protectedProcedure
        .input(
            z.object({
                symbol: z.string(),
                quantity: z.number().min(1),
                price: z.number().positive(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const client = await clientPromise;
            const db = client.db(dbName);
            const userId = ctx.session.user.id;
            const totalValue = input.quantity * input.price;

            // Check holding
            const existingHolding = await db.collection("portfolios").findOne({
                userId,
                symbol: input.symbol,
            });

            if (!existingHolding || existingHolding.quantity < input.quantity) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Insufficient shares",
                });
            }

            // Update portfolio
            if (existingHolding.quantity === input.quantity) {
                await db.collection("portfolios").deleteOne({ _id: existingHolding._id });
            } else {
                await db.collection("portfolios").updateOne(
                    { _id: existingHolding._id },
                    { $inc: { quantity: -input.quantity } }
                );
            }

            // Update cash
            await db.collection("wallets").updateOne(
                { userId },
                { $inc: { cash: totalValue } },
                { upsert: true }
            );

            // Record transaction
            await db.collection("transactions").insertOne({
                userId,
                type: "SELL",
                symbol: input.symbol,
                quantity: input.quantity,
                price: input.price,
                date: new Date(),
            });

            return { success: true };
        }),
});
