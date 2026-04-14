"use client";

import { useRouter } from "next/navigation";
import { BackHeader } from "@/components/layout/back-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ChevronRight,
  Info,
  Users,
  Lock,
  UserCog,
  Bell,
  Phone,
  Globe,
  DollarSign,
  HelpCircle,
  FileText,
  Shield,
  LogOut,
} from "lucide-react";

const settingsGroups = [
  {
    title: "Settings",
    items: [
      { label: "Information", icon: Info, href: "/profile/info" },
      { label: "Refer Friends", icon: Users, href: "/profile/refer" },
      { label: "Change Passcode", icon: Lock, href: "/profile/passcode" },
      {
        label: "Manage Personal Information",
        icon: UserCog,
        href: "/profile/personal",
      },
      {
        label: "Notification Settings",
        icon: Bell,
        href: "/profile/notifications",
      },
    ],
  },
  {
    title: "Help & Support",
    items: [
      { label: "Contact Us", icon: Phone, href: "/profile/contact" },
      { label: "Languages", icon: Globe, href: "/profile/language" },
      { label: "Limits and Fees", icon: DollarSign, href: "/profile/limits" },
      { label: "Q&A Session", icon: HelpCircle, href: "/profile/faq" },
      {
        label: "Terms and Conditions",
        icon: FileText,
        href: "/profile/terms",
      },
      { label: "Privacy and Policy", icon: Shield, href: "/profile/privacy" },
    ],
  },
];

export default function ProfilePage() {
  const router = useRouter();

  return (
    <>
      <BackHeader title="Profile Setting" />
      <div className="flex-1 px-4 py-6">
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-wave-blue text-white text-xl font-bold">
              L
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Lalita Tungtrakul...
            </h2>
          </div>
        </div>

        {/* Settings groups */}
        {settingsGroups.map((group) => (
          <div key={group.title} className="mb-6">
            <h3 className="text-base font-bold text-foreground mb-3">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  className="w-full flex items-center justify-between py-3 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              ))}
            </div>
            <Separator className="mt-2" />
          </div>
        ))}

        {/* Version & Logout */}
        <div className="text-center space-y-3 pb-4">
          <p className="text-xs text-muted-foreground">V 1.0</p>
          <button className="text-sm font-medium text-wave-error flex items-center gap-2 mx-auto">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
