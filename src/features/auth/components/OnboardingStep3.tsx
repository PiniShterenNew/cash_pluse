"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Receipt } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, FormField } from "@/components/ui/Input";
import { MoneyInput } from "@/components/ui/Input";
import { onboardingStep3Schema, type OnboardingStep3Data } from "../types/auth.types";
import { onboardingStep3Action, completeOnboardingAction } from "../api/actions";
import { useState } from "react";

interface OnboardingStep3Props {
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingStep3({ onNext, onBack }: OnboardingStep3Props) {
  const [isSkipping, setIsSkipping] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingStep3Data>({
    resolver: zodResolver(onboardingStep3Schema),
    defaultValues: { skip: false },
  });

  async function onSubmit(data: OnboardingStep3Data) {
    const result = await onboardingStep3Action(data);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    await finishOnboarding();
  }

  async function handleSkip() {
    setIsSkipping(true);
    await onboardingStep3Action({ skip: true });
    await finishOnboarding();
  }

  async function finishOnboarding() {
    const result = await completeOnboardingAction();
    if (!result.success) {
      toast.error(result.error);
      setIsSkipping(false);
      return;
    }
    toast.success("הכל מוכן! ברוכים הבאים ל-CashPulse 🎉");
    onNext();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Step header */}
      <div className="flex flex-col gap-2">
        <div
          className="w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center mb-1"
          style={{ background: "var(--color-lavender-50)" }}
        >
          <Receipt size={22} className="text-[var(--color-lavender-500)]" strokeWidth={1.5} />
        </div>
        <h2
          className="text-xl font-semibold text-[var(--color-sand-800)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          חוב ראשון
        </h2>
        <p className="text-sm text-[var(--color-sand-500)]">
          הוסיפו את החוב הראשון שלכם — זה לוקח שניה
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FormField
          label="שם הלקוח"
          htmlFor="clientName"
          error={errors.clientName?.message}
          required
        >
          <Input
            id="clientName"
            type="text"
            placeholder="לדוגמה: חברת א.ב.ג"
            error={!!errors.clientName}
            {...register("clientName")}
          />
        </FormField>

        <FormField
          label="טלפון לקוח (WhatsApp)"
          htmlFor="clientPhone"
          error={errors.clientPhone?.message}
          hint="כולל קידומת מדינה, לדוגמה: +972501234567"
          required
        >
          <Input
            id="clientPhone"
            type="tel"
            inputMode="tel"
            placeholder="+972501234567"
            dir="ltr"
            error={!!errors.clientPhone}
            {...register("clientPhone")}
          />
        </FormField>

        <FormField
          label="תיאור החוב"
          htmlFor="debtTitle"
          error={errors.debtTitle?.message}
        >
          <Input
            id="debtTitle"
            type="text"
            placeholder='לדוגמה: "חשבונית 1023 — עבודות בנייה"'
            error={!!errors.debtTitle}
            {...register("debtTitle")}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="סכום (₪)"
            htmlFor="debtAmount"
            error={errors.debtAmount?.message}
            required
          >
            <MoneyInput
              id="debtAmount"
              placeholder="5,000"
              error={!!errors.debtAmount}
              {...register("debtAmount", { valueAsNumber: true })}
            />
          </FormField>

          <FormField
            label="תאריך פירעון"
            htmlFor="debtDueDate"
            error={errors.debtDueDate?.message}
            required
          >
            <Input
              id="debtDueDate"
              type="date"
              dir="ltr"
              error={!!errors.debtDueDate}
              {...register("debtDueDate")}
            />
          </FormField>
        </div>

        <div className="flex flex-col gap-3 mt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "יוצר חוב..." : "סיימו וצאו לדשבורד 🚀"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="md"
            isLoading={isSkipping}
            onClick={handleSkip}
            className="w-full"
          >
            {isSkipping ? "ממשיך..." : "דלגו — אגדיר מאוחר יותר"}
          </Button>
        </div>
      </form>

      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-[var(--color-sand-400)] hover:text-[var(--color-sand-600)] transition-colors mx-auto"
      >
        <ArrowLeft size={14} className="rtl:rotate-180" />
        חזרה
      </button>
    </div>
  );
}
