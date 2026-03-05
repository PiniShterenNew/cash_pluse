import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/features/auth/components/OnboardingWizard";

export const metadata: Metadata = {
  title: "הגדרת חשבון",
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // If already done, skip to dashboard
  if (user.user_metadata?.onboarding_complete === true) {
    redirect("/dashboard");
  }

  return <OnboardingWizard />;
}
