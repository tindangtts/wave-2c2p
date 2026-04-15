"use client";

import { useTranslations } from "next-intl";
import { BackHeader } from "@/components/layout/back-header";

export default function PrivacyPage() {
  const t = useTranslations("profile");

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <BackHeader title={t("privacy.title")} />
      <div className="flex-1 px-4 py-6 overflow-y-auto pb-24 space-y-6">
        <section>
          <h2 className="text-base font-bold text-foreground mb-2">
            1. Information We Collect
          </h2>
          <p className="text-base font-normal text-muted-foreground leading-relaxed">
            We collect information you provide directly to us, such as your name, phone number, date of birth, and identity documents when you register for an account.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">
            2. How We Use Your Information
          </h2>
          <p className="text-base font-normal text-muted-foreground leading-relaxed">
            We use the information we collect to provide, maintain, and improve our services, to process transactions, and to send you related information such as receipts and notifications.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">
            3. Information Sharing
          </h2>
          <p className="text-base font-normal text-muted-foreground leading-relaxed">
            We do not share your personal information with third parties except as necessary to provide our services, comply with legal obligations, or with your consent.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">
            4. Data Security
          </h2>
          <p className="text-base font-normal text-muted-foreground leading-relaxed">
            We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">
            5. Contact Us
          </h2>
          <p className="text-base font-normal text-muted-foreground leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at support@2c2pwave.com.
          </p>
        </section>
      </div>
    </div>
  );
}
