import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const TONES = {
  neutral: "bg-surface-muted text-ink-muted border-border",
  brand: "bg-brand-50 text-brand-700 border-brand-100",
  amber: "bg-amber-400/15 text-amber-700 border-amber-400/30",
  rose: "bg-rose-500/10 text-rose-600 border-rose-500/25",
  sky: "bg-sky-500/10 text-sky-600 border-sky-500/25",
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof TONES }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
