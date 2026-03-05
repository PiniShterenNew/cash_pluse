import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, width, height, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("shimmer rounded-[var(--radius-sm)]", className)}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={16}
          style={{ width: i === lines - 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "p-6 rounded-[var(--radius-md)] bg-[var(--color-surface-card)] shadow-[var(--shadow-float)]",
        className,
      )}
      aria-hidden="true"
    >
      <div className="flex items-start justify-between mb-4">
        <Skeleton width={120} height={20} />
        <Skeleton width={48} height={48} className="rounded-full" />
      </div>
      <Skeleton width={160} height={36} className="mb-2" />
      <Skeleton width={80} height={16} />
    </div>
  );
}
