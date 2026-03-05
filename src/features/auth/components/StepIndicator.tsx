import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number; // 0-indexed
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-start gap-0">
      {steps.map((step, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;
        const isLast = i === steps.length - 1;

        return (
          <div key={step.label} className="flex items-start flex-1">
            {/* Step circle + connector */}
            <div className="flex flex-col items-center">
              {/* Circle */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-[280ms]",
                  isDone && "bg-[var(--color-mint-500)] text-white",
                  isActive && "bg-[var(--color-mint-500)] text-white shadow-[var(--shadow-glow)]",
                  !isDone && !isActive && "bg-[var(--color-sand-100)] text-[var(--color-sand-400)]",
                )}
              >
                {isDone ? <Check size={14} strokeWidth={2.5} /> : i + 1}
              </div>

              {/* Connector line below */}
              {!isLast && (
                <div
                  className="w-px flex-1 mt-1 min-h-[16px]"
                  style={{
                    background: isDone
                      ? "var(--color-mint-400)"
                      : "var(--color-sand-200)",
                  }}
                />
              )}
            </div>

            {/* Label — hidden on mobile for steps > 0 */}
            <div className={cn("ps-3 pt-1 pb-6", isLast && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-medium",
                  isActive
                    ? "text-[var(--color-sand-800)]"
                    : isDone
                    ? "text-[var(--color-mint-600)]"
                    : "text-[var(--color-sand-400)]",
                )}
              >
                {step.label}
              </p>
              <p className="text-xs text-[var(--color-sand-400)] mt-0.5 hidden sm:block">
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
