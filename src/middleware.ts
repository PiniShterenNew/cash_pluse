import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

const PROTECTED_PREFIXES = ["/dashboard", "/account", "/settings"];

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isOnboardingPath = pathname.startsWith("/onboarding");
  const isProtected = isProtectedPath(pathname);

  // Middleware is scoped to protected and onboarding routes only,
  // but keep a defensive early return for resilience.
  if (!isProtected && !isOnboardingPath) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });
  let user: { user_metadata?: { onboarding_complete?: boolean } } | null = null;

  try {
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value);
            });
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) => {
              supabaseResponse.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    const {
      data: { user: fetchedUser },
    } = await supabase.auth.getUser();

    user = fetchedUser;
  } catch {
    // Resilient fallback for Edge runtime failures:
    // treat request as unauthenticated instead of crashing middleware.
    user = null;
  }

  const isOnboardingComplete = user?.user_metadata?.onboarding_complete === true;

  // Unauthenticated access to protected/onboarding routes -> login
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";

    if (isProtected) {
      loginUrl.searchParams.set("redirectTo", pathname);
    }

    return NextResponse.redirect(loginUrl);
  }

  // Authenticated + onboarding NOT complete -> protected routes go to onboarding
  if (isProtected && !isOnboardingComplete) {
    const onboardingUrl = request.nextUrl.clone();
    onboardingUrl.pathname = "/onboarding";
    return NextResponse.redirect(onboardingUrl);
  }

  // Authenticated + onboarding complete + onboarding route -> dashboard
  if (isOnboardingPath && isOnboardingComplete) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/account/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
  ],
};
