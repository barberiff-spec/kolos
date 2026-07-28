import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-full shrink-0 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inverse/30 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Outlined circle on the page background — navbar/hero controls
        default: "border border-border bg-surface text-text hover:bg-surface-2",
        // Solid black circle — for emphasis (e.g. active state)
        inverse: "bg-inverse text-on-inverse hover:brightness-125",
        // No border/fill — inside an already-bordered container
        ghost: "text-muted hover:text-text hover:bg-text/5",
      },
      size: {
        default: "h-10 w-10",
        sm: "h-9 w-9",
        lg: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(iconButtonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
);
IconButton.displayName = "IconButton";

export { IconButton, iconButtonVariants };
