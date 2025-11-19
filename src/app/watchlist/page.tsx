"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import type { WatchlistItem } from "~/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { toast } from "sonner";
import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";

// Component to fetch and display price for a single symbol
const WatchlistItemRow = ({
  item,
  onRemove,
}: {
  item: WatchlistItem;
  onRemove: () => void;
}) => {
  const quote = api.stock.getQuote.useQuery(
    { symbol: item.symbol },
    { refetchInterval: 60000 },
  );

  const history = api.stock.getHistory.useQuery(
    { symbol: item.symbol },
    { refetchInterval: false },
  );

  return (
    <TableRow>
      <TableCell className="font-medium">{item.symbol}</TableCell>
      <TableCell>
        {quote.isLoading ? (
          <span className="text-muted-foreground">Loading...</span>
        ) : quote.data ? (
          <span className="font-mono">${quote.data.price}</span>
        ) : (
          <span className="text-destructive">N/A</span>
        )}
      </TableCell>
      <TableCell>
        {quote.isLoading ? (
          <span className="text-muted-foreground">...</span>
        ) : quote.data ? (
          <span
            className={
              quote.data.change >= 0 ? "text-green-600" : "text-red-600"
            }
          >
            {quote.data.change} ({quote.data.changePercent})
          </span>
        ) : (
          <span className="text-destructive">N/A</span>
        )}
      </TableCell>
      <TableCell className="w-[150px]">
        {history.data && history.data.length > 0 ? (
          <div className="h-[40px] w-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history.data}>
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={
                    quote.data?.change && quote.data.change >= 0
                      ? "#16a34a"
                      : "#dc2626"
                  }
                  strokeWidth={2}
                  dot={false}
                />
                <YAxis domain={["dataMin", "dataMax"]} hide />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">No data</span>
        )}
      </TableCell>
      <TableCell>{new Date(item.addedAt).toLocaleDateString()}</TableCell>
      <TableCell className="text-right">
        <Button variant="destructive" size="sm" onClick={onRemove}>
          Remove
        </Button>
      </TableCell>
    </TableRow>
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
      void utils.watchlist.getWatchlist.invalidate();
      toast.success("Stock added to watchlist");
    },
    onError: (error) => {
      toast.error(`Failed to add: ${error.message}`);
    },
  });

  const removeMutation = api.watchlist.removeFromWatchlist.useMutation({
    onSuccess: () => {
      void utils.watchlist.getWatchlist.invalidate();
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
                {watchlist.map((item: WatchlistItem) => (
                  <WatchlistItemRow
                    key={item._id}
                    item={item}
                    onRemove={() =>
                      removeMutation.mutate({ symbol: item.symbol })
                    }
                  />
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-muted-foreground p-8 text-center">
              Your watchlist is empty.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
