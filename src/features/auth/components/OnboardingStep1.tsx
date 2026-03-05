"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, FormField } from "@/components/ui/Input";
import { onboardingStep1Schema, type OnboardingStep1Data } from "../types/auth.types";
import { onboardingStep1Action } from "../api/actions";

interface OnboardingStep1Props {
  onNext: () => void;
}

export function OnboardingStep1({ onNext }: OnboardingStep1Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingStep1Data>({
    resolver: zodResolver(onboardingStep1Schema),
  });

  async function onSubmit(data: OnboardingStep1Data) {
    const result = await onboardingStep1Action(data);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    onNext();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Step header */}
      <div className="flex flex-col gap-2">
        <div
          className="w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center mb-1"
          style={{ background: "var(--color-mint-50)" }}
        >
          <Building2 size={22} className="text-[var(--color-mint-600)]" strokeWidth={1.5} />
        </div>
        <h2
          className="text-xl font-semibold text-[var(--color-sand-800)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          פרטי העסק
        </h2>
        <p className="text-sm text-[var(--color-sand-500)]">
          ספרו לנו קצת על העסק שלכם
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FormField
          label="שם העסק"
          htmlFor="companyName"
          error={errors.companyName?.message}
          required
        >
          <Input
            id="companyName"
            type="text"
            autoComplete="organization"
            placeholder='לדוגמה: "נגריית לוי" או "ייעוץ כהן"'
            error={!!errors.companyName}
            {...register("companyName")}
          />
        </FormField>

        <FormField
          label="מספר עוסק / ח.פ"
          htmlFor="registrationNumber"
          hint="אופציונלי — ניתן להוסיף מאוחר יותר"
          error={errors.registrationNumber?.message}
        >
          <Input
            id="registrationNumber"
            type="text"
            inputMode="numeric"
            placeholder="123456789"
            dir="ltr"
            error={!!errors.registrationNumber}
            {...register("registrationNumber")}
          />
        </FormField>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full mt-2"
        >
          {isSubmitting ? "שומר..." : "המשיכו →"}
        </Button>
      </form>
    </div>
  );
}
