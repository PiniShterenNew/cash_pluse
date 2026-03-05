"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StepIndicator } from "./StepIndicator";
import { OnboardingStep1 } from "./OnboardingStep1";
import { OnboardingStep2 } from "./OnboardingStep2";
import { OnboardingStep3 } from "./OnboardingStep3";

const STEPS = [
  { label: "פרטי העסק", description: "שם ומספר עוסק" },
  { label: "WhatsApp", description: "חיבור לשליחת תזכורות" },
  { label: "חוב ראשון", description: "הוסיפו חוב לדוגמה" },
];

export function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  function handleNext() {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      // All steps done — go to dashboard
      router.push("/dashboard");
      router.refresh();
    }
  }

  function handleBack() {
    setCurrentStep((s) => Math.max(0, s - 1));
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 sm:p-8"
      style={{ background: "var(--color-surface-base)" }}
    >
      <div
        className="w-full max-w-[640px] animate-fade-in-up"
        style={{
          background: "var(--color-surface-card)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-xl)",
          overflow: "hidden",
        }}
      >
        {/* Top bar */}
        <div
          className="px-8 pt-8 pb-6 border-b"
          style={{ borderColor: "var(--color-sand-100)" }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <div
              className="w-8 h-8 rounded-[10px] flex items-center justify-center"
              style={{ background: "var(--color-mint-500)" }}
            >
              <span className="text-white text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>
                C
              </span>
            </div>
            <span
              className="text-[var(--color-sand-800)] font-semibold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              CashPulse — הגדרת חשבון
            </span>
          </div>

          {/* Step indicator */}
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </div>

        {/* Step content */}
        <div className="px-8 py-8">
          <div key={currentStep} className="animate-fade-in-up">
            {currentStep === 0 && <OnboardingStep1 onNext={handleNext} />}
            {currentStep === 1 && (
              <OnboardingStep2 onNext={handleNext} onBack={handleBack} />
            )}
            {currentStep === 2 && (
              <OnboardingStep3 onNext={handleNext} onBack={handleBack} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
