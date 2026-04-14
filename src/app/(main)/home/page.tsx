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
        {/* Yellow header content area */}
        <div className="bg-[#FFE600] px-4 pt-2 pb-8">
          <WalletCard />
        </div>

        {/* Quick Actions — overlaps yellow/white boundary */}
        <div className="px-4 -mt-4">
          <QuickActions />
        </div>

        {/* Recent History */}
        <div className="px-4 mt-6">
          <RecentHistory />
        </div>

        {/* Promotions */}
        <div className="px-4 mt-6 mb-4">
          <PromoCarousel />
        </div>
      </div>
    </>
  );
}
