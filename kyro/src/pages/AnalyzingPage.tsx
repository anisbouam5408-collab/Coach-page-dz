import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";
import { useAnalysisStore } from "@/store/analysisStore";

const STAGE_LABELS: Record<string, string> = {
  research: "Research Engine",
  knowledge: "Knowledge Engine",
  analysis: "Analysis Engine",
  proposal: "Proposal Engine",
};

const STAGE_ORDER = ["research", "knowledge", "analysis", "proposal"];

export function AnalyzingPage() {
  const navigate = useNavigate();
  const { status, events, rawInput } = useAnalysisStore();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (rawInput === "" && status === "idle") {
      navigate("/", { replace: true });
      return;
    }
    if ((status === "done" || status === "error") && !hasRedirected.current) {
      hasRedirected.current = true;
      const t = setTimeout(() => navigate("/report", { replace: true }), 900);
      return () => clearTimeout(t);
    }
  }, [status, rawInput, navigate]);

  const latest = events[events.length - 1];
  const progress = latest?.progress ?? 5;
  const currentStage = latest?.stage ?? "research";

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "radial-gradient(50% 50% at 50% 40%, rgba(139,92,246,0.16), transparent)" }}
      />

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="mb-8 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-400 shadow-[0_0_60px_-10px_rgba(139,92,246,0.7)]"
      >
        <Sparkles className="size-7 text-white" />
      </motion.div>

      <h1 className="text-center text-2xl font-semibold text-ink md:text-3xl">
        Analyzing <span className="text-gradient">{rawInput}</span>
      </h1>

      <div className="mt-3 flex items-center gap-2 text-sm text-ink-faint">
        {(["research", "knowledge", "analysis", "proposal"] as const).map((stage, i) => (
          <span key={stage} className="flex items-center gap-2">
            <span className={stage === currentStage ? "text-violet-300" : STAGE_ORDER.indexOf(currentStage) > i ? "text-emerald-400" : ""}>
              {STAGE_LABELS[stage]}
            </span>
            {i < 3 && <span className="text-ink-faint/40">→</span>}
          </span>
        ))}
      </div>

      <div className="mt-10 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-white/5">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400"
          animate={{ width: `${progress}%` }}
          transition={{ ease: "easeOut", duration: 0.4 }}
        />
      </div>

      <div className="mt-8 flex w-full max-w-md flex-col gap-2.5">
        <AnimatePresence initial={false}>
          {events
            .slice(-6)
            .reverse()
            .map((event, idx) => (
              <motion.div
                key={`${event.timestamp}-${event.label}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: idx === 0 ? 1 : 0.45, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2.5 text-sm"
              >
                {idx === 0 ? (
                  <Loader2 className="size-3.5 shrink-0 animate-spin text-violet-300" />
                ) : (
                  <Check className="size-3.5 shrink-0 text-emerald-400" />
                )}
                <span className={idx === 0 ? "text-ink" : "text-ink-faint"}>{event.label}</span>
                {event.detail && idx === 0 && <span className="truncate text-xs text-ink-faint">{event.detail}</span>}
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
