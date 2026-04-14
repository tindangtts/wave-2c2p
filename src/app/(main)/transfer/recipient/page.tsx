"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
