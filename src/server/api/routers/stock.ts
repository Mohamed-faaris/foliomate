import { z } from "zod";
import { env } from "~/env";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

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
            const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${input.symbol}&apikey=${env.ALPHA_VANTAGE_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data["Note"]) {
                throw new TRPCError({
                    code: "TOO_MANY_REQUESTS",
                    message: "API limit reached",
                });
            }

            const quote = data["Global Quote"];
            if (!quote || Object.keys(quote).length === 0) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Stock not found",
                });
            }

            return {
                symbol: quote["01. symbol"],
                price: parseFloat(quote["05. price"]),
                change: parseFloat(quote["09. change"]),
                changePercent: quote["10. change percent"],
            };
        }),

    getHistory: protectedProcedure
        .input(z.object({ symbol: z.string().min(1) }))
        .query(async ({ input }) => {
            const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${input.symbol}&apikey=${env.ALPHA_VANTAGE_API_KEY}`;
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
            return Object.entries(timeSeries)
                .slice(0, 30)
                .map(([date, values]: [string, any]) => ({
                    date,
                    price: parseFloat(values["4. close"]),
                }))
                .reverse();
        }),
});
