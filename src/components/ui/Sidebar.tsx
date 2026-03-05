"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  Users,
  MessageCircle,
  BarChart3,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  isPro?: boolean;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "דשבורד", icon: LayoutDashboard },
  { href: "/receivables", label: "חשבונות פתוחים", icon: FileText },
  { href: "/cashflow", label: "תזרים מזומנים", icon: TrendingUp },
  { href: "/clients", label: "לקוחות", icon: Users },
  { href: "/messages", label: "הודעות", icon: MessageCircle },
  { href: "/reports", label: "דוחות", icon: BarChart3, isPro: true },
  { href: "/settings", label: "הגדרות", icon: Settings },
];

interface SidebarProps {
  companyName?: string;
}

export function Sidebar({ companyName = "CashPulse" }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 end-0 z-40",
        "w-[280px] hidden lg:flex flex-col",
        "bg-[var(--color-surface-card)] shadow-[var(--shadow-md)]",
      )}
      aria-label="ניווט ראשי"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-[var(--color-sand-100)]">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-mint-500)] shadow-[var(--shadow-glow)]"
          aria-hidden="true"
        >
          <Zap size={20} strokeWidth={1.5} className="text-white" />
        </div>
        <div>
          <span
            className="block text-base font-bold text-[var(--color-sand-800)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            CashPulse
          </span>
          {companyName !== "CashPulse" && (
            <span className="block text-xs text-[var(--color-sand-400)] truncate max-w-[160px]">
              {companyName}
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1" aria-label="ניווט">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-[var(--radius-pill)]",
                "text-sm font-medium",
                "transition-all duration-[280ms]",
                "group relative",
                isActive
                  ? "bg-[var(--color-mint-50)] text-[var(--color-mint-600)] font-semibold"
                  : "text-[var(--color-sand-500)] hover:bg-[var(--color-sand-50)] hover:text-[var(--color-sand-700)]",
              )}
            >
              {isActive && (
                <span
                  className="absolute start-2 w-1 h-5 bg-[var(--color-mint-500)] rounded-full"
                  aria-hidden="true"
                />
              )}
              <item.icon
                size={18}
                strokeWidth={1.5}
                className={cn(
                  "flex-shrink-0 transition-colors",
                  isActive ? "text-[var(--color-mint-500)]" : "text-[var(--color-sand-400)] group-hover:text-[var(--color-sand-600)]",
                )}
              />
              <span>{item.label}</span>
              {item.isPro && (
                <span className="ms-auto text-xs px-2 py-0.5 rounded-full bg-[var(--color-lavender-100)] text-[var(--color-lavender-600)] font-medium">
                  Pro
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Plan badge */}
      <div className="px-4 pb-6">
        <div className="rounded-[var(--radius-md)] p-4 bg-[var(--color-mint-50)]">
          <p className="text-xs font-semibold text-[var(--color-mint-700)] mb-0.5">
            גרסה חינמית 🌱
          </p>
          <p className="text-xs text-[var(--color-mint-600)]">
            שדרג ל-Pro לדוחות מתקדמים
          </p>
        </div>
      </div>
    </aside>
  );
}
