"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Tab<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  count?: number;
}

interface TabsProps<T extends string> {
  tabs: Tab<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={cn(
        "inline-flex items-center gap-1 p-1",
        "bg-[var(--color-sand-100)] rounded-[var(--radius-pill)]",
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={cn(
              "relative inline-flex items-center gap-2",
              "px-5 py-2 rounded-[var(--radius-pill)]",
              "text-sm font-medium",
              "transition-all duration-[280ms] cubic-bezier(0.22,1,0.36,1)",
              "cursor-pointer select-none",
              isActive
                ? "bg-[var(--color-surface-card)] text-[var(--color-sand-800)] shadow-[var(--shadow-sm)] font-semibold"
                : "bg-transparent text-[var(--color-sand-500)] hover:text-[var(--color-sand-700)]",
            )}
          >
            {tab.icon && <span aria-hidden="true">{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center justify-center",
                  "min-w-5 h-5 px-1.5 rounded-full text-xs",
                  isActive
                    ? "bg-[var(--color-mint-100)] text-[var(--color-mint-700)]"
                    : "bg-[var(--color-sand-200)] text-[var(--color-sand-500)]",
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
