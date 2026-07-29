import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-[transform,box-shadow,filter] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inverse/30 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Primary: black pill, white text — deep cast shadow gives it real
        // presence against the light bg; a slow chrome shimmer drifts across
        // it at rest, and the shadow blooms into a soft halo on hover.
        default:
          "chrome-shine bg-inverse text-on-inverse shadow-inverse hover:shadow-[var(--shadow-inverse-hover)] hover:-translate-y-0.5 hover:brightness-125 active:translate-y-0 active:brightness-90",
        // Secondary: transparent, 1px --border, --text
        secondary: "border border-border bg-transparent text-text hover:bg-text/5 hover:border-text/30",
        ghost: "text-muted hover:text-text hover:bg-text/5",
        destructive: "bg-danger-strong text-on-inverse shadow-inverse hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:brightness-90",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
