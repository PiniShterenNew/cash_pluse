import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { DebtStatus } from "@/lib/database.types";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "mint" | "rose" | "honey" | "lavender" | "sand" | undefined;
  dot?: boolean | undefined;
}

const badgeVariants = {
  default: "bg-[var(--color-sand-100)] text-[var(--color-sand-600)]",
  mint: "bg-[var(--color-mint-50)] text-[var(--color-mint-700)]",
  rose: "bg-[var(--color-rose-50)] text-[var(--color-rose-600)]",
  honey: "bg-[var(--color-honey-50)] text-[var(--color-honey-600)]",
  lavender: "bg-[var(--color-lavender-50)] text-[var(--color-lavender-600)]",
  sand: "bg-[var(--color-sand-100)] text-[var(--color-sand-600)]",
};

const dotColors = {
  default: "bg-[var(--color-sand-400)]",
  mint: "bg-[var(--color-mint-500)]",
  rose: "bg-[var(--color-rose-400)]",
  honey: "bg-[var(--color-honey-400)]",
  lavender: "bg-[var(--color-lavender-400)]",
  sand: "bg-[var(--color-sand-400)]",
};

export function Badge({
  variant = "default",
  dot = true,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        "rounded-[var(--radius-pill)] px-3.5 py-1",
        "text-xs font-medium",
        badgeVariants[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────
const debtStatusConfig: Record<
  DebtStatus,
  { label: string; variant: BadgeProps["variant"] }
> = {
  draft: { label: "טיוטה", variant: "sand" },
  open: { label: "פתוח", variant: "default" },
  due_today: { label: "מגיע היום", variant: "honey" },
  overdue: { label: "באיחור", variant: "rose" },
  partially_paid: { label: "שולם חלקית", variant: "lavender" },
  paid: { label: "שולם", variant: "mint" },
  canceled: { label: "בוטל", variant: "sand" },
  disputed: { label: "במחלוקת", variant: "rose" },
};

interface StatusBadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  status: DebtStatus;
}

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const config = debtStatusConfig[status];
  return (
    <Badge variant={config.variant} className={className} {...props}>
      {config.label}
    </Badge>
  );
}
