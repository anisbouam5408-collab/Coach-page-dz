import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAnalysisStore } from "@/store/analysisStore";
import { listSavedProjects } from "@/engines/export/exportEngine";

export function HomePage() {
  const navigate = useNavigate();
  const start = useAnalysisStore((s) => s.start);
  const [input, setInput] = useState("");
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const recentProjects = listSavedProjects().slice(0, 3);

  function handleAnalyze() {
    if (!input.trim()) return;
    void start(input.trim(), notes.trim() || undefined);
    navigate("/analyzing");
  }

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(139,92,246,0.18), transparent), radial-gradient(40% 40% at 85% 20%, rgba(232,121,249,0.10), transparent)",
        }}
      />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-400">
            <Sparkles className="size-4 text-canvas" />
          </div>
          <span className="text-sm font-semibold tracking-wide text-ink">KYRO</span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-ink-muted">
          <a href="#how-it-works" className="transition-colors hover:text-ink">
            How it works
          </a>
          <a href="#engines" className="transition-colors hover:text-ink">
            Engines
          </a>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-strong bg-white/5 px-3.5 py-1.5 text-xs font-medium text-ink-muted">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Evidence-based creator intelligence
          </span>
          <h1 className="text-5xl font-semibold tracking-tight text-balance md:text-7xl">
            Understand any creator
            <br />
            <span className="text-gradient font-display italic">in minutes, not hours.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
            Paste one public link. KYRO researches, verifies, and builds a strategy — and tells you
            plainly when it can't confirm something instead of guessing.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 w-full"
        >
          <div className="glass flex flex-col gap-2 rounded-2xl p-2 shadow-2xl md:flex-row md:items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              placeholder="Paste an Instagram, Website, Linktree or Creator URL..."
              className="h-14 w-full shrink-0 rounded-xl bg-transparent px-5 text-base text-ink placeholder:text-ink-faint focus:outline-none md:w-auto md:flex-1"
            />
            <Button size="lg" onClick={handleAnalyze} disabled={!input.trim()} className="shrink-0">
              Analyze Creator
              <ArrowRight className="size-4" />
            </Button>
          </div>

          <button
            onClick={() => setNotesOpen((v) => !v)}
            className="mx-auto mt-4 flex items-center gap-1.5 text-sm text-ink-faint transition-colors hover:text-ink-muted"
          >
            <Plus className={`size-3.5 transition-transform ${notesOpen ? "rotate-45" : ""}`} />
            Add known details to improve accuracy (optional)
          </button>

          {notesOpen && (
            <motion.textarea
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 125K followers on Instagram, sells a $297 coaching program, was interviewed on The Growth Podcast..."
              className="glass mt-3 w-full resize-none rounded-2xl p-4 text-sm text-ink placeholder:text-ink-faint focus:outline-none"
              rows={3}
            />
          )}
        </motion.div>

        {recentProjects.length > 0 && (
          <div className="mt-14 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-ink-faint">Recent:</span>
            {recentProjects.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`/report/${p.id}`)}
                className="rounded-full border border-border px-3 py-1 text-xs text-ink-muted transition-colors hover:border-border-strong hover:text-ink"
              >
                {p.handle}
              </button>
            ))}
          </div>
        )}
      </main>

      <section id="engines" className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-4 px-6 pb-24 md:grid-cols-4">
        {[
          { name: "Research Engine", desc: "Collects public evidence from every reachable source." },
          { name: "Knowledge Engine", desc: "Separates fact, assumption, and unknown — with confidence scores." },
          { name: "Analysis Engine", desc: "Only reasons over verified evidence. Stops when data is thin." },
          { name: "Proposal Engine", desc: "Builds recommendations strictly from what was verified." },
        ].map((engine) => (
          <div key={engine.name} className="glass rounded-2xl p-5 text-left">
            <p className="text-sm font-medium text-ink">{engine.name}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-faint">{engine.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
