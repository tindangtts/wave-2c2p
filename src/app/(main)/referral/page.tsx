"use client";

import { Users, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function ReferralPage() {
  const t = useTranslations("home");
  const router = useRouter();

  return (
    <div className="flex flex-col h-full">
      {/* Back header */}
      <div className="bg-[#FFE600] px-4 h-14 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-[#212121]" />
        </button>
        <span className="text-base font-bold text-[#212121]">
          {t("quickActions.referral")}
        </span>
      </div>

      {/* Coming Soon content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
        <Users className="w-12 h-12 text-[#E0E0E0]" />
        <h1 className="text-xl font-bold text-[#212121] text-center">
          {t("comingSoon.heading")}
        </h1>
        <p className="text-base text-[#757575] text-center">
          {t("comingSoon.body")}
        </p>
      </div>
    </div>
  );
}
