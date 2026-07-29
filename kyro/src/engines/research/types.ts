import type { Source, SourceType } from "@/types/domain";

/** A single unverified-until-cross-referenced observation from one provider. */
export interface RawFinding {
  field: string;
  claim: string;
  value?: string | number;
  /** Provider-local confidence, before the Knowledge Engine cross-references sources. */
  confidence: "high" | "medium" | "low";
}

export interface ProviderResult {
  source: Source;
  findings: RawFinding[];
}

export interface ResearchContext {
  inputUrl: string;
  handle: string;
  detectedPlatform: SourceType | "unknown";
  /** Optional consultant-supplied notes/text, treated as verified first-party evidence. */
  consultantNotes?: string;
  onProgress?: (message: string, detail?: string) => void;
}

/**
 * A research source behaves like a plugin: new providers are added by
 * implementing this interface and registering them in `registry.ts` —
 * nothing else in the pipeline needs to change.
 */
export interface ResearchProvider {
  id: SourceType;
  label: string;
  /** False = ships as a clearly-labeled simulation until a real API key/backend is wired in. */
  isLive: boolean;
  canHandle(ctx: ResearchContext): boolean;
  run(ctx: ResearchContext): Promise<ProviderResult>;
}
