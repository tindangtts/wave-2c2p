"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { BackHeader } from "@/components/layout/back-header";
import { Button } from "@/components/ui/button";
import { useSpendingLimits } from "@/hooks/use-spending-limits";
import { formatCurrency } from "@/lib/currency";

const TIERS = [
  { id: "basic", daily: 1000000, monthly: 5000000 },
  { id: "standard", daily: 3000000, monthly: 10000000 },
  { id: "premium", daily: 5000000, monthly: 20000000 },
] as const

type TierId = (typeof TIERS)[number]["id"]

function detectCurrentTier(dailyLimitSatang: number): TierId {
  const match = TIERS.find((t) => t.daily === dailyLimitSatang)
  return match ? match.id : "premium"
}

export default function SpendingLimitsPage() {
  const t = useTranslations("profile");
  const { dailyLimitSatang, monthlyLimitSatang, isLoading, mutate } =
    useSpendingLimits();

  const currentTier = detectCurrentTier(dailyLimitSatang);
  const [selectedTier, setSelectedTier] = useState<TierId>(currentTier);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/spending-limits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: selectedTier }),
      });
      if (!res.ok) throw new Error("Failed");
      await mutate();
      toast.success(t("spendingLimits.saved"));
    } catch {
      toast.error(t("spendingLimits.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <BackHeader title={t("spendingLimits.title")} />

      <div className="flex-1 bg-white overflow-y-auto pb-24">
        {/* Description */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-sm text-muted-foreground">
            {t("spendingLimits.description")}
          </p>
        </div>

        {/* Current limits display */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-border">
          <span className="text-base font-normal text-foreground">
            {t("spendingLimits.dailyLimit")}
          </span>
          <span className="text-base font-normal text-muted-foreground">
            {isLoading ? "—" : formatCurrency(dailyLimitSatang, "THB")}
          </span>
        </div>
        <div className="flex items-center justify-between px-4 h-14 border-b border-border">
          <span className="text-base font-normal text-foreground">
            {t("spendingLimits.monthlyLimit")}
          </span>
          <span className="text-base font-normal text-muted-foreground">
            {isLoading ? "—" : formatCurrency(monthlyLimitSatang, "THB")}
          </span>
        </div>

        {/* Tier selector heading */}
        <div className="px-4 pt-6 pb-2">
          <h2 className="text-base font-bold text-foreground">
            {t("spendingLimits.selectTier")}
          </h2>
        </div>

        {/* Tier cards */}
        {TIERS.map((tier) => {
          const isSelected = selectedTier === tier.id;
          return (
            <div
              key={tier.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => setSelectedTier(tier.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setSelectedTier(tier.id);
              }}
              className={`mx-4 mb-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                isSelected
                  ? "border-accent bg-brand-blue-light"
                  : "border-border bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-base font-bold text-foreground">
                    {t(`spendingLimits.${tier.id}`)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(tier.daily, "THB")}{" "}
                    {t("spendingLimits.perDay")}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(tier.monthly, "THB")}{" "}
                    {t("spendingLimits.perMonth")}
                  </span>
                </div>
                {/* Radio indicator */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? "border-accent" : "border-border"
                  }`}
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Save button */}
        <div className="px-4 mt-6">
          <Button
            className="w-full h-12 rounded-full bg-primary text-foreground font-bold text-base hover:bg-primary/90 disabled:opacity-50"
            disabled={selectedTier === currentTier || isSaving}
            onClick={handleSave}
          >
            {t("spendingLimits.save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
