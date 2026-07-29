// ─────────────────────────────────────────────────────────────────
// KYRO domain model.
//
// Everything downstream of the Research Engine is only ever allowed
// to see Evidence and KnowledgeFields — never raw provider output —
// so "the AI never analyzes before the Research Engine finishes",
// and every claim in the UI can be traced back to a Source.
// ─────────────────────────────────────────────────────────────────

export type SourceType =
  | "url_signal"
  | "website"
  | "linktree"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "facebook"
  | "linkedin"
  | "twitter"
  | "press_article"
  | "search_engine"
  | "consultant_input";

/** Whether a provider actually reached a source, or could not. */
export type SourceStatus = "fetched" | "partial" | "unreachable" | "not_connected";

export interface Source {
  id: string;
  type: SourceType;
  label: string;
  url?: string;
  status: SourceStatus;
  /** Why the source is only partial / unreachable / not connected — shown to the consultant. */
  statusNote?: string;
  retrievedAt: string;
}

/**
 * verified  — corroborated by 2+ independent reachable sources
 * high      — a single authoritative first-party source (the creator's own site/bio)
 * medium    — a single secondary source, or an inference from strong direct signal
 * low       — weak / indirect signal only
 * unknown   — no usable signal; field intentionally left empty
 */
export type ConfidenceLevel = "verified" | "high" | "medium" | "low" | "unknown";

export const CONFIDENCE_WEIGHT: Record<ConfidenceLevel, number> = {
  verified: 1,
  high: 0.8,
  medium: 0.55,
  low: 0.3,
  unknown: 0,
};

export interface Evidence {
  id: string;
  /** dot-path into the knowledge base, e.g. "positioning.niche" */
  field: string;
  claim: string;
  value?: string | number;
  sourceIds: string[];
  confidence: ConfidenceLevel;
  isAssumption: boolean;
}

export interface KnowledgeField<T = unknown> {
  value: T | null;
  confidence: ConfidenceLevel;
  evidenceIds: string[];
  isUnknown: boolean;
  note?: string;
}

export interface KnowledgeBase {
  inputUrl: string;
  detectedPlatform: SourceType | "unknown";
  handle: string;
  sources: Source[];
  evidence: Evidence[];
  fields: Record<string, KnowledgeField>;
  unknownFields: string[];
  overallConfidence: ConfidenceLevel;
  /** % of attempted sources that were actually reachable. Drives "accuracy over speed". */
  coverageScore: number;
  generatedAt: string;
}

export type AnalysisStatus = "complete" | "partial" | "blocked";

export interface AnalysisGap {
  field: string;
  reason: string;
  suggestedSources: string[];
}

export interface ReportSection {
  id: string;
  title: string;
  status: "ready" | "insufficient";
  /** Evidence ids this section's claims are derived from — the citation trail. */
  citedEvidenceIds: string[];
  insufficientReason?: string;
  data: unknown;
}

export interface AnalysisResult {
  status: AnalysisStatus;
  knowledgeBase: KnowledgeBase;
  sections: ReportSection[];
  gaps: AnalysisGap[];
  blockReason?: string;
}

export interface ProductConcept {
  id: string;
  title: string;
  description: string;
  format: string;
  priceRange: string;
  effort: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
  citedEvidenceIds: string[];
}

export interface PriorityMatrixItem {
  id: string;
  label: string;
  effort: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
  quadrant: "quick-win" | "major-bet" | "fill-in" | "reconsider";
}

export interface RoadmapPhase {
  id: string;
  title: string;
  window: string;
  goals: string[];
  actions: string[];
}

export interface SwotAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface CompetitorArchetype {
  archetype: string;
  description: string;
}

export interface CustomerJourneyStage {
  stage: string;
  description: string;
  touchpoint: string;
}

export interface ProposalResult {
  status: "generated" | "blocked";
  blockReason?: string;
  basis: "category-pattern" | "creator-specific";
  swot: SwotAnalysis;
  competitorSnapshot: CompetitorArchetype[];
  marketOpportunities: string[];
  monetizationOpportunities: string[];
  productEcosystem: string[];
  customerJourney: CustomerJourneyStage[];
  businessArchitecture: string[];
  productConcepts: ProductConcept[];
  priorityMatrix: PriorityMatrixItem[];
  roadmap: RoadmapPhase[];
  finalRecommendation: string;
}

export type PipelineStageName = "research" | "knowledge" | "analysis" | "proposal";

export interface PipelineEvent {
  stage: PipelineStageName;
  label: string;
  detail?: string;
  progress: number;
  done?: boolean;
  timestamp: number;
}

export interface PipelineOutput {
  knowledgeBase: KnowledgeBase;
  analysis: AnalysisResult;
  proposal: ProposalResult | null;
}
