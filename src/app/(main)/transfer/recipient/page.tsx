"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Wallet } from "lucide-react";
import { BackHeader } from "@/components/layout/back-header";
import { RecipientList } from "@/components/features/recipient-list";
import { useRecipients } from "@/hooks/use-recipients";
import { useTransferStore } from "@/stores/transfer-store";
import type { Recipient } from "@/types";

export default function RecipientPage() {
  const t = useTranslations("transfer");
  const router = useRouter();
  const { data, isLoading, mutate } = useRecipients();
  const { selectedRecipient, setRecipient } = useTransferStore();

  const recipients = data?.recipients ?? [];

  const handleSelect = (recipient: Recipient) => {
    setRecipient(recipient);
    router.push("/transfer/amount");
  };

  const handleEdit = (id: string) => {
    router.push(`/transfer/edit-recipient/${id}`);
  };

  return (
    <>
      <BackHeader
        title={t("title_recipient")}
        onBack={() => router.push("/home")}
      />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <button
          type="button"
          onClick={() => router.push("/transfer/p2p")}
          className="mx-4 mt-3 mb-1 flex items-center gap-3 rounded-xl border border-dashed border-accent px-4 py-3 text-accent active:opacity-70 transition-opacity"
        >
          <Wallet className="w-5 h-5" />
          <span className="text-sm font-medium">{t("sendToWallet")}</span>
        </button>
        <RecipientList
          recipients={recipients}
          isLoading={isLoading}
          onSelect={handleSelect}
          selectedId={selectedRecipient?.id ?? null}
          onEdit={handleEdit}
          mutate={mutate}
        />
      </div>
    </>
  );
}
