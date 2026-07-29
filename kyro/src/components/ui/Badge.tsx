import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const TONES = {
  neutral: "bg-white/5 text-ink-muted border-border",
  violet: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  emerald: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  amber: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  rose: "bg-rose-400/15 text-rose-300 border-rose-400/30",
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof TONES }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
