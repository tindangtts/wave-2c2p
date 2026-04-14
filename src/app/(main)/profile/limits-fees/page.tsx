"use client";

import { useTranslations } from "next-intl";
import { BackHeader } from "@/components/layout/back-header";

interface LimitRowProps {
  label: string;
  value: string;
}

function LimitRow({ label, value }: LimitRowProps) {
  return (
    <div className="flex items-center justify-between px-4 h-14 border-b border-[#E0E0E0]">
      <span className="text-[16px] font-normal text-[#212121]">{label}</span>
      <span className="text-[16px] font-normal text-[#757575]">{value}</span>
    </div>
  );
}

export default function LimitsFeesPage() {
  const t = useTranslations("profile");

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <BackHeader title={t("limitsFees.title")} />
      <div className="flex-1 bg-white">
        {/* Transfer Limits section */}
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-[16px] font-bold text-[#212121]">
            {t("limitsFees.transferLimits")}
          </h2>
        </div>
        <LimitRow
          label={t("limitsFees.dailyLimit")}
          value={t("limitsFees.dailyLimitValue")}
        />
        <LimitRow
          label={t("limitsFees.monthlyLimit")}
          value={t("limitsFees.monthlyLimitValue")}
        />

        {/* Fees section */}
        <div className="px-4 pt-6 pb-2">
          <h2 className="text-[16px] font-bold text-[#212121]">
            {t("limitsFees.fees")}
          </h2>
        </div>
        <LimitRow
          label={t("limitsFees.transferFee")}
          value={t("limitsFees.transferFeeValue")}
        />
        <LimitRow
          label={t("limitsFees.topupFee")}
          value={t("limitsFees.topupFeeValue")}
        />
        <LimitRow
          label={t("limitsFees.withdrawalFee")}
          value={t("limitsFees.withdrawalFeeValue")}
        />
      </div>
    </div>
  );
}
