"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

export default function TradePage() {
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const utils = api.useUtils();

  const searchResults = api.stock.search.useQuery(
    { query: searchQuery },
    { enabled: !!searchQuery },
  );

  const quote = api.stock.getQuote.useQuery({ symbol }, { enabled: !!symbol });

  const buyMutation = api.portfolio.buyStock.useMutation({
    onSuccess: () => {
      toast.success("Buy successful!");
      void utils.portfolio.getPortfolio.invalidate();
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(`Buy failed: ${error.message}`);
    },
  });

  const sellMutation = api.portfolio.sellStock.useMutation({
    onSuccess: () => {
      toast.success("Sell successful!");
      void utils.portfolio.getPortfolio.invalidate();
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(`Sell failed: ${error.message}`);
    },
  });

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
    <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Trade Stocks</CardTitle>
          <CardDescription>
            Search for a stock and execute a trade.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Symbol</label>
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., IBM"
            />
            {searchResults.data && searchResults.data.length > 0 && (
              <ul className="bg-background max-h-40 overflow-y-auto rounded-md border p-2 shadow-sm">
                {searchResults.data.map((match: any) => (
                  <li
                    key={match.symbol}
                    className="hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm p-2"
                    onClick={() => {
                      setSymbol(match.symbol);
                      setSearchQuery("");
                    }}
                  >
                    <span className="font-bold">{match.symbol}</span> -{" "}
                    {match.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {symbol && (
            <div className="bg-muted/50 rounded-md border p-4">
              <h3 className="mb-2 text-lg font-bold">{symbol}</h3>
              {quote.isLoading ? (
                <p className="text-muted-foreground text-sm">
                  Loading quote...
                </p>
              ) : quote.data ? (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-mono font-bold">
                      ${quote.data.price}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Change:</span>
                    <span
                      className={
                        quote.data.change >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {quote.data.change} ({quote.data.changePercent})
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quantity</label>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={handleBuy}
                      disabled={buyMutation.isPending}
                    >
                      Buy
                    </Button>
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={handleSell}
                      disabled={sellMutation.isPending}
                    >
                      Sell
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-destructive text-sm">
                  Failed to load quote.
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => router.push("/dashboard")}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
