"use client";

import { authClient } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import type { Holding, Transaction, ChartDataPoint } from "~/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ModeToggle } from "~/components/mode-toggle";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "~/components/ui/chart";
import { Pie, PieChart, Cell } from "recharts";

export default function Dashboard() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const { data: portfolio, isLoading: portfolioLoading } =
    api.portfolio.getPortfolio.useQuery(undefined, { enabled: !!session });
  const { data: transactionsData, isLoading: transactionsLoading } =
    api.portfolio.getTransactions.useQuery(
      { limit: 5, skip: 0 },
      { enabled: !!session },
    );
  const transactions = transactionsData?.transactions;

  const signOut = async () => {
    await authClient.signOut();
    router.push("/sign-in");
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!session) {
    router.push("/sign-in");
    return null;
  }

  const chartData: ChartDataPoint[] =
    (portfolio?.holdings as Holding[] | undefined)?.map((h) => ({
      name: h.symbol,
      value: h.quantity * h.avgPrice,
    })) ?? [];

  const chartConfig = {
    value: {
      label: "Value",
    },
    ...Object.fromEntries(
      chartData.map((d, i: number) => [
        d.name,
        { label: d.name, color: `var(--chart-${(i % 5) + 1})` },
      ]),
    ),
  };

  const COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  return (
    <div className="bg-muted/20 min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {session.user.name}!
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Button variant="destructive" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cash</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="text-muted-foreground h-4 w-4"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${portfolio?.cash.toFixed(2) ?? "0.00"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Holdings Value
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="text-muted-foreground h-4 w-4"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {(portfolio?.holdings as Holding[] | undefined)
                  ?.reduce(
                    (acc, curr) =>
                      acc + curr.quantity * curr.avgPrice,
                    0,
                  )
                  .toFixed(2) ?? "0.00"}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Portfolio Allocation</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              {portfolioLoading ? (
                <div className="flex h-[300px] items-center justify-center">
                  Loading...
                </div>
              ) : chartData.length > 0 ? (
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square max-h-[300px]"
                >
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                      {chartData.map((entry, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <ChartLegend
                      content={<ChartLegendContent nameKey="name" />}
                    />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="text-muted-foreground flex h-[300px] items-center justify-center">
                  No holdings to display.
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                You made {transactions?.length ?? 0} transactions recently.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {transactionsLoading ? (
                  <p>Loading...</p>
                ) : transactions && transactions.length > 0 ? (
                  (transactions as Transaction[]).map((tx) => (
                    <div key={tx._id} className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm leading-none font-medium">
                          {tx.type} {tx.symbol}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {new Date(tx.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div
                        className={`ml-auto font-medium ${tx.type === "BUY" ? "text-red-500" : "text-green-500"}`}
                      >
                        {tx.type === "BUY" ? "-" : "+"}$
                        {(tx.quantity * tx.price).toFixed(2)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No transactions found.
                  </p>
                )}
              </div>
              <div className="mt-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/transactions")}
                >
                  View All History
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={() => router.push("/trade")}
            className="w-full md:w-auto"
          >
            Trade Stocks
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push("/watchlist")}
            className="w-full md:w-auto"
          >
            Manage Watchlist
          </Button>
        </div>
      </div>
    </div>
  );
}
