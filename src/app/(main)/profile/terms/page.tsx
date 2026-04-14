"use client";

import { useTranslations } from "next-intl";
import { BackHeader } from "@/components/layout/back-header";

export default function TermsPage() {
  const t = useTranslations("profile");

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <BackHeader title={t("terms.title")} />
      <div className="flex-1 px-4 py-6 overflow-y-auto pb-24 space-y-6 text-base font-normal text-foreground leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-foreground mb-2">
            1. Acceptance of Terms
          </h2>
          <p className="text-[#595959]">
            By accessing or using the 2C2P Wave application, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our service.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">
            2. Use of Service
          </h2>
          <p className="text-[#595959]">
            You may use our service only for lawful purposes and in accordance with these terms. You agree not to use the service in any way that violates any applicable national or international law or regulation.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">
            3. Account Responsibility
          </h2>
          <p className="text-[#595959]">
            You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">
            4. Transaction Limits
          </h2>
          <p className="text-[#595959]">
            All transactions are subject to daily and monthly limits as outlined in the Limits and Fees section. We reserve the right to modify these limits at any time.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">
            5. Changes to Terms
          </h2>
          <p className="text-[#595959]">
            We reserve the right to modify these terms at any time. We will notify you of any changes by updating this page. Your continued use of the service constitutes acceptance of the revised terms.
          </p>
        </section>
      </div>
    </div>
  );
}
