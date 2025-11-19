"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

export default function TradePage() {
    const [symbol, setSymbol] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");

    const searchResults = api.stock.search.useQuery(
        { query: searchQuery },
        { enabled: !!searchQuery }
    );

    const quote = api.stock.getQuote.useQuery(
        { symbol },
        { enabled: !!symbol }
    );

    const buyMutation = api.portfolio.buyStock.useMutation({
        onSuccess: () => {
            alert("Buy successful!");
            utils.portfolio.getPortfolio.invalidate();
        },
        onError: (error) => {
            alert(`Buy failed: ${error.message}`);
        },
    });

    const sellMutation = api.portfolio.sellStock.useMutation({
        onSuccess: () => {
            alert("Sell successful!");
            utils.portfolio.getPortfolio.invalidate();
        },
        onError: (error) => {
            alert(`Sell failed: ${error.message}`);
        },
    });

    const utils = api.useUtils();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Trigger search via state
    };

    const handleBuy = () => {
        if (!quote.data) return;
        buyMutation.mutate({
            symbol: quote.data.symbol,
            quantity,
            price: quote.data.price,
        });
    };

    const handleSell = () => {
        if (!quote.data) return;
        sellMutation.mutate({
            symbol: quote.data.symbol,
            quantity,
            price: quote.data.price,
        });
    };

    return (
        <div className="container mx-auto p-8">
            <h1 className="mb-8 text-3xl font-bold">Trade Stocks</h1>

            <div className="mb-8">
                <h2 className="mb-4 text-xl font-semibold">Search Stock</h2>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Enter symbol (e.g., IBM)"
                        className="rounded border p-2"
                    />
                </div>
                {searchResults.data && (
                    <ul className="mt-4 border rounded p-4 bg-white">
                        {searchResults.data.map((match: any) => (
                            <li
                                key={match.symbol}
                                className="cursor-pointer p-2 hover:bg-gray-100"
                                onClick={() => {
                                    setSymbol(match.symbol);
                                    setSearchQuery("");
                                }}
                            >
                                {match.symbol} - {match.name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {symbol && (
                <div className="rounded-lg border bg-white p-6 shadow-md">
                    <h2 className="mb-4 text-2xl font-bold">{symbol}</h2>
                    {quote.isLoading ? (
                        <p>Loading quote...</p>
                    ) : quote.data ? (
                        <div>
                            <p className="text-xl">Price: ${quote.data.price}</p>
                            <p className={`text-lg ${quote.data.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                                Change: {quote.data.change} ({quote.data.changePercent})
                            </p>

                            <div className="mt-6 flex items-center gap-4">
                                <label className="font-semibold">Quantity:</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                                    className="w-20 rounded border p-2"
                                />
                                <button
                                    onClick={handleBuy}
                                    disabled={buyMutation.isPending}
                                    className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:opacity-50"
                                >
                                    Buy
                                </button>
                                <button
                                    onClick={handleSell}
                                    disabled={sellMutation.isPending}
                                    className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50"
                                >
                                    Sell
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p>Failed to load quote.</p>
                    )}
                </div>
            )}
        </div>
    );
}
