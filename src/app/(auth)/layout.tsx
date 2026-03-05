import type { Metadata } from "next";
import { AuthHeroPanel } from "@/features/auth/components/AuthHeroPanel";

export const metadata: Metadata = {
  title: "CashPulse",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex" style={{ background: "var(--color-surface-base)" }}>
      {/*
        RTL layout — flex-row flows right → left:
        children (form) → right side (start)
        AuthHeroPanel   → left side (end)
      */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div
          className="w-full max-w-[420px] animate-fade-in-up"
          style={{
            background: "var(--color-surface-card)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-float)",
            padding: "40px 36px",
          }}
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
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
              CashPulse
            </span>
          </div>

          {children}
        </div>
      </div>

      {/* Hero panel — visible only on desktop */}
      <div className="w-[480px] shrink-0">
        <AuthHeroPanel />
      </div>
    </div>
  );
}
