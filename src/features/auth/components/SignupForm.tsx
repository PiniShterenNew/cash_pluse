"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, FormField } from "@/components/ui/Input";
import { signupSchema, type SignupFormData } from "../types/auth.types";
import { signupAction, signInWithGoogleAction } from "../api/actions";

export function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(data: SignupFormData) {
    const result = await signupAction(data);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("החשבון נוצר! 🎉 בואו נגדיר את העסק שלכם");
    router.push("/onboarding");
    router.refresh();
  }

  async function handleGoogleLogin() {
    setIsGoogleLoading(true);
    const result = await signInWithGoogleAction();
    if ("error" in result) {
      toast.error(result.error);
      setIsGoogleLoading(false);
      return;
    }
    window.location.href = result.url;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1
          className="text-[28px] font-semibold text-[var(--color-sand-800)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          הצטרפו ל-CashPulse 🌱
        </h1>
        <p className="text-sm text-[var(--color-sand-500)]">
          בחינם לגמרי — בלי כרטיס אשראי
        </p>
      </div>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-[var(--radius-pill)] border border-[1.5px] border-[var(--color-sand-200)] bg-white text-[var(--color-sand-700)] text-sm font-medium hover:bg-[var(--color-sand-50)] transition-all duration-[280ms] disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ fontFamily: "var(--font-body)" }}
        aria-busy={isGoogleLoading}
      >
        {isGoogleLoading ? (
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        {isGoogleLoading ? "מתחבר..." : "הרשמה עם Google"}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[var(--color-sand-200)]" />
        <span className="text-xs text-[var(--color-sand-400)]">או עם אימייל</span>
        <div className="flex-1 h-px bg-[var(--color-sand-200)]" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FormField
          label="שם מלא"
          htmlFor="fullName"
          error={errors.fullName?.message}
          required
        >
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="ישראל ישראלי"
            error={!!errors.fullName}
            leftAddon={<User size={16} />}
            {...register("fullName")}
          />
        </FormField>

        <FormField
          label="אימייל"
          htmlFor="email"
          error={errors.email?.message}
          required
        >
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="your@email.com"
            dir="ltr"
            error={!!errors.email}
            leftAddon={<Mail size={16} />}
            {...register("email")}
          />
        </FormField>

        <FormField
          label="סיסמה"
          htmlFor="password"
          error={errors.password?.message}
          hint="לפחות 8 תווים"
          required
        >
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            dir="ltr"
            error={!!errors.password}
            leftAddon={<Lock size={16} />}
            rightAddon={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="pointer-events-auto text-[var(--color-sand-400)] hover:text-[var(--color-sand-600)] transition-colors"
                aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            {...register("password")}
          />
        </FormField>

        <FormField
          label="אימות סיסמה"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
          required
        >
          <Input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            dir="ltr"
            error={!!errors.confirmPassword}
            leftAddon={<Lock size={16} />}
            rightAddon={
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="pointer-events-auto text-[var(--color-sand-400)] hover:text-[var(--color-sand-600)] transition-colors"
                aria-label={showConfirm ? "הסתר סיסמה" : "הצג סיסמה"}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            {...register("confirmPassword")}
          />
        </FormField>

        <p className="text-xs text-[var(--color-sand-400)] leading-relaxed">
          בלחיצה על &quot;הצטרפו&quot; אתם מסכימים ל
          <a href="/terms" className="text-[var(--color-mint-600)] hover:underline">
            תנאי השימוש
          </a>{" "}
          ול
          <a href="/privacy" className="text-[var(--color-mint-600)] hover:underline">
            מדיניות הפרטיות
          </a>
        </p>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "יוצר חשבון..." : "הצטרפו בחינם"}
        </Button>
      </form>

      {/* Login link */}
      <p className="text-center text-sm text-[var(--color-sand-500)]">
        כבר יש לכם חשבון?{" "}
        <a
          href="/login"
          className="text-[var(--color-mint-600)] font-medium hover:text-[var(--color-mint-700)] transition-colors"
        >
          התחברו
        </a>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
