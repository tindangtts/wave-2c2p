"use client";

import { BackHeader } from "@/components/layout/back-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Filter } from "lucide-react";
import Link from "next/link";
import type { TransactionStatus } from "@/types";

const mockHistory = [
  {
    id: "1",
    date: "January 2025",
    transactions: [
      {
        id: "t1",
        type: "Add Money",
        amount: "+ 5,000.00 THB",
        date: "15/01/2025, 10:30",
        status: "success" as TransactionStatus,
      },
      {
        id: "t2",
        type: "Send Money : Wallet Transfer",
        amount: "- 1,200.00 THB",
        date: "14/01/2025, 09:10",
        status: "success" as TransactionStatus,
      },
      {
        id: "t3",
        type: "Send Money : Wave Agent",
        amount: "- 3,000.00 THB",
        date: "12/01/2025, 14:22",
        status: "pending" as TransactionStatus,
      },
      {
        id: "t4",
        type: "Withdraw",
        amount: "- 500.00 THB",
        date: "10/01/2025, 08:45",
        status: "rejected" as TransactionStatus,
      },
    ],
  },
];

const statusStyles: Record<TransactionStatus, string> = {
  success: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  rejected: "bg-red-100 text-red-700",
  processing: "bg-blue-100 text-blue-700",
  failed: "bg-red-100 text-red-700",
};

export default function HistoryPage() {
  return (
    <>
      <BackHeader title="Transaction History" />
      <div className="flex-1 px-4 py-4">
        {/* Filter bar */}
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 rounded-full"
          >
            <Calendar className="w-4 h-4" />
            Date Range
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 rounded-full"
          >
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        {/* Transaction groups */}
        {mockHistory.map((group) => (
          <div key={group.date} className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              {group.date}
            </h3>
            <div className="space-y-1">
              {group.transactions.map((tx) => (
                <Link
                  key={tx.id}
                  href={`/history/${tx.id}`}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {tx.type}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {tx.date}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-sm font-semibold ${
                        tx.amount.startsWith("+")
                          ? "text-green-600"
                          : "text-foreground"
                      }`}
                    >
                      {tx.amount}
                    </span>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] px-2 py-0 ${statusStyles[tx.status]}`}
                    >
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
