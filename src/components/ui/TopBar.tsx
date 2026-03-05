"use client";

import { useState } from "react";
import { Search, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopBarProps {
  userInitials?: string;
  userName?: string;
}

export function TopBar({ userInitials = "מ", userName }: TopBarProps) {
  const [searchValue, setSearchValue] = useState("");

  return (
    <header
      className={cn(
        "sticky top-0 z-30",
        "h-16 px-6",
        "flex items-center gap-4",
        "bg-[var(--color-surface-base)]/80 backdrop-blur-md",
        "border-b border-[var(--color-sand-100)]",
      )}
    >
      {/* Search */}
      <div className="flex-1 max-w-sm">
        <label htmlFor="topbar-search" className="sr-only">
          חיפוש
        </label>
        <div className="relative">
          <Search
            size={16}
            strokeWidth={1.5}
            className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--color-sand-400)] pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="topbar-search"
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="חיפוש לקוח, חוב..."
            className={cn(
              "w-full ps-9 pe-4 py-2",
              "bg-[var(--color-surface-sunken)]",
              "rounded-[var(--radius-pill)]",
              "border border-[1.5px] border-transparent",
              "text-sm text-[var(--color-sand-700)]",
              "placeholder:text-[var(--color-sand-400)]",
              "focus:border-[var(--color-mint-400)] focus:ring-2 focus:ring-[var(--color-mint-400)]/20",
              "outline-none transition-all duration-[280ms]",
            )}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ms-auto">
        {/* Notifications */}
        <button
          className={cn(
            "relative flex items-center justify-center",
            "w-9 h-9 rounded-[var(--radius-pill)]",
            "text-[var(--color-sand-500)]",
            "hover:bg-[var(--color-sand-100)] hover:text-[var(--color-sand-700)]",
            "transition-all duration-[280ms]",
          )}
          aria-label="התראות"
        >
          <Bell size={18} strokeWidth={1.5} />
          {/* Notification dot */}
          <span
            className="absolute top-1.5 end-1.5 w-2 h-2 bg-[var(--color-rose-500)] rounded-full"
            aria-label="יש התראות חדשות"
          />
        </button>

        {/* Avatar */}
        <button
          className={cn(
            "flex items-center justify-center",
            "w-9 h-9 rounded-full",
            "bg-[var(--color-mint-500)] text-white",
            "text-sm font-semibold",
            "shadow-[var(--shadow-sm)]",
            "hover:-translate-y-px hover:shadow-[var(--shadow-glow)]",
            "transition-all duration-[280ms]",
          )}
          aria-label={userName ? `פרופיל — ${userName}` : "פרופיל"}
        >
          {userInitials}
        </button>
      </div>
    </header>
  );
}
