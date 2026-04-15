"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Phone, MessageSquare, Mail, MessageCircle } from "lucide-react";
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
      <span className="text-muted-foreground mr-3">{icon}</span>
      <div className="flex flex-col">
        <span className="text-xs font-normal text-muted-foreground">{label}</span>
        <span className="text-base font-normal text-accent">{value}</span>
      </div>
    </a>
  );
}

export default function ContactUsPage() {
  const t = useTranslations("profile");
  const tHome = useTranslations("home");
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <BackHeader title={t("contactUs.title")} />
      <div className="flex-1 bg-white">
        {/* In-app chat */}
        <button
          type="button"
          onClick={() => router.push("/chat")}
          className="flex items-center h-16 px-4 border-b border-border hover:bg-secondary transition-colors w-full text-left"
        >
          <span className="text-muted-foreground mr-3">
            <MessageCircle className="w-6 h-6" />
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-normal text-muted-foreground">{tHome("chat.title")}</span>
            <span className="text-base font-normal text-accent">{tHome("chat.agentName")}</span>
          </div>
        </button>
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
