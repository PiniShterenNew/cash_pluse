import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

const PROTECTED_PATHS = [
  "/dashboard",
  "/receivables",
  "/cashflow",
  "/clients",
  "/messages",
  "/reports",
  "/settings",
];

export async function middleware(request: NextRequest) {
  // Guard: if Supabase env vars are missing (e.g. not configured on Vercel),
  // pass through instead of crashing the Edge runtime.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "[middleware] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY — " +
      "add them to your Vercel project settings.",
    );
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isOnboardingPath = pathname.startsWith("/onboarding");
  const isAuthPath = pathname === "/login" || pathname === "/signup";
  const isOnboardingComplete = user?.user_metadata?.onboarding_complete === true;

  // 1. Unauthenticated → redirect to login for protected paths
  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Unauthenticated → redirect to login for /onboarding
  if (isOnboardingPath && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // 3. Authenticated + onboarding NOT complete → redirect protected routes to /onboarding
  if (user && isProtected && !isOnboardingComplete) {
    const onboardingUrl = request.nextUrl.clone();
    onboardingUrl.pathname = "/onboarding";
    return NextResponse.redirect(onboardingUrl);
  }

  // 4. Authenticated + onboarding complete + going to /onboarding or auth pages → redirect to dashboard
  if (user && isOnboardingComplete && (isOnboardingPath || isAuthPath)) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  // 5. Authenticated + onboarding NOT complete + going to auth pages → redirect to /onboarding
  if (user && !isOnboardingComplete && isAuthPath) {
    const onboardingUrl = request.nextUrl.clone();
    onboardingUrl.pathname = "/onboarding";
    return NextResponse.redirect(onboardingUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Exclude static files and the OAuth callback route
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
