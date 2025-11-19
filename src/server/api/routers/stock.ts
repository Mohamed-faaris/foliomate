import { z } from "zod";
import { env } from "~/env";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import clientPromise, { dbName } from "~/lib/db";

export const stockRouter = createTRPCRouter({
    search: protectedProcedure
        .input(z.object({ query: z.string().min(1) }))
        .query(async ({ input }) => {
            const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${input.query}&apikey=${env.ALPHA_VANTAGE_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data["Note"]) {
                throw new TRPCError({
                    code: "TOO_MANY_REQUESTS",
                    message: "API limit reached",
                });
            }

            if (!data["bestMatches"]) {
                return [];
            }

            return data["bestMatches"].map((match: any) => ({
                symbol: match["1. symbol"],
                name: match["2. name"],
                type: match["3. type"],
                region: match["4. region"],
                currency: match["8. currency"],
            }));
        }),

    getQuote: protectedProcedure
        .input(z.object({ symbol: z.string().min(1) }))
        .query(async ({ input }) => {
            console.log(`[getQuote] Fetching quote for: ${input.symbol}`);
            const client = await clientPromise;
            const db = client.db(dbName);
            const symbol = input.symbol.toUpperCase();

            // Check cache (5 minutes)
            const cachedQuote = await db.collection("stock_quotes").findOne({
                symbol,
                updatedAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) },
            });

            if (cachedQuote) {
                console.log(`[getQuote] Cache hit for ${symbol}`);
                return {
                    symbol: cachedQuote.symbol,
                    price: cachedQuote.price,
                    change: cachedQuote.change,
                    changePercent: cachedQuote.changePercent,
                };
            }

            console.log(`[getQuote] Cache miss for ${symbol}, fetching from API`);
            const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${env.ALPHA_VANTAGE_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            console.log(`[getQuote] API response for ${symbol}:`, JSON.stringify(data));

            if (data["Note"]) {
                console.error(`[getQuote] API limit reached for ${symbol}`);
                throw new TRPCError({
                    code: "TOO_MANY_REQUESTS",
                    message: "API limit reached",
                });
            }

            const quote = data["Global Quote"];
            if (!quote || Object.keys(quote).length === 0) {
                console.error(`[getQuote] Stock not found: ${symbol}`);
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Stock not found",
                });
            }

            const result = {
                symbol: quote["01. symbol"],
                price: parseFloat(quote["05. price"]),
                change: parseFloat(quote["09. change"]),
                changePercent: quote["10. change percent"],
            };

            // Update cache
            await db.collection("stock_quotes").updateOne(
                { symbol },
                {
                    $set: {
                        ...result,
                        updatedAt: new Date(),
                    },
                },
                { upsert: true }
            );
            console.log(`[getQuote] Cache updated for ${symbol}`);

            return result;
        }),

    getHistory: protectedProcedure
        .input(z.object({ symbol: z.string().min(1) }))
        .query(async ({ input }) => {
            const client = await clientPromise;
            const db = client.db(dbName);
            const symbol = input.symbol.toUpperCase();

            // Check cache (24 hours)
            const cachedHistory = await db.collection("stock_history").findOne({
                symbol,
                updatedAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            });

            if (cachedHistory) {
                return cachedHistory.data;
            }

            const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${env.ALPHA_VANTAGE_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data["Note"]) {
                throw new TRPCError({
                    code: "TOO_MANY_REQUESTS",
                    message: "API limit reached",
                });
            }

            const timeSeries = data["Time Series (Daily)"];
            if (!timeSeries) {
                return [];
            }

            // Get last 30 days and format
            const historyData = Object.entries(timeSeries)
                .slice(0, 30)
                .map(([date, values]: [string, any]) => ({
                    date,
                    price: parseFloat(values["4. close"]),
                }))
                .reverse();

            // Update cache
            await db.collection("stock_history").updateOne(
                { symbol },
                {
                    $set: {
                        data: historyData,
                        updatedAt: new Date(),
                    },
                },
                { upsert: true }
            );

            return historyData;
        }),
});
