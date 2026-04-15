"use client";

import Link from "next/link";
/* Custom circle-plus icon matching Pencil design */
function CirclePlusIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
import { useTranslations } from "next-intl";
import { useRecentTransactions } from "@/hooks/use-wallet";
import { formatCurrency } from "@/lib/currency";
import type { CurrencyCode } from "@/lib/currency";
import type { TransactionType, TransactionStatus } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

type StatusConfig = {
  text: string;
  label: string;
};

const statusConfig: Record<TransactionStatus, StatusConfig> = {
  success: {
    text: "text-wave-success",
    label: "Success",
  },
  pending: {
    text: "text-wave-warning",
    label: "Pending",
  },
  processing: {
    text: "text-wave-warning",
    label: "Processing",
  },
  rejected: {
    text: "text-destructive",
    label: "Rejected",
  },
  failed: {
    text: "text-destructive",
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
          <h3 className="text-base font-bold text-foreground">
            {t("recentHistory.title")}
          </h3>
          <CirclePlusIcon className="text-foreground" />
        </div>
        <div className="flex flex-col gap-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[60px] w-full rounded-md mb-1 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-foreground">
            {t("recentHistory.title")}
          </h3>
        </div>
        <button
          onClick={() => mutate()}
          className="w-full text-sm text-muted-foreground py-4 text-center"
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
        <h3 className="text-base font-bold text-foreground">
          {t("recentHistory.title")}
        </h3>
        <Link href="/history" aria-label="View all history">
          <CirclePlusIcon className="text-foreground" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center py-8 gap-2">
          <p className="text-base font-bold text-foreground">
            {t("recentHistory.empty.heading")}
          </p>
          <p className="text-sm text-muted-foreground text-center">
            {t("recentHistory.empty.body")}
          </p>
        </div>
      ) : (
        /* Transaction list — design: simple text rows with bottom border */
        <div className="flex flex-col">
          {transactions.slice(0, 5).map((tx) => {
            const sCfg = statusConfig[tx.status] ?? statusConfig.failed;
            const isCredit = creditTypes.includes(tx.type);
            const amountPrefix = isCredit ? "+ " : "- ";
            const formattedAmount = formatCurrency(
              tx.amount,
              tx.currency as CurrencyCode
            );

            return (
              <div
                key={tx.id}
                className="py-3 flex flex-col gap-1 border-b border-[#cccccc99]"
              >
                {/* Top row: description + amount */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground truncate flex-1 min-w-0">
                    {tx.description}
                  </span>
                  <span className="text-sm font-medium text-foreground ml-2 whitespace-nowrap">
                    {amountPrefix}{formattedAmount}
                  </span>
                </div>
                {/* Bottom row: date + status */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(tx.created_at)}
                  </span>
                  <span className={`text-xs font-medium ${sCfg.text}`}>
                    {sCfg.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
