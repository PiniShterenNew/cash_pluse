"use client";

import { useState } from "react";
import { MessageCircle, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, FormField } from "@/components/ui/Input";
import { onboardingStep2Action } from "../api/actions";
import { toast } from "sonner";

interface OnboardingStep2Props {
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingStep2({ onNext, onBack }: OnboardingStep2Props) {
  const [isSkipping, setIsSkipping] = useState(false);
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSkip() {
    setIsSkipping(true);
    await onboardingStep2Action({ skip: true });
    onNext();
  }

  async function handleSave() {
    setIsSaving(true);
    const result = await onboardingStep2Action({ skip: false, phoneNumberId, accessToken });
    setIsSaving(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("WhatsApp מחובר! 🟢");
    onNext();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Step header */}
      <div className="flex flex-col gap-2">
        <div
          className="w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center mb-1"
          style={{ background: "var(--color-whatsapp-soft)" }}
        >
          <MessageCircle size={22} style={{ color: "var(--color-whatsapp)" }} strokeWidth={1.5} />
        </div>
        <h2
          className="text-xl font-semibold text-[var(--color-sand-800)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          חיבור WhatsApp
        </h2>
        <p className="text-sm text-[var(--color-sand-500)]">
          שלחו תזכורות גבייה ישירות ל-WhatsApp של הלקוחות
        </p>
      </div>

      {/* Info banner */}
      <div
        className="rounded-[var(--radius-md)] p-4"
        style={{ background: "var(--color-whatsapp-soft)" }}
      >
        <p className="text-sm text-[var(--color-sand-700)] leading-relaxed">
          חיבור WhatsApp מצריך חשבון{" "}
          <strong>WhatsApp Business API</strong> דרך Meta.
          <br />
          <a
            href="https://developers.facebook.com/docs/whatsapp"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-1 text-xs text-[var(--color-whatsapp)] hover:underline"
          >
            למדריך הגדרה <ExternalLink size={11} />
          </a>
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <FormField label="Phone Number ID" htmlFor="phoneNumberId">
          <Input
            id="phoneNumberId"
            type="text"
            placeholder="123456789012345"
            dir="ltr"
            value={phoneNumberId}
            onChange={(e) => setPhoneNumberId(e.target.value)}
          />
        </FormField>

        <FormField label="Access Token" htmlFor="accessToken" hint="נשמר מוצפן">
          <Input
            id="accessToken"
            type="password"
            placeholder="EAAxxxxxxxx..."
            dir="ltr"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
          />
        </FormField>
      </div>

      <div className="flex flex-col gap-3 mt-2">
        {phoneNumberId && accessToken ? (
          <Button
            variant="whatsapp"
            size="lg"
            isLoading={isSaving}
            onClick={handleSave}
            className="w-full"
          >
            {isSaving ? "מחבר..." : "חיבור WhatsApp"}
          </Button>
        ) : null}

        <Button
          variant="ghost"
          size="md"
          isLoading={isSkipping}
          onClick={handleSkip}
          className="w-full"
        >
          {isSkipping ? "ממשיך..." : "דלגו — אגדיר מאוחר יותר"}
        </Button>
      </div>

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
