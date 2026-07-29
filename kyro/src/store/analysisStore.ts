import { create } from "zustand";
import type { PipelineEvent, PipelineOutput } from "@/types/domain";
import { runPipeline } from "@/engines/pipeline";

export type PipelineRunStatus = "idle" | "running" | "done" | "error";

interface AnalysisState {
  status: PipelineRunStatus;
  rawInput: string;
  events: PipelineEvent[];
  output: PipelineOutput | null;
  error: string | null;
  start: (rawInput: string, consultantNotes?: string) => Promise<void>;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  status: "idle",
  rawInput: "",
  events: [],
  output: null,
  error: null,

  start: async (rawInput, consultantNotes) => {
    set({ status: "running", rawInput, events: [], output: null, error: null });
    try {
      const output = await runPipeline({
        rawInput,
        consultantNotes,
        onEvent: (event) => set((s) => ({ events: [...s.events, event] })),
      });
      set({ status: "done", output });
    } catch (err) {
      set({ status: "error", error: err instanceof Error ? err.message : "Unexpected error during analysis." });
    }
  },

  reset: () => set({ status: "idle", rawInput: "", events: [], output: null, error: null }),
}));
