"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  Info,
  Gift,
  Lock,
  Phone,
  Shield,
  Bell,
  MessageCircle,
  Globe,
  BarChart3,
  HelpCircle,
  FileText,
  Eye,
  RefreshCw,
} from "lucide-react";
import { ProfileHeader } from "@/components/features/profile-header";
import { ProfileMenuSection } from "@/components/features/profile-menu-section";
import { ProfileMenuItem } from "@/components/features/profile-menu-item";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";
import { useRegistrationStore } from "@/stores/registration-store";
import { useKYCStore } from "@/stores/kyc-store";
import { useTransferStore } from "@/stores/transfer-store";
import { useWalletOpsStore } from "@/stores/wallet-ops-store";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tKyc = useTranslations("kyc");
  const router = useRouter();
  const locale = useLocale();

  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [userName, setUserName] = useState("User");
  const [kycStatus, setKycStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("first_name, last_name, kyc_status")
          .eq("id", user.id)
          .single();
        if (profile) {
          const fullName = [profile.first_name, profile.last_name]
            .filter(Boolean)
            .join(" ");
          if (fullName) setUserName(fullName);
          setKycStatus(profile.kyc_status ?? null);
        }
      }
    };
    fetchUser();
  }, []);

  const needsWorkPermitUpdate =
    kycStatus === "expired" || kycStatus === "pending_update";

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Clear all Zustand stores
    useRegistrationStore.getState().clearAll();
    useKYCStore.getState().clearAll();
    useTransferStore.getState().reset();
    useWalletOpsStore.getState().resetTopup();
    useWalletOpsStore.getState().resetWithdraw();
    router.push("/login");
  };

  // Derive locale badge (EN / TH / MM)
  const localeBadge =
    locale === "th" ? "TH" : locale === "mm" ? "MM" : "EN";

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Yellow header */}
      <ProfileHeader name={userName} title={t("menu.title")} />

      {/* Content */}
      <div className="flex-1 bg-white overflow-y-auto pb-24">
        {/* Biometrics section */}
        <ProfileMenuSection heading={t("menu.biometrics")}>
          <div className="flex items-center h-14 px-4 bg-white border-b border-border">
            <span className="flex-1 text-base font-normal text-foreground">
              {t("menu.enableBiometrics")}
            </span>
            <Switch
              checked={biometricsEnabled}
              onCheckedChange={setBiometricsEnabled}
              aria-label={t("menu.enableBiometrics")}
              className="data-[state=checked]:bg-[#0091EA]"
            />
          </div>
        </ProfileMenuSection>

        {/* Settings section */}
        <ProfileMenuSection heading={t("menu.settings")}>
          {needsWorkPermitUpdate && (
            <ProfileMenuItem
              icon={RefreshCw}
              label={tKyc("workPermitUpdate.title")}
              onClick={() => router.push("/kyc/work-permit-update")}
            />
          )}
          <ProfileMenuItem
            icon={Info}
            label={t("menu.information")}
            onClick={() => router.push("/profile/information")}
          />
          <ProfileMenuItem
            icon={Gift}
            label={t("menu.referFriends")}
            onClick={() => router.push("/profile/refer-friends")}
          />
          <ProfileMenuItem
            icon={Lock}
            label={t("menu.changePasscode")}
            onClick={() => router.push("/profile/change-passcode")}
          />
          <ProfileMenuItem
            icon={Phone}
            label={t("menu.changePhone")}
            onClick={() => router.push("/profile/change-phone")}
          />
          <ProfileMenuItem
            icon={Shield}
            label={t("menu.manageLimit")}
            onClick={() => router.push("/profile/limits-fees")}
          />
          <ProfileMenuItem
            icon={Bell}
            label={t("menu.notifications")}
            onClick={() => router.push("/profile/notifications")}
          />
        </ProfileMenuSection>

        {/* Help & Support section */}
        <ProfileMenuSection heading={t("menu.helpSupport")}>
          <ProfileMenuItem
            icon={MessageCircle}
            label={t("menu.contactUs")}
            onClick={() => router.push("/profile/contact-us")}
          />
          <ProfileMenuItem
            icon={Globe}
            label={t("menu.language")}
            onClick={() => router.push("/profile/language")}
            trailingBadge={localeBadge}
          />
          <ProfileMenuItem
            icon={BarChart3}
            label={t("menu.limitsFees")}
            onClick={() => router.push("/profile/limits-fees")}
          />
          <ProfileMenuItem
            icon={HelpCircle}
            label={t("menu.faq")}
            onClick={() => router.push("/profile/faq")}
          />
          <ProfileMenuItem
            icon={FileText}
            label={t("menu.terms")}
            onClick={() => router.push("/profile/terms")}
          />
          <ProfileMenuItem
            icon={Eye}
            label={t("menu.privacy")}
            onClick={() => router.push("/profile/privacy")}
          />
        </ProfileMenuSection>

        {/* Logout + Version */}
        <div className="px-4 mt-8 mb-4 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full h-12 rounded-full border-2 border-[#F44336] text-base font-bold text-destructive bg-white hover:bg-[#FFF5F5] transition-colors"
          >
            {t("logout")}
          </button>
          <p className="text-xs text-[#767676]">{t("version")}</p>
        </div>
      </div>
    </div>
  );
}
