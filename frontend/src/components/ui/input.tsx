import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-text",
        "placeholder:text-muted focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/[0.15]",
        "transition-all duration-200 ease-out hover:border-accent/40",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
