"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
                >
    Remove
                </Button >
            </TableCell >
        </TableRow >
    );
};

export default function WatchlistPage() {
    const [symbol, setSymbol] = useState("");
    const router = useRouter();
    const utils = api.useUtils();

    const { data: watchlist, isLoading } = api.watchlist.getWatchlist.useQuery();

    const addMutation = api.watchlist.addToWatchlist.useMutation({
        onSuccess: () => {
            setSymbol("");
            utils.watchlist.getWatchlist.invalidate();
            toast.success("Stock added to watchlist");
        },
        onError: (error) => {
            toast.error(`Failed to add: ${error.message}`);
        },
    });

    const removeMutation = api.watchlist.removeFromWatchlist.useMutation({
        onSuccess: () => {
            utils.watchlist.getWatchlist.invalidate();
            toast.success("Stock removed from watchlist");
        },
        onError: (error) => {
            toast.error(`Failed to remove: ${error.message}`);
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
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                    Back to Dashboard
                </Button>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Add to Watchlist</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAdd} className="flex gap-4">
                        <Input
                            type="text"
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value)}
                            placeholder="Enter symbol (e.g., AAPL)"
                            className="max-w-xs"
                        />
                        <Button type="submit" disabled={addMutation.isPending}>
                            Add Stock
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-8 text-center">Loading watchlist...</div>
                    ) : watchlist && watchlist.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Symbol</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Change</TableHead>
                                    <TableHead>Trend (30d)</TableHead>
                                    <TableHead>Added At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {watchlist.map((item: any) => (
                                    <WatchlistItem
                                        key={item._id}
                                        item={item}
                                        onRemove={() => removeMutation.mutate({ symbol: item.symbol })}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="p-8 text-center text-muted-foreground">Your watchlist is empty.</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
