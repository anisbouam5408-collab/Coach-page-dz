import { RESEARCH_PROVIDERS } from "./registry";
import { detectInput } from "./urlDetection";
import type { ProviderResult, ResearchContext } from "./types";

export interface RunResearchInput {
  rawInput: string;
  consultantNotes?: string;
  onProgress?: (message: string, detail?: string) => void;
}

export interface ResearchOutput {
  inputUrl: string;
  handle: string;
  detectedPlatform: ResearchContext["detectedPlatform"];
  results: ProviderResult[];
}

/**
 * The Research Engine's only job: collect raw, source-attributed
 * findings from every applicable provider. It never interprets or
 * scores them — that's the Knowledge Engine's job — which is what lets
 * "the AI never analyze before the Research Engine finishes".
 */
export async function runResearch({ rawInput, consultantNotes, onProgress }: RunResearchInput): Promise<ResearchOutput> {
  const detected = detectInput(rawInput);

  const ctx: ResearchContext = {
    inputUrl: detected.normalizedUrl,
    handle: detected.handle,
    detectedPlatform: detected.platform,
    consultantNotes,
    onProgress,
  };

  onProgress?.("Discovering creator...", `Resolved input to "${detected.handle}"`);

  const applicable = RESEARCH_PROVIDERS.filter((p) => p.canHandle(ctx));

  const results = await Promise.all(
    applicable.map(async (provider) => {
      try {
        return await provider.run(ctx);
      } catch (err) {
        return {
          source: {
            id: `src_error_${provider.id}`,
            type: provider.id,
            label: provider.label,
            status: "unreachable" as const,
            statusNote: err instanceof Error ? err.message : "Unexpected provider error.",
            retrievedAt: new Date().toISOString(),
          },
          findings: [],
        };
      }
    }),
  );

  return {
    inputUrl: detected.normalizedUrl,
    handle: detected.handle,
    detectedPlatform: detected.platform,
    results,
  };
}
