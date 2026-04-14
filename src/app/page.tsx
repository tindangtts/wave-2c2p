import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/demo";

export default function RootPage() {
  // In demo mode, go directly to home (already logged in)
  if (isDemoMode) {
    redirect("/home");
  }
  // Otherwise, show the pre-login landing
  redirect("/welcome");
}
