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
        {/* Profile & Balance Section */}
        <div className="wave-header-gradient px-4 pb-6">
          <WalletCard
            name="Lalita Tungtrakul..."
            balance={10000.0}
            walletId="89898989000009998400"
          />
        </div>

        {/* Quick Actions */}
        <div className="px-4 -mt-2">
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
