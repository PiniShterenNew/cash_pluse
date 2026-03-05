"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";
import {
  loginSchema,
  signupSchema,
  onboardingStep1Schema,
  onboardingStep3Schema,
  type AuthActionResult,
  type LoginFormData,
  type SignupFormData,
  type OnboardingStep1Data,
  type OnboardingStep2Data,
  type OnboardingStep3Data,
} from "../types/auth.types";

function firstError(errors: { message: string }[], fallback: string): string {
  return errors[0]?.message ?? fallback;
}

// ─── Login ────────────────────────────────────────────────────

export async function loginAction(data: LoginFormData): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: firstError(parsed.error.errors, "שגיאת אימות") };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { success: false, error: "אימייל או סיסמה שגויים" };
    }
    return { success: false, error: "שגיאה בהתחברות — ננסה שוב?" };
  }

  return { success: true };
}

// ─── Signup ───────────────────────────────────────────────────

export async function signupAction(data: SignupFormData): Promise<AuthActionResult> {
  const parsed = signupSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: firstError(parsed.error.errors, "שגיאת אימות") };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
      },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { success: false, error: "כתובת האימייל הזו כבר רשומה במערכת" };
    }
    return { success: false, error: "שגיאה ביצירת החשבון — ננסה שוב?" };
  }

  return { success: true };
}

// ─── Google OAuth ─────────────────────────────────────────────

export async function signInWithGoogleAction(): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });

  if (error || !data.url) {
    return { error: "שגיאה בהתחברות עם Google" };
  }

  return { url: data.url };
}

// ─── Sign Out ─────────────────────────────────────────────────

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// ─── Onboarding Step 1: Company Details ───────────────────────

export async function onboardingStep1Action(data: OnboardingStep1Data): Promise<AuthActionResult> {
  const parsed = onboardingStep1Schema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: firstError(parsed.error.errors, "שגיאת אימות") };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מחובר" };

  // Use explicit generic type on .single<T>() to work around Supabase type inference
  // limitations under noUncheckedIndexedAccess + exactOptionalPropertyTypes.
  const { data: profile } = await supabase
    .from("users")
    .select("company_id")
    .eq("id", user.id)
    .single<{ company_id: string }>();

  if (!profile) return { success: false, error: "פרופיל לא נמצא" };

  // Work around Supabase `.update()` type resolving to `never` under strict tsconfig.
  // The update shape is verified by the explicit Database type annotation below.
  const updatePayload: Database["public"]["Tables"]["companies"]["Update"] = {
    name: parsed.data.companyName,
    registration_number: parsed.data.registrationNumber ?? null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await (supabase.from("companies") as unknown as {
    update(data: Database["public"]["Tables"]["companies"]["Update"]): {
      eq(col: string, val: string): Promise<{ error: { message: string } | null }>;
    };
  }).update(updatePayload).eq("id", profile.company_id);

  if (error) return { success: false, error: "שגיאה בשמירת פרטי העסק" };

  return { success: true };
}

// ─── Onboarding Step 2: WhatsApp (optional skip) ──────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function onboardingStep2Action(_data: OnboardingStep2Data): Promise<AuthActionResult> {
  // WhatsApp config is optional at onboarding — full setup is done in Settings.
  return { success: true };
}

// ─── Onboarding Step 3: First Debt ────────────────────────────

export async function onboardingStep3Action(data: OnboardingStep3Data): Promise<AuthActionResult> {
  if (data.skip) return { success: true };

  const parsed = onboardingStep3Schema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: firstError(parsed.error.errors, "שגיאת אימות") };
  }

  const { clientName, clientPhone, debtTitle, debtAmount, debtDueDate } = parsed.data;

  if (!clientName || !clientPhone || !debtAmount || !debtDueDate) {
    return { success: false, error: "נא למלא את כל שדות החוב" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מחובר" };

  const { data: profile } = await supabase
    .from("users")
    .select("company_id")
    .eq("id", user.id)
    .single<{ company_id: string }>();

  if (!profile) return { success: false, error: "פרופיל לא נמצא" };

  // Work around Supabase `.insert()` type resolving to `never` under strict tsconfig.
  type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];
  type DebtInsert = Database["public"]["Tables"]["debts"]["Insert"];

  const { data: client, error: clientError } = await (supabase.from("clients") as unknown as {
    insert(data: ClientInsert): {
      select(): {
        single<T>(): Promise<{ data: T | null; error: { message: string } | null }>;
      };
    };
  }).insert({
    company_id: profile.company_id,
    name: clientName,
    phone_e164: clientPhone,
  }).select().single<{ id: string }>();

  if (clientError || !client) {
    return { success: false, error: "שגיאה ביצירת הלקוח" };
  }

  const { error: debtError } = await (supabase.from("debts") as unknown as {
    insert(data: DebtInsert): Promise<{ error: { message: string } | null }>;
  }).insert({
    company_id: profile.company_id,
    client_id: client.id,
    title: debtTitle ?? `חוב של ${clientName}`,
    amount_total: debtAmount,
    amount_outstanding: debtAmount,
    due_date: debtDueDate,
    status: "open",
    created_by_user_id: user.id,
  });

  if (debtError) return { success: false, error: "שגיאה ביצירת החוב" };

  return { success: true };
}

// ─── Complete Onboarding ──────────────────────────────────────

export async function completeOnboardingAction(): Promise<AuthActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: { onboarding_complete: true },
  });

  if (error) return { success: false, error: "שגיאה בסיום הגדרת החשבון" };

  revalidatePath("/dashboard");
  return { success: true };
}
