"use client";

import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function TransactionsPage() {
    const router = useRouter();
    const { data: transactions, isLoading } = api.portfolio.getTransactions.useQuery();

    return (
        <div className="container mx-auto p-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold">Transaction History</h1>
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                    Back to Dashboard
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-8 text-center">Loading transactions...</div>
                    ) : transactions && transactions.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Symbol</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((tx: any) => (
                                    <TableRow key={tx._id}>
                                        <TableCell>{new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString()}</TableCell>
                                        <TableCell className={`font-bold ${tx.type === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.type}
                                        </TableCell>
                                        <TableCell>{tx.symbol}</TableCell>
                                        <TableCell>{tx.quantity}</TableCell>
                                        <TableCell>${tx.price.toFixed(2)}</TableCell>
                                        <TableCell className="text-right font-mono">${(tx.quantity * tx.price).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="p-8 text-center text-muted-foreground">No transactions found.</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
