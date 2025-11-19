"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

export default function WatchlistPage() {
    const [symbol, setSymbol] = useState("");
    const router = useRouter();
    const utils = api.useUtils();

    const { data: watchlist, isLoading } = api.watchlist.getWatchlist.useQuery();

    const addMutation = api.watchlist.addToWatchlist.useMutation({
        onSuccess: () => {
            setSymbol("");
            utils.watchlist.getWatchlist.invalidate();
        },
        onError: (error) => {
            alert(`Failed to add: ${error.message}`);
        },
    });

    const removeMutation = api.watchlist.removeFromWatchlist.useMutation({
        onSuccess: () => {
            utils.watchlist.getWatchlist.invalidate();
        },
        onError: (error) => {
            alert(`Failed to remove: ${error.message}`);
        },
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!symbol) return;
        addMutation.mutate({ symbol });
    };

    return (
        <div className="container mx-auto p-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold">Watchlist</h1>
                <button
                    onClick={() => router.push("/dashboard")}
                    className="text-blue-500 hover:underline"
                >
                    Back to Dashboard
                </button>
            </div>

            <form onSubmit={handleAdd} className="mb-8 flex gap-4">
                <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    placeholder="Enter symbol (e.g., AAPL)"
                    className="rounded border p-2"
                />
                <button
                    type="submit"
                    disabled={addMutation.isPending}
                    className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
                >
                    Add Stock
                </button>
            </form>

            {isLoading ? (
                <p>Loading watchlist...</p>
            ) : watchlist && watchlist.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border rounded-lg">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="px-6 py-3 font-semibold">Symbol</th>
                                <th className="px-6 py-3 font-semibold">Added At</th>
                                <th className="px-6 py-3 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {watchlist.map((item: any) => (
                                <tr key={item._id} className="border-t">
                                    <td className="px-6 py-4">{item.symbol}</td>
                                    <td className="px-6 py-4">{new Date(item.addedAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => removeMutation.mutate({ symbol: item.symbol })}
                                            disabled={removeMutation.isPending}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>Your watchlist is empty.</p>
            )}
        </div>
    );
}
