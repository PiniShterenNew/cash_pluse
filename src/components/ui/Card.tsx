import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type CardVariant = "float" | "sunken";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: ReactNode;
}

export function Card({ variant = "float", className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] transition-all duration-[280ms]",
        variant === "float" && [
          "bg-[var(--color-surface-card)]",
          "shadow-[var(--shadow-float)]",
          "hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]",
        ],
        variant === "sunken" && [
          "bg-[var(--color-surface-sunken)]",
          "shadow-[var(--shadow-inset)]",
        ],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn("p-6 pb-0", className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
}
