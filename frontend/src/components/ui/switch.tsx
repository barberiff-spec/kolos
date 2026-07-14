"use client";

import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function Switch({ checked, onCheckedChange, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
        checked ? "bg-accent" : "bg-border/30",
        className
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-text transition-transform duration-200",
          checked && "translate-x-5"
        )}
      />
    </button>
  );
}
