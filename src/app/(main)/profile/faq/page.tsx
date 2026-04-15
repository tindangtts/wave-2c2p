"use client";

import { useTranslations } from "next-intl";
import { BackHeader } from "@/components/layout/back-header";

const FAQ_ITEMS = [
  {
    question: "How do I send money to Myanmar?",
    answer:
      "Go to the Transfer section from the home screen. Select a recipient or add a new one, enter the amount, choose a transfer channel (bank or Wave Money), review the fees and exchange rate, then confirm with your passcode.",
  },
  {
    question: "How long does a transfer take?",
    answer:
      "Transfers typically arrive within minutes. Bank transfers may take up to 1 business day depending on the recipient's bank. Wave Money transfers are usually instant.",
  },
  {
    question: "What are the transfer limits?",
    answer:
      "You can transfer up to 50,000 THB per day and 200,000 THB per month. These limits may be increased after completing additional verification.",
  },
  {
    question: "How do I top up my wallet?",
    answer:
      "Tap 'Add Money' on the home screen. You can top up via PromptPay QR code. Scan the QR code with your banking app and the funds will be credited immediately.",
  },
  {
    question: "What should I do if my transaction fails?",
    answer:
      "If a transaction fails, no money will be deducted from your wallet. Check your internet connection and try again. If the issue persists, please contact our support team at 1234 or support@2c2pwave.com.",
  },
];

export default function FAQPage() {
  const t = useTranslations("profile");

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <BackHeader title={t("faq.title")} />
      <div className="flex-1 px-4 py-4 overflow-y-auto pb-24 space-y-4">
        {FAQ_ITEMS.map((item, index) => (
          <div key={index} className="border-b border-border pb-4">
            <h2 className="text-base font-bold text-foreground mb-2">
              {item.question}
            </h2>
            <p className="text-base font-normal text-muted-foreground leading-relaxed">
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
