import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchange error:", error.message);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // Check if user has completed onboarding
  const { data: { user } } = await supabase.auth.getUser();
  const isOnboardingComplete = user?.user_metadata?.onboarding_complete === true;

  const redirectTo = isOnboardingComplete ? next : "/onboarding";
  return NextResponse.redirect(`${origin}${redirectTo}`);
}
