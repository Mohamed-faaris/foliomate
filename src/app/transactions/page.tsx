"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
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

type Transaction = {
  _id: string;
  type: "BUY" | "SELL";
  symbol: string;
  quantity: number;
  price: number;
  date: string;
};

const columnHelper = createColumnHelper<Transaction>();

const columns = [
  columnHelper.accessor("date", {
    header: "Date",
    cell: (info) => new Date(info.getValue()).toLocaleDateString(),
  }),
  columnHelper.accessor("type", {
    header: "Type",
    cell: (info) => (
      <span
        className={
          info.getValue() === "BUY"
            ? "font-bold text-red-500"
            : "font-bold text-green-500"
        }
      >
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("symbol", {
    header: "Symbol",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor("quantity", {
    header: "Quantity",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("price", {
    header: "Price",
    cell: (info) => `$${info.getValue().toFixed(2)}`,
  }),
  columnHelper.accessor((row) => row.quantity * row.price, {
    id: "total",
    header: "Total Value",
    cell: (info) => `$${info.getValue().toFixed(2)}`,
  }),
];

export default function TransactionsPage() {
  const router = useRouter();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading } = api.portfolio.getTransactions.useQuery({
    limit: pagination.pageSize,
    skip: pagination.pageIndex * pagination.pageSize,
  });

  const table = useReactTable({
    data: data?.transactions || [],
    columns,
    pageCount: data ? Math.ceil(data.totalCount / pagination.pageSize) : -1,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transaction History</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-8 text-center">Loading transactions...</div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          No results.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <span className="text-muted-foreground text-sm">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount() > 0 ? table.getPageCount() : 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
