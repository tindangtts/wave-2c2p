import { TopHeader } from "@/components/layout/top-header";
import { WalletCard } from "@/components/features/wallet-card";
import { QuickActions } from "@/components/features/quick-actions";
import { RecentHistory } from "@/components/features/recent-history";
import { PromoCarousel } from "@/components/features/promo-carousel";

export default function HomePage() {
  return (
    <>
      <TopHeader />
      <div className="flex-1 flex flex-col">
        {/* Yellow header content area — wallet + quick actions (Pencil: y=90..373) */}
        <div className="bg-[#FFE512] px-4 pt-2 pb-10">
          <WalletCard />
          {/* Quick Actions — sits on yellow bg per Pencil design */}
          <div className="mt-5">
            <QuickActions />
          </div>
        </div>

        {/* White panel with rounded top overlapping yellow — Pencil: cornerRadius 15, shadow upward */}
        <div className="bg-white flex-1 -mt-4 rounded-t-[15px] relative z-10 shadow-[0_-1.5px_3.3px_rgba(128,128,128,0.15)]">
          {/* Recent History */}
          <div className="px-4 pt-5">
            <RecentHistory />
          </div>

          {/* Promotions */}
          <div className="px-4 mt-6 mb-4">
            <PromoCarousel />
          </div>
        </div>
      </div>
    </>
  );
}
