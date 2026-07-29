import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-b from-violet-500 to-violet-600 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.2)_inset,0_8px_24px_-8px_rgba(139,92,246,0.6)] hover:brightness-110 active:brightness-95",
        secondary: "glass text-ink hover:bg-surface-hover hover:border-border-strong",
        ghost: "text-ink-muted hover:text-ink hover:bg-white/5",
        outline: "border border-border-strong text-ink hover:bg-white/5",
      },
      size: {
        sm: "h-8 px-3.5 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-14 px-8 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
));
Button.displayName = "Button";
