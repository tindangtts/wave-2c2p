import { TopHeader } from "@/components/layout/top-header";
import { WalletCard } from "@/components/features/wallet-card";
import { QuickActions } from "@/components/features/quick-actions";
import { RecentHistory } from "@/components/features/recent-history";
import { PromoCarousel } from "@/components/features/promo-carousel";
import { InstallPrompt } from "@/components/pwa/install-prompt";

export default function HomePage() {
  return (
    <>
      <TopHeader />
      <div className="flex-1 flex flex-col">
        {/* Yellow header content area — wallet + quick actions (Pencil: y=90..373) */}
        <div className="bg-[#FFE512] px-4 pt-2 pb-10">
          <div className="animate-fade-up stagger-1">
            <WalletCard />
          </div>
          {/* Quick Actions — sits on yellow bg per Pencil design */}
          <div className="mt-5 animate-fade-up stagger-2">
            <QuickActions />
          </div>
        </div>

        {/* White panel with rounded top overlapping yellow — Pencil: cornerRadius 15, shadow upward */}
        <div className="bg-white flex-1 -mt-9 rounded-t-[15px] relative z-10 shadow-[0_-1.5px_3.3px_rgba(128,128,128,0.15)] animate-slide-up stagger-3">
          {/* Drag handle indicator */}
          <div className="flex justify-center pt-3">
            <div className="w-[40px] h-[5px] bg-[#000000] rounded-full" />
          </div>

          {/* Recent History */}
          <div className="px-4 pt-3 animate-fade-up stagger-4">
            <RecentHistory />
          </div>

          {/* Promotions */}
          <div className="px-4 mt-6 mb-4 animate-fade-up stagger-5">
            <PromoCarousel />
          </div>

          {/* PWA Install Prompt */}
          <InstallPrompt />
        </div>
      </div>
    </>
  );
}
