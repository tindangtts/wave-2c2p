import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TransactionStatus } from "@/types";

interface TransactionItem {
  id: string;
  description: string;
  amount: string;
  date: string;
  status: TransactionStatus;
}

// Mock data matching the prototype
const mockTransactions: TransactionItem[] = [
  {
    id: "1",
    description: "Add Money",
    amount: "+ 5,000.00 THB",
    date: "15/06/2024, 10:30",
    status: "success",
  },
  {
    id: "2",
    description: "Send Money : Wallet Transfer",
    amount: "- 1,200.00 THB",
    date: "12/06/2024, 09:10",
    status: "rejected",
  },
];

const statusStyles: Record<TransactionStatus, string> = {
  success: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  rejected: "bg-red-100 text-red-700",
  processing: "bg-blue-100 text-blue-700",
  failed: "bg-red-100 text-red-700",
};

export function RecentHistory() {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
          Recent History
          <Plus className="w-5 h-5 text-muted-foreground" />
        </h3>
      </div>

      <div className="space-y-3">
        {mockTransactions.map((tx) => (
          <Link
            key={tx.id}
            href={`/history/${tx.id}`}
            className="flex items-center justify-between py-2"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {tx.description}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{tx.date}</p>
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
  );
}
