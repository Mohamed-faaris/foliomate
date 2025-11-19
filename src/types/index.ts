// Stock types
export interface StockSearchResult {
    symbol: string;
    name: string;
    type: string;
    region: string;
    currency: string;
}

export interface StockQuote {
    symbol: string;
    price: number;
    change: number;
    changePercent: string;
}

export interface StockHistoryPoint {
    date: string;
    price: number;
}

// Portfolio types
export interface Holding {
    _id?: string;
    userId: string;
    symbol: string;
    quantity: number;
    avgPrice: number;
}

export interface Transaction {
    _id: string;
    userId: string;
    type: "BUY" | "SELL";
    symbol: string;
    quantity: number;
    price: number;
    date: Date | string;
}

export interface WatchlistItem {
    _id: string;
    userId: string;
    symbol: string;
    addedAt: Date | string;
}

// Chart types
export interface ChartDataPoint {
    name: string;
    value: number;
}

// Better Auth types
export interface BetterAuthUser {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
