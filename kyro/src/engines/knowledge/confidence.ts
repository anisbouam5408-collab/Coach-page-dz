import type { ConfidenceLevel } from "@/types/domain";

const RANK: Record<ConfidenceLevel, number> = {
  verified: 4,
  high: 3,
  medium: 2,
  low: 1,
  unknown: 0,
};

export function higherConfidence(a: ConfidenceLevel, b: ConfidenceLevel): ConfidenceLevel {
  return RANK[a] >= RANK[b] ? a : b;
}

export function confidenceRank(level: ConfidenceLevel): number {
  return RANK[level];
}

/**
 * A single provider's finding never earns "verified" on its own — that
 * label is reserved for claims two or more independent sources agree on.
 */
export function resolveConfidence(baseConfidence: ConfidenceLevel, distinctSourceCount: number): ConfidenceLevel {
  if (distinctSourceCount >= 2) return "verified";
  return baseConfidence;
}

/** The overall confidence of a group of fields is only as strong as its weakest member. */
export function weakestConfidence(levels: ConfidenceLevel[]): ConfidenceLevel {
  if (levels.length === 0) return "unknown";
  return levels.reduce((weakest, level) => (RANK[level] < RANK[weakest] ? level : weakest), levels[0]);
}
