"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, leftAddon, rightAddon, className, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        {leftAddon && (
          <div className="absolute start-3 text-[var(--color-sand-400)] pointer-events-none">
            {leftAddon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full",
            "bg-[var(--color-surface-sunken)]",
            "rounded-[var(--radius-sm)]",
            "border border-[1.5px]",
            "px-4 py-3",
            "text-sm text-[var(--color-sand-800)]",
            "font-[Rubik]",
            "shadow-[var(--shadow-inset)]",
            "placeholder:text-[var(--color-sand-400)]",
            "transition-all duration-[280ms]",
            "outline-none",
            !error
              ? "border-[var(--color-sand-200)] focus:border-[var(--color-mint-400)] focus:ring-2 focus:ring-[var(--color-mint-400)]/20"
              : "border-[var(--color-rose-400)] focus:border-[var(--color-rose-400)] focus:ring-2 focus:ring-[var(--color-rose-400)]/20",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            leftAddon && "ps-10",
            rightAddon && "pe-10",
            className,
          )}
          {...props}
        />
        {rightAddon && (
          <div className="absolute end-3 text-[var(--color-sand-400)] pointer-events-none">
            {rightAddon}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

// ─── MoneyInput ───────────────────────────────────────────────────────────────
interface MoneyInputProps extends Omit<InputProps, "type"> {
  currency?: string;
}

export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ currency = "₪", className, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        <span className="absolute start-3 text-[var(--color-sand-500)] font-[DM_Mono] text-sm pointer-events-none">
          {currency}
        </span>
        <input
          ref={ref}
          type="number"
          dir="ltr"
          className={cn(
            "w-full",
            "bg-[var(--color-surface-sunken)]",
            "rounded-[var(--radius-sm)]",
            "border border-[1.5px] border-[var(--color-sand-200)]",
            "ps-9 pe-4 py-3",
            "text-lg text-[var(--color-sand-800)]",
            "font-[DM_Mono] text-end",
            "shadow-[var(--shadow-inset)]",
            "focus:border-[var(--color-mint-400)] focus:ring-2 focus:ring-[var(--color-mint-400)]/20",
            "outline-none",
            "transition-all duration-[280ms]",
            "disabled:opacity-50",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);

MoneyInput.displayName = "MoneyInput";

// ─── Label ────────────────────────────────────────────────────────────────────
import { type LabelHTMLAttributes } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ required, className, children, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "block text-sm font-medium text-[var(--color-sand-700)]",
        "mb-1.5 tracking-wide",
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="text-[var(--color-rose-500)] ms-0.5" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

// ─── FormField ────────────────────────────────────────────────────────────────
interface FormFieldProps {
  label?: string | undefined;
  htmlFor?: string | undefined;
  error?: string | undefined;
  hint?: string | undefined;
  required?: boolean | undefined;
  children: ReactNode;
  className?: string | undefined;
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-0", className)}>
      {label && (
        <Label htmlFor={htmlFor} required={required ?? false}>
          {label}
        </Label>
      )}
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-[var(--color-rose-500)]" role="alert">
          {error}
        </p>
      )}
      {!error && hint && (
        <p className="mt-1.5 text-xs text-[var(--color-sand-400)]">{hint}</p>
      )}
    </div>
  );
}
