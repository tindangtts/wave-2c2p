"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { BackHeader } from "@/components/layout/back-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRecipients } from "@/hooks/use-recipients";
import {
  recipientFormSchema,
  type RecipientFormInput,
  occupationOptions,
  purposeOptions,
  relationshipOptions,
} from "@/lib/transfer/schemas";
import type { Recipient } from "@/types";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-xs text-destructive mt-1">
      {message}
    </p>
  );
}

function SectionDivider() {
  return <hr className="border-t border-border my-6" />;
}

function FormSkeleton() {
  return (
    <div className="px-4 pt-6 flex flex-col gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export default function EditRecipientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("transfer");
  const router = useRouter();
  const { data, isLoading, mutate } = useRecipients();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recipient, setRecipient] = useState<Recipient | null>(null);

  const form = useForm<RecipientFormInput>({
    resolver: zodResolver(recipientFormSchema),
    mode: "onSubmit",
  });

  const errors = form.formState.errors;
  const transferType = form.watch("transfer_type");
  const isBankTransfer = transferType === "bank_transfer";

  // Load recipient data once available
  useEffect(() => {
    if (data?.recipients && id) {
      const found = data.recipients.find((r) => r.id === id);
      if (found) {
        setRecipient(found);
        form.reset({
          transfer_type: found.transfer_type ?? "wave_app",
          bank_name: found.bank_name ?? "",
          account_no: found.account_no ?? "",
          first_name: found.first_name ?? "",
          last_name: found.last_name ?? "",
          nrc: found.nrc ?? "",
          phone: found.phone ?? "+959",
          occupation: (found.occupation as RecipientFormInput["occupation"]) ?? undefined,
          transfer_purpose: (found.transfer_purpose as RecipientFormInput["transfer_purpose"]) ?? undefined,
          relationship: (found.relationship as RecipientFormInput["relationship"]) ?? undefined,
          address_line_1: found.address ?? "",
          address_line_2: found.address_line_2 ?? "",
          city: found.city ?? "",
          state_region: found.state_region ?? "",
        });
      } else if (!isLoading) {
        toast.error("Recipient not found");
        router.push("/transfer/recipient");
      }
    }
  }, [data, id, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(data: RecipientFormInput) {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/recipients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        if (err.details?.issues) {
          err.details.issues.forEach(
            (issue: { path: string[]; message: string }) => {
              if (issue.path.length > 0) {
                form.setError(issue.path[0] as keyof RecipientFormInput, {
                  message: issue.message,
                });
              }
            }
          );
        } else {
          toast.error(err.error || "Failed to update recipient");
        }
        return;
      }

      await mutate();
      toast.success("Recipient updated successfully");
      router.push("/transfer/recipient");
    } catch {
      toast.error("Connection error. Please check your internet and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <BackHeader title="Edit Recipient" />
      <div className="flex-1 overflow-y-auto pb-28">
        {isLoading && !recipient ? (
          <FormSkeleton />
        ) : (
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="px-4 pt-6"
          >
            {/* Section: Transfer Info */}
            <div className="flex flex-col gap-5">
              {/* Transfer Type */}
              <div>
                <Label
                  htmlFor="transfer_type"
                  className="text-xs text-foreground mb-1 block"
                >
                  {t("label_transfer_type")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={transferType ?? ""}
                  onValueChange={(value) => {
                    if (value) {
                      form.setValue(
                        "transfer_type",
                        value as RecipientFormInput["transfer_type"],
                        { shouldValidate: false }
                      );
                    }
                  }}
                >
                  <SelectTrigger
                    id="transfer_type"
                    className="h-12 w-full rounded-xl border-border focus-visible:border-[#0091EA]"
                    aria-invalid={!!errors.transfer_type}
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">
                      {t("channel_bank_transfer")}
                    </SelectItem>
                    <SelectItem value="wave_app">
                      {t("channel_wave_app")}
                    </SelectItem>
                    <SelectItem value="wave_agent">
                      {t("channel_wave_agent")}
                    </SelectItem>
                    <SelectItem value="cash_pickup">
                      {t("channel_cash_pickup")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FieldError message={errors.transfer_type?.message} />
              </div>

              {/* Bank fields — only for bank_transfer */}
              {isBankTransfer && (
                <>
                  <div>
                    <Label
                      htmlFor="bank_name"
                      className="text-xs text-foreground mb-1 block"
                    >
                      {t("label_bank_name")}{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="bank_name"
                      {...form.register("bank_name")}
                      className="h-12 rounded-xl border-border focus-visible:border-[#0091EA]"
                      aria-invalid={!!errors.bank_name}
                    />
                    <FieldError message={errors.bank_name?.message} />
                  </div>
                  <div>
                    <Label
                      htmlFor="account_no"
                      className="text-xs text-foreground mb-1 block"
                    >
                      {t("label_account_no")}{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="account_no"
                      {...form.register("account_no")}
                      className="h-12 rounded-xl border-border focus-visible:border-[#0091EA]"
                      aria-invalid={!!errors.account_no}
                    />
                    <FieldError message={errors.account_no?.message} />
                  </div>
                </>
              )}
            </div>

            <SectionDivider />

            {/* Section: Recipient Identity */}
            <div className="flex flex-col gap-5">
              {/* First Name */}
              <div>
                <Label
                  htmlFor="first_name"
                  className="text-xs text-foreground mb-1 block"
                >
                  {t("label_first_name")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="first_name"
                  {...form.register("first_name")}
                  className="h-12 rounded-xl border-border focus-visible:border-[#0091EA]"
                  aria-invalid={!!errors.first_name}
                  autoComplete="given-name"
                />
                <FieldError message={errors.first_name?.message} />
              </div>

              {/* Last Name */}
              <div>
                <Label
                  htmlFor="last_name"
                  className="text-xs text-foreground mb-1 block"
                >
                  {t("label_last_name")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="last_name"
                  {...form.register("last_name")}
                  className="h-12 rounded-xl border-border focus-visible:border-[#0091EA]"
                  aria-invalid={!!errors.last_name}
                  autoComplete="family-name"
                />
                <FieldError message={errors.last_name?.message} />
              </div>

              {/* NRC — optional */}
              <div>
                <Label
                  htmlFor="nrc"
                  className="text-xs text-foreground mb-1 block"
                >
                  {t("label_nrc")}{" "}
                  <span className="text-xs text-[#767676]">(optional)</span>
                </Label>
                <Input
                  id="nrc"
                  {...form.register("nrc")}
                  placeholder="e.g. 12/DAGANA(N)123456"
                  className="h-12 rounded-xl border-border focus-visible:border-[#0091EA]"
                  aria-invalid={!!errors.nrc}
                />
                <FieldError message={errors.nrc?.message} />
              </div>

              {/* Phone */}
              <div>
                <Label
                  htmlFor="phone"
                  className="text-xs text-foreground mb-1 block"
                >
                  {t("label_phone")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <span className="flex items-center h-12 px-3 rounded-xl border border-border bg-secondary text-sm text-foreground shrink-0">
                    +95
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    {...form.register("phone")}
                    placeholder="9xxxxxxxxx"
                    className="h-12 rounded-xl border-border focus-visible:border-[#0091EA] flex-1"
                    aria-invalid={!!errors.phone}
                    autoComplete="tel"
                  />
                </div>
                <FieldError message={errors.phone?.message} />
              </div>

              {/* Occupation — optional */}
              <div>
                <Label
                  htmlFor="occupation"
                  className="text-xs text-foreground mb-1 block"
                >
                  {t("label_occupation")}{" "}
                  <span className="text-xs text-[#767676]">(optional)</span>
                </Label>
                <Select
                  value={form.watch("occupation") ?? ""}
                  onValueChange={(value) => {
                    if (value) {
                      form.setValue(
                        "occupation",
                        value as RecipientFormInput["occupation"],
                        { shouldValidate: false }
                      );
                    } else {
                      form.setValue("occupation", undefined, {
                        shouldValidate: false,
                      });
                    }
                  }}
                >
                  <SelectTrigger
                    id="occupation"
                    className="h-12 w-full rounded-xl border-border focus-visible:border-[#0091EA]"
                  >
                    <SelectValue placeholder="Select occupation" />
                  </SelectTrigger>
                  <SelectContent>
                    {occupationOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {t(`occupation_${opt}` as Parameters<typeof t>[0])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <SectionDivider />

            {/* Section: Transfer Compliance */}
            <div className="flex flex-col gap-5">
              {/* Transfer Purpose */}
              <div>
                <Label
                  htmlFor="transfer_purpose"
                  className="text-xs text-foreground mb-1 block"
                >
                  {t("label_purpose")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.watch("transfer_purpose") ?? ""}
                  onValueChange={(value) => {
                    if (value) {
                      form.setValue(
                        "transfer_purpose",
                        value as RecipientFormInput["transfer_purpose"],
                        { shouldValidate: false }
                      );
                    }
                  }}
                >
                  <SelectTrigger
                    id="transfer_purpose"
                    className="h-12 w-full rounded-xl border-border focus-visible:border-[#0091EA]"
                    aria-invalid={!!errors.transfer_purpose}
                  >
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    {purposeOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {t(`purpose_${opt}` as Parameters<typeof t>[0])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={errors.transfer_purpose?.message} />
              </div>

              {/* Relationship */}
              <div>
                <Label
                  htmlFor="relationship"
                  className="text-xs text-foreground mb-1 block"
                >
                  {t("label_relationship")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.watch("relationship") ?? ""}
                  onValueChange={(value) => {
                    if (value) {
                      form.setValue(
                        "relationship",
                        value as RecipientFormInput["relationship"],
                        { shouldValidate: false }
                      );
                    }
                  }}
                >
                  <SelectTrigger
                    id="relationship"
                    className="h-12 w-full rounded-xl border-border focus-visible:border-[#0091EA]"
                    aria-invalid={!!errors.relationship}
                  >
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {t(`relationship_${opt}` as Parameters<typeof t>[0])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={errors.relationship?.message} />
              </div>
            </div>

            <SectionDivider />

            {/* Section: Address */}
            <div className="flex flex-col gap-5">
              {/* Address Line 1 */}
              <div>
                <Label
                  htmlFor="address_line_1"
                  className="text-xs text-foreground mb-1 block"
                >
                  {t("label_address1")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address_line_1"
                  {...form.register("address_line_1")}
                  className="h-12 rounded-xl border-border focus-visible:border-[#0091EA]"
                  aria-invalid={!!errors.address_line_1}
                />
                <FieldError message={errors.address_line_1?.message} />
              </div>

              {/* Address Line 2 — optional */}
              <div>
                <Label
                  htmlFor="address_line_2"
                  className="text-xs text-foreground mb-1 block"
                >
                  {t("label_address2")}{" "}
                  <span className="text-xs text-[#767676]">(optional)</span>
                </Label>
                <Input
                  id="address_line_2"
                  {...form.register("address_line_2")}
                  className="h-12 rounded-xl border-border focus-visible:border-[#0091EA]"
                />
              </div>

              {/* City */}
              <div>
                <Label
                  htmlFor="city"
                  className="text-xs text-foreground mb-1 block"
                >
                  {t("label_city")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="city"
                  {...form.register("city")}
                  className="h-12 rounded-xl border-border focus-visible:border-[#0091EA]"
                  aria-invalid={!!errors.city}
                />
                <FieldError message={errors.city?.message} />
              </div>

              {/* State / Region */}
              <div>
                <Label
                  htmlFor="state_region"
                  className="text-xs text-foreground mb-1 block"
                >
                  {t("label_state")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="state_region"
                  {...form.register("state_region")}
                  className="h-12 rounded-xl border-border focus-visible:border-[#0091EA]"
                  aria-invalid={!!errors.state_region}
                />
                <FieldError message={errors.state_region?.message} />
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 pb-6 pt-3 bg-white border-t border-[#F5F5F5]">
        <Button
          type="button"
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting || (isLoading && !recipient)}
          className="w-full h-14 rounded-full bg-[#FFE600] hover:bg-[#FFD600] text-foreground font-bold text-base"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </>
  );
}
