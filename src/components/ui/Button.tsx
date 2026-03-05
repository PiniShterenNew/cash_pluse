"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "whatsapp";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    "bg-[var(--color-mint-500)] text-white",
    "hover:bg-[var(--color-mint-600)] hover:-translate-y-px",
    "hover:shadow-[var(--shadow-glow)]",
    "active:scale-[0.97]",
    "shadow-[var(--shadow-sm)]",
    "disabled:bg-[var(--color-sand-200)] disabled:text-[var(--color-sand-400)] disabled:translate-y-0 disabled:shadow-none",
  ].join(" "),

  secondary: [
    "bg-transparent text-[var(--color-sand-700)]",
    "border border-[var(--color-sand-200)] border-[1.5px]",
    "hover:bg-[var(--color-sand-50)] hover:-translate-y-px",
    "active:scale-[0.97]",
    "disabled:opacity-50 disabled:translate-y-0",
  ].join(" "),

  ghost: [
    "bg-transparent text-[var(--color-sand-500)]",
    "hover:bg-[var(--color-sand-100)] hover:text-[var(--color-sand-700)]",
    "active:scale-[0.97]",
    "disabled:opacity-50",
  ].join(" "),

  danger: [
    "bg-[var(--color-rose-50)] text-[var(--color-rose-500)]",
    "border border-[var(--color-rose-200)] border-[1.5px]",
    "hover:bg-[var(--color-rose-100)] hover:-translate-y-px",
    "active:scale-[0.97]",
    "disabled:opacity-50 disabled:translate-y-0",
  ].join(" "),

  whatsapp: [
    "bg-[var(--color-whatsapp)] text-white",
    "hover:bg-[var(--color-whatsapp-hover)] hover:-translate-y-px",
    "hover:shadow-[0_0_24px_rgba(37,211,102,0.30)]",
    "active:scale-[0.97]",
    "shadow-[var(--shadow-sm)]",
    "disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none",
  ].join(" "),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs gap-1.5",
  md: "px-7 py-3 text-sm gap-2",
  lg: "px-8 py-3.5 text-base gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center",
          "rounded-[var(--radius-pill)]",
          "font-[Rubik] font-semibold",
          "transition-all duration-[280ms] cubic-bezier(0.22,1,0.36,1)",
          "cursor-pointer select-none",
          "focus-visible:outline-2 focus-visible:outline-[var(--color-mint-400)] focus-visible:outline-offset-2",
          variantStyles[variant],
          sizeStyles[size],
          (disabled || isLoading) && "pointer-events-none",
          className,
        )}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        ) : (
          leftIcon && <span aria-hidden="true">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = "Button";
