import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  ctaLabel?: string;
  onCta?: () => void;
  ctaIcon?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  ctaLabel,
  onCta,
  ctaIcon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "py-16 px-8 gap-4",
        className,
      )}
    >
      {icon && (
        <div
          className={cn(
            "flex items-center justify-center",
            "w-20 h-20 rounded-[var(--radius-xl)]",
            "bg-[var(--color-sand-100)]",
            "text-[var(--color-sand-400)]",
            "text-4xl",
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      <div className="space-y-2 max-w-xs">
        <h3
          className="text-lg font-semibold text-[var(--color-sand-700)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h3>
        {description && (
          <p className="text-sm text-[var(--color-sand-400)] leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {ctaLabel && onCta && (
        <Button onClick={onCta} leftIcon={ctaIcon} className="mt-2">
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
