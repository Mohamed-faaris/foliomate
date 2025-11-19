"use client";

import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

export default function TransactionsPage() {
    const router = useRouter();
    const { data: transactions, isLoading } = api.portfolio.getTransactions.useQuery();

    return (
        <div className="container mx-auto p-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold">Transaction History</h1>
                <button
                    onClick={() => router.push("/dashboard")}
                    className="text-blue-500 hover:underline"
                >
                    Back to Dashboard
                </button>
            </div>

            {isLoading ? (
                <p>Loading transactions...</p>
            ) : transactions && transactions.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border rounded-lg">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="px-6 py-3 font-semibold">Date</th>
                                <th className="px-6 py-3 font-semibold">Type</th>
                                <th className="px-6 py-3 font-semibold">Symbol</th>
                                <th className="px-6 py-3 font-semibold">Quantity</th>
                                <th className="px-6 py-3 font-semibold">Price</th>
                                <th className="px-6 py-3 font-semibold">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx: any) => (
                                <tr key={tx._id} className="border-t">
                                    <td className="px-6 py-4">{new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString()}</td>
                                    <td className={`px-6 py-4 font-bold ${tx.type === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
                                        {tx.type}
                                    </td>
                                    <td className="px-6 py-4">{tx.symbol}</td>
                                    <td className="px-6 py-4">{tx.quantity}</td>
                                    <td className="px-6 py-4">${tx.price.toFixed(2)}</td>
                                    <td className="px-6 py-4">${(tx.quantity * tx.price).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>No transactions found.</p>
            )}
        </div>
    );
}
