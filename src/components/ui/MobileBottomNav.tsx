"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { href: "/dashboard", label: "דשבורד", icon: LayoutDashboard },
  { href: "/receivables", label: "חשבונות", icon: FileText },
  { href: "/cashflow", label: "תזרים", icon: TrendingUp },
  { href: "/clients", label: "לקוחות", icon: Users },
  { href: "/settings", label: "הגדרות", icon: Settings },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 inset-x-0 z-40",
        "lg:hidden",
        "h-[72px] px-2",
        "bg-[var(--color-surface-card)]/95 backdrop-blur-md",
        "rounded-t-[var(--radius-xl)]",
        "shadow-[var(--shadow-xl)]",
        "border-t border-[var(--color-sand-100)]",
        "flex items-center justify-around",
      )}
      aria-label="ניווט ראשי"
    >
      {mobileNavItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href as Route}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-2",
              "rounded-[var(--radius-md)]",
              "min-w-[56px]",
              "transition-all duration-[280ms]",
              isActive
                ? "text-[var(--color-mint-600)]"
                : "text-[var(--color-sand-400)] hover:text-[var(--color-sand-600)]",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center w-10 h-7 rounded-[var(--radius-pill)]",
                "transition-all duration-[280ms]",
                isActive
                  ? "bg-[var(--color-mint-100)]"
                  : "bg-transparent",
              )}
            >
              <item.icon
                size={20}
                strokeWidth={1.5}
              />
            </div>
            <span className="text-[10px] font-medium leading-none">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
