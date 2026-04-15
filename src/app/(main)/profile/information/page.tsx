"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { BackHeader } from "@/components/layout/back-header";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  date_of_birth: string | null;
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col h-14 justify-center px-4 border-b border-border">
      <span className="text-xs font-normal text-muted-foreground">{label}</span>
      <span className="text-base font-normal text-foreground">
        {value || "—"}
      </span>
    </div>
  );
}

export default function InformationPage() {
  const t = useTranslations("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("user_profiles")
          .select("first_name, last_name, phone, date_of_birth")
          .eq("id", user.id)
          .single();
        if (data) setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  const fullName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "—";
  const phone = profile?.phone || "—";
  const dob = profile?.date_of_birth || "—";

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <BackHeader title={t("information.title")} />
      <div className="flex-1 bg-white">
        <FieldRow label={t("information.fullName")} value={fullName} />
        <FieldRow label={t("information.phone")} value={phone} />
        <FieldRow label={t("information.dob")} value={dob} />
      </div>
    </div>
  );
}
