"use client";

import { authClient } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export default function Dashboard() {
    const { data: session, isPending } = authClient.useSession();
    const router = useRouter();
    const { data: portfolio, isLoading: portfolioLoading } = api.portfolio.getPortfolio.useQuery(
        undefined,
        { enabled: !!session }
    );
    const { data: transactions, isLoading: transactionsLoading } = api.portfolio.getTransactions.useQuery(
        { limit: 5 },
        { enabled: !!session }
    );

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

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-md">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => router.push("/trade")}
                            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                        >
                            Trade
                        </button>
                        <button
                            onClick={() => router.push("/watchlist")}
                            className="rounded-md bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600"
                        >
                            Watchlist
                        </button>
                        <button
                            onClick={() => router.push("/transactions")}
                            className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                        >
                            History
                        </button>
                        <button
                            onClick={signOut}
                            className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
                <div className="mb-6">
                    <h2 className="text-xl font-semibold">Welcome, {session.user.name}!</h2>
                    <p className="text-gray-600">Email: {session.user.email}</p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="rounded-lg border p-4">
                        <h3 className="mb-2 text-lg font-bold">Portfolio Summary</h3>
                        {portfolioLoading ? (
                            <p>Loading portfolio...</p>
                        ) : portfolio ? (
                            <div>
                                <p className="mb-4 text-2xl font-bold">Cash: ${portfolio.cash.toFixed(2)}</p>
                                <h4 className="mb-2 font-semibold">Holdings:</h4>
                                {portfolio.holdings.length === 0 ? (
                                    <p>No holdings.</p>
                                ) : (
                                    <ul>
                                        {portfolio.holdings.map((holding: any) => (
                                            <li key={holding.symbol} className="flex justify-between border-b py-2">
                                                <span>{holding.symbol}</span>
                                                <span>{holding.quantity} shares @ ${holding.avgPrice.toFixed(2)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ) : (
                            <p>Failed to load portfolio.</p>
                        )}
                    </div>
                    <div className="rounded-lg border p-4">
                        <h3 className="mb-2 text-lg font-bold">Recent Transactions</h3>
                        {transactionsLoading ? (
                            <p>Loading transactions...</p>
                        ) : transactions && transactions.length > 0 ? (
                            <ul>
                                {transactions.map((tx: any) => (
                                    <li key={tx._id} className="border-b py-2 last:border-0">
                                        <div className="flex justify-between">
                                            <span className={`font-bold ${tx.type === "BUY" ? "text-green-600" : "text-red-600"}`}>
                                                {tx.type} {tx.symbol}
                                            </span>
                                            <span>{new Date(tx.date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {tx.quantity} @ ${tx.price.toFixed(2)}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No recent transactions.</p>
                        )}
                        <button
                            onClick={() => router.push("/transactions")}
                            className="mt-4 text-sm text-blue-500 hover:underline"
                        >
                            View All History
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
