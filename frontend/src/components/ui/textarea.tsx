import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex min-h-[100px] w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text",
      "placeholder:text-muted focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/[0.15]",
      "transition-all duration-200 ease-out hover:border-accent/40",
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
