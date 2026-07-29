import { makeId } from "@/lib/id";
import type { ConfidenceLevel, Evidence, KnowledgeBase, KnowledgeField, Source } from "@/types/domain";
import type { ResearchOutput } from "../research/orchestrator";
import { higherConfidence, resolveConfidence, weakestConfidence } from "./confidence";
import { REQUIRED_FIELDS } from "./requiredFields";

function distinctSourceIds(items: Evidence[]): Set<string> {
  return new Set(items.flatMap((e) => e.sourceIds));
}

function groupByValue(items: Evidence[]): Map<string, Evidence[]> {
  const groups = new Map<string, Evidence[]>();
  for (const e of items) {
    const key = String(e.value ?? "").trim().toLowerCase();
    if (!key) continue;
    const bucket = groups.get(key) ?? [];
    bucket.push(e);
    groups.set(key, bucket);
  }
  return groups;
}

/**
 * The Knowledge Engine: turns raw, per-source Research Engine findings
 * into a KnowledgeBase where every field is explicitly a Fact (backed by
 * evidence + confidence), an Assumption (flagged as such), or an Unknown
 * — never a silent guess.
 */
export function buildKnowledgeBase(research: ResearchOutput): KnowledgeBase {
  const sources: Source[] = research.results.map((r) => r.source);

  const evidence: Evidence[] = research.results.flatMap((result) =>
    result.findings.map((finding) => ({
      id: makeId("ev"),
      field: finding.field,
      claim: finding.claim,
      value: finding.value,
      sourceIds: [result.source.id],
      confidence: finding.confidence,
      isAssumption: finding.field === "positioning.nicheSignal",
    })),
  );

  const fields: Record<string, KnowledgeField> = {};
  const unknownFields: string[] = [];

  for (const rf of REQUIRED_FIELDS) {
    const matching = evidence.filter((e) => rf.sourceFieldPatterns.includes(e.field));

    if (matching.length === 0) {
      fields[rf.key] = {
        value: null,
        confidence: "unknown",
        evidenceIds: [],
        isUnknown: true,
        note: `No reachable source produced this field.`,
      };
      unknownFields.push(rf.key);
      continue;
    }

    if (rf.kind === "list") {
      const groups = groupByValue(matching);
      const values = Array.from(groups.values()).map((evs) => evs[0].value);
      const baseConfidence = matching.reduce((acc, e) => higherConfidence(acc, e.confidence), "unknown" as ConfidenceLevel);
      const confidence = resolveConfidence(baseConfidence, distinctSourceIds(matching).size);
      fields[rf.key] = {
        value: values,
        confidence,
        evidenceIds: matching.map((e) => e.id),
        isUnknown: false,
      };
      continue;
    }

    const groups = Array.from(groupByValue(matching).values());
    const winningGroup = groups.reduce((best, group) => {
      if (best.length === 0) return group;
      const bestSources = distinctSourceIds(best).size;
      const groupSources = distinctSourceIds(group).size;
      if (groupSources > bestSources) return group;
      if (groupSources === bestSources && group.length > best.length) return group;
      return best;
    }, [] as Evidence[]);

    const baseConfidence = winningGroup.reduce((acc, e) => higherConfidence(acc, e.confidence), "unknown" as ConfidenceLevel);
    const confidence = resolveConfidence(baseConfidence, distinctSourceIds(winningGroup).size);

    fields[rf.key] = {
      value: winningGroup[0]?.value ?? null,
      confidence,
      evidenceIds: winningGroup.map((e) => e.id),
      isUnknown: false,
      note: confidence === "low" ? "Only weak/indirect signal available — verify manually before relying on this." : undefined,
    };
  }

  const reachableSources = sources.filter((s) => s.status === "fetched" || s.status === "partial");
  const coverageScore = sources.length > 0 ? Math.round((reachableSources.length / sources.length) * 100) : 0;

  const criticalFields = REQUIRED_FIELDS.filter((rf) => rf.critical).map((rf) => fields[rf.key]);
  const overallConfidence = weakestConfidence(criticalFields.map((f) => f.confidence));

  return {
    inputUrl: research.inputUrl,
    detectedPlatform: research.detectedPlatform,
    handle: research.handle,
    sources,
    evidence,
    fields,
    unknownFields,
    overallConfidence,
    coverageScore,
    generatedAt: new Date().toISOString(),
  };
}
