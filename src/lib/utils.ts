import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format currency in Israeli format: ₪12,500 */
export function formatCurrency(amount: number, currency = "ILS"): string {
  if (currency === "ILS") {
    return `₪${amount.toLocaleString("he-IL", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  return new Intl.NumberFormat("he-IL", { style: "currency", currency }).format(amount);
}

/** Format date as DD/MM/YYYY (Israeli format) */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Format date as relative Hebrew (e.g. "3 ימים") */
export function formatRelativeDays(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diff === 0) return "היום";
  if (diff === 1) return "מחר";
  if (diff === -1) return "אתמול";
  if (diff > 1) return `בעוד ${diff} ימים`;
  return `לפני ${Math.abs(diff)} ימים`;
}

/** Get greeting by time of day */
export function getTimeGreeting(name?: string): string {
  const hour = new Date().getHours();
  const nameStr = name ? `, ${name}` : "";
  if (hour < 12) return `בוקר טוב${nameStr} 👋`;
  if (hour < 17) return `צהריים טובים${nameStr} ☀️`;
  return `ערב טוב${nameStr} 🌙`;
}
