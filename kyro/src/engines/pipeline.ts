import type { PipelineEvent, PipelineOutput } from "@/types/domain";
import { runResearch } from "./research/orchestrator";
import { buildKnowledgeBase } from "./knowledge/buildKnowledgeBase";
import { analyzeCreator } from "./analysis/analyzeCreator";
import { generateProposal } from "./proposal/generateProposal";

export interface RunPipelineInput {
  rawInput: string;
  consultantNotes?: string;
  onEvent?: (event: PipelineEvent) => void;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * The only orchestrator allowed to call all four engines in sequence.
 * Each stage's output is the only input the next stage receives — the
 * Analysis Engine never sees raw research, and the Proposal Engine never
 * sees raw research or the knowledge base directly. This is what
 * enforces "the AI never analyzes before the Research Engine finishes."
 *
 * The short waits between stages are pure UX pacing (real providers can
 * resolve in milliseconds) — they make the four-engine pipeline visible
 * to the consultant rather than a single instant flash.
 */
export async function runPipeline({ rawInput, consultantNotes, onEvent }: RunPipelineInput): Promise<PipelineOutput> {
  const emit = async (label: string, progress: number, detail?: string) => {
    onEvent?.({ stage: progressToStage(progress), label, detail, progress, timestamp: Date.now() });
    await wait(320);
  };

  await emit("Discovering creator...", 5);

  const research = await runResearch({
    rawInput,
    consultantNotes,
    onProgress: (message, detail) => emit(message, 10 + Math.random() * 35, detail),
  });

  await emit("Building knowledge base...", 55, `${research.results.length} sources attempted`);
  const knowledgeBase = buildKnowledgeBase(research);

  await emit("Cross-referencing sources for confidence...", 68);

  await emit("Generating strategic analysis...", 78);
  const analysis = analyzeCreator(knowledgeBase);

  if (analysis.status === "blocked") {
    await emit("Analysis halted — insufficient verified evidence.", 100, analysis.blockReason);
    return { knowledgeBase, analysis, proposal: null };
  }

  await emit("Designing ecosystem & recommendations...", 90);
  const proposal = generateProposal(analysis);

  await emit("Done.", 100);
  return { knowledgeBase, analysis, proposal };
}

function progressToStage(progress: number): PipelineEvent["stage"] {
  if (progress < 55) return "research";
  if (progress < 75) return "knowledge";
  if (progress < 88) return "analysis";
  return "proposal";
}
