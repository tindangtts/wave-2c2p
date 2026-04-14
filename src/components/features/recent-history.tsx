"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Minus,
  CirclePlus,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRecentTransactions } from "@/hooks/use-wallet";
import { formatCurrency } from "@/lib/currency";
import type { CurrencyCode } from "@/lib/currency";
import type { TransactionType, TransactionStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type TypeConfig = {
  icon: React.ElementType;
  bg: string;
  color: string;
};

const typeConfig: Record<TransactionType, TypeConfig> = {
  send_money: { icon: ArrowUpRight, bg: "#FFEBEE", color: "#F44336" },
  receive: { icon: ArrowDownLeft, bg: "#E8F5E9", color: "#00C853" },
  add_money: { icon: Plus, bg: "#E8F5E9", color: "#00C853" },
  withdraw: { icon: Minus, bg: "#FFEBEE", color: "#F44336" },
  bill_payment: { icon: ArrowUpRight, bg: "#FFEBEE", color: "#F44336" },
};

type StatusConfig = {
  bg: string;
  text: string;
  icon: React.ElementType;
  label: string;
};

const statusConfig: Record<TransactionStatus, StatusConfig> = {
  success: {
    bg: "bg-[#E8F5E9]",
    text: "text-[#00C853]",
    icon: CheckCircle,
    label: "Success",
  },
  pending: {
    bg: "bg-[#FFF3E0]",
    text: "text-[#FF9800]",
    icon: Clock,
    label: "Pending",
  },
  processing: {
    bg: "bg-[#FFF3E0]",
    text: "text-[#FF9800]",
    icon: Clock,
    label: "Processing",
  },
  rejected: {
    bg: "bg-[#FFEBEE]",
    text: "text-[#F44336]",
    icon: XCircle,
    label: "Rejected",
  },
  failed: {
    bg: "bg-[#FFEBEE]",
    text: "text-[#F44336]",
    icon: XCircle,
    label: "Failed",
  },
};

const creditTypes: TransactionType[] = ["add_money", "receive"];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }) +
    ", " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  );
}

export function RecentHistory() {
  const t = useTranslations("home");
  const { data, error, isLoading, mutate } = useRecentTransactions();

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-[#212121]">
            {t("recentHistory.title")}
          </h3>
          <CirclePlus className="w-6 h-6 text-[#0091EA]" />
        </div>
        <div className="flex flex-col gap-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[60px] w-full rounded-md mb-1" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-[#212121]">
            {t("recentHistory.title")}
          </h3>
        </div>
        <button
          onClick={() => mutate()}
          className="w-full text-sm text-[#757575] py-4 text-center"
        >
          {t("errors.transactionFetch")}
        </button>
      </div>
    );
  }

  const transactions = data?.transactions ?? [];

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-bold text-[#212121]">
          {t("recentHistory.title")}
        </h3>
        <Link href="/history" aria-label="View all history">
          <CirclePlus className="w-6 h-6 text-[#0091EA]" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center py-8 gap-2">
          <p className="text-base font-bold text-[#212121]">
            {t("recentHistory.empty.heading")}
          </p>
          <p className="text-sm text-[#757575] text-center">
            {t("recentHistory.empty.body")}
          </p>
        </div>
      ) : (
        /* Transaction list */
        <div className="flex flex-col divide-y divide-gray-100">
          {transactions.slice(0, 5).map((tx) => {
            const tCfg = typeConfig[tx.type] ?? typeConfig.send_money;
            const sCfg = statusConfig[tx.status] ?? statusConfig.failed;
            const TypeIcon = tCfg.icon;
            const isCredit = creditTypes.includes(tx.type);
            const amountPrefix = isCredit ? "+" : "-";
            const amountColor = isCredit ? "text-[#00C853]" : "text-[#F44336]";
            const formattedAmount = formatCurrency(
              tx.amount,
              tx.currency as CurrencyCode
            );

            return (
              <div
                key={tx.id}
                className="min-h-[60px] py-3 flex items-center justify-between"
              >
                {/* Left: icon + label/date */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: tCfg.bg }}
                  >
                    <TypeIcon
                      className="w-5 h-5"
                      style={{ color: tCfg.color }}
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-base text-[#212121] truncate">
                      {tx.description}
                    </span>
                    <span className="text-xs text-[#757575]">
                      {formatDate(tx.created_at)}
                    </span>
                  </div>
                </div>

                {/* Right: amount + status badge */}
                <div className="flex flex-col items-end gap-1 ml-2">
                  <span className={`text-base font-bold ${amountColor}`}>
                    {amountPrefix}
                    {formattedAmount}
                  </span>
                  <Badge
                    className={`rounded-full text-xs px-2 py-0.5 ${sCfg.bg} ${sCfg.text} border-0`}
                  >
                    {sCfg.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
