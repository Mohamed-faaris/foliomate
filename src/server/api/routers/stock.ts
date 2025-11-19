import { z } from "zod";
import { env } from "~/env";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import clientPromise, { dbName } from "~/lib/db";
import type { StockSearchResult } from "~/types";

// Alpha Vantage API response types
interface AlphaVantageMatch {
    "1. symbol": string;
    "2. name": string;
    "3. type": string;
    "4. region": string;
    "8. currency": string;
}

interface AlphaVantageQuote {
    "01. symbol": string;
    "05. price": string;
    "09. change": string;
    "10. change percent": string;
}

interface AlphaVantageTimeSeriesDaily {
    "4. close": string;
}

// Helper to generate consistent mock data based on symbol
const getMockPrice = (symbol: string) => {
    let hash = 0;
    for (let i = 0; i < symbol.length; i++) {
        hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Map hash to a price between 10 and 1000
    return 10 + (Math.abs(hash) % 990);
};

const getMockQuote = (symbol: string) => {
    const price = getMockPrice(symbol);
    const isPositive = price % 2 === 0;
    const change = price * 0.02 * (isPositive ? 1 : -1);

    return {
        symbol: symbol.toUpperCase(),
        price: parseFloat(price.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: (isPositive ? "+" : "") + (2.0).toFixed(2) + "%",
    };
};

const getMockHistory = (symbol: string) => {
    const basePrice = getMockPrice(symbol);
    const history = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Random walk
        const randomChange = (Math.random() - 0.5) * basePrice * 0.05;
        const price = basePrice + randomChange;

        history.push({
            date: date.toISOString().split("T")[0],
            price: parseFloat(price.toFixed(2)),
        });
    }

    return history.reverse();
};

export const stockRouter = createTRPCRouter({
    search: protectedProcedure
        .input(z.object({ query: z.string().min(1) }))
        .query(async ({ input }): Promise<StockSearchResult[]> => {
            const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${input.query}&apikey=${env.ALPHA_VANTAGE_API_KEY}`;
            const response = await fetch(url);
            const data: { Note?: string; Information?: string; bestMatches?: AlphaVantageMatch[] } = await response.json();

            if (data.Note ?? data.Information) {
                console.warn("API limit reached, returning mock search results");
                return [
                    {
                        symbol: "AAPL",
                        name: "Apple Inc.",
                        type: "Equity",
                        region: "United States",
                        currency: "USD",
                    },
                    {
                        symbol: "MSFT",
                        name: "Microsoft Corporation",
                        type: "Equity",
                        region: "United States",
                        currency: "USD",
                    },
                    {
                        symbol: "GOOGL",
                        name: "Alphabet Inc.",
                        type: "Equity",
                        region: "United States",
                        currency: "USD",
                    },
                    {
                        symbol: "AMZN",
                        name: "Amazon.com Inc.",
                        type: "Equity",
                        region: "United States",
                        currency: "USD",
                    },
                    {
                        symbol: "TSLA",
                        name: "Tesla Inc.",
                        type: "Equity",
                        region: "United States",
                        currency: "USD",
                    },
                ].filter(
                    (s) =>
                        s.symbol.includes(input.query.toUpperCase()) ||
                        s.name.toLowerCase().includes(input.query.toLowerCase()),
                );
            }

            if (!data.bestMatches) {
                return [];
            }

            return data.bestMatches.map((match) => ({
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
                    symbol: cachedQuote.symbol as string,
                    price: cachedQuote.price as number,
                    change: cachedQuote.change as number,
                    changePercent: cachedQuote.changePercent as string,
                };
            }

            console.log(`[getQuote] Cache miss for ${symbol}, fetching from API`);
            const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${env.ALPHA_VANTAGE_API_KEY}`;
            const response = await fetch(url);
            const data: { Note?: string; Information?: string; "Global Quote"?: AlphaVantageQuote } = await response.json();
            console.log(
                `[getQuote] API response for ${symbol}:`,
                JSON.stringify(data),
            );

            let result;

            if (data.Note ?? data.Information) {
                console.warn(
                    `[getQuote] API limit reached for ${symbol}, using mock data`,
                );
                result = getMockQuote(symbol);
            } else {
                const quote = data["Global Quote"];
                if (!quote || Object.keys(quote).length === 0) {
                    console.error(`[getQuote] Stock not found: ${symbol}`);
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Stock not found",
                    });
                }

                result = {
                    symbol: quote["01. symbol"],
                    price: parseFloat(quote["05. price"]),
                    change: parseFloat(quote["09. change"]),
                    changePercent: quote["10. change percent"],
                };
            }

            // Update cache
            await db.collection("stock_quotes").updateOne(
                { symbol },
                {
                    $set: {
                        ...result,
                        updatedAt: new Date(),
                    },
                },
                { upsert: true },
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
                return cachedHistory.data as { date: string; price: number }[];
            }

            const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${env.ALPHA_VANTAGE_API_KEY}`;
            const response = await fetch(url);
            const data: {
                Note?: string;
                Information?: string;
                "Time Series (Daily)"?: Record<string, AlphaVantageTimeSeriesDaily>
            } = await response.json();

            let historyData;

            if (data.Note ?? data.Information) {
                console.warn(
                    `[getHistory] API limit reached for ${symbol}, using mock data`,
                );
                historyData = getMockHistory(symbol);
            } else {
                const timeSeries = data["Time Series (Daily)"];
                if (!timeSeries) {
                    return [];
                }

                // Get last 30 days and format
                historyData = Object.entries(timeSeries)
                    .slice(0, 30)
                    .map(([date, values]) => ({
                        date,
                        price: parseFloat(values["4. close"]),
                    }))
                    .reverse();
            }

            // Update cache
            await db.collection("stock_history").updateOne(
                { symbol },
                {
                    $set: {
                        data: historyData,
                        updatedAt: new Date(),
                    },
                },
                { upsert: true },
            );

            return historyData;
        }),
});
