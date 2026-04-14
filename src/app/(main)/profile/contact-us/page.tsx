"use client";

import { useTranslations } from "next-intl";
import { Phone, MessageSquare, Mail } from "lucide-react";
import { BackHeader } from "@/components/layout/back-header";

interface ContactRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}

function ContactRow({ icon, label, value, href }: ContactRowProps) {
  return (
    <a
      href={href}
      className="flex items-center h-16 px-4 border-b border-border hover:bg-secondary transition-colors"
    >
      <span className="text-[#595959] mr-3">{icon}</span>
      <div className="flex flex-col">
        <span className="text-xs font-normal text-[#767676]">{label}</span>
        <span className="text-base font-normal text-[#0091EA]">{value}</span>
      </div>
    </a>
  );
}

export default function ContactUsPage() {
  const t = useTranslations("profile");

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <BackHeader title={t("contactUs.title")} />
      <div className="flex-1 bg-white">
        <ContactRow
          icon={<Phone className="w-6 h-6" />}
          label={t("contactUs.callCenter")}
          value={t("contactUs.callCenterNumber")}
          href={`tel:${t("contactUs.callCenterNumber")}`}
        />
        <ContactRow
          icon={<MessageSquare className="w-6 h-6" />}
          label={t("contactUs.line")}
          value={t("contactUs.lineId")}
          href={`https://line.me/R/ti/p/${t("contactUs.lineId")}`}
        />
        <ContactRow
          icon={<Mail className="w-6 h-6" />}
          label={t("contactUs.email")}
          value={t("contactUs.emailAddress")}
          href={`mailto:${t("contactUs.emailAddress")}`}
        />
      </div>
    </div>
  );
}
