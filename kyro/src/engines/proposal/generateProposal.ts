import { makeId } from "@/lib/id";
import type {
  AnalysisResult,
  CompetitorArchetype,
  CustomerJourneyStage,
  PriorityMatrixItem,
  ProductConcept,
  ProposalResult,
  RoadmapPhase,
  SwotAnalysis,
} from "@/types/domain";
import { classifyOffer } from "../analysis/thresholds";
import { getPlaybook, type NichePlaybook } from "../analysis/nichePlaybooks";

function emptyProposal(blockReason: string): ProposalResult {
  return {
    status: "blocked",
    blockReason,
    basis: "category-pattern",
    swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
    competitorSnapshot: [],
    marketOpportunities: [],
    monetizationOpportunities: [],
    productEcosystem: [],
    customerJourney: [],
    businessArchitecture: [],
    productConcepts: [],
    priorityMatrix: [],
    roadmap: [],
    finalRecommendation: "",
  };
}

function effortFor(format: string): "low" | "medium" | "high" {
  const kind = classifyOffer(format);
  if (kind === "service") return "high";
  if (/course|program|membership|app/i.test(format)) return "medium";
  return "low";
}

function impactFor(format: string, painPointIndex: number): "low" | "medium" | "high" {
  if (painPointIndex === 0) return "high";
  return classifyOffer(format) === "service" ? "high" : "medium";
}

function quadrantFor(effort: "low" | "medium" | "high", impact: "low" | "medium" | "high"): PriorityMatrixItem["quadrant"] {
  if (impact === "high" && effort !== "high") return "quick-win";
  if (impact === "high" && effort === "high") return "major-bet";
  if (impact !== "high" && effort !== "high") return "fill-in";
  return "reconsider";
}

function buildSwot(
  playbook: NichePlaybook,
  nicheConfidence: string,
  offers: string[],
  hasPricing: boolean,
  hasAudienceData: boolean,
  coverageScore: number,
): SwotAnalysis {
  const strengths: string[] = [];
  if (nicheConfidence === "verified" || nicheConfidence === "high") {
    strengths.push(`Clear, corroborated positioning in the ${playbook.label} category.`);
  } else {
    strengths.push(`Some signal of a ${playbook.label} positioning, though not yet strongly corroborated.`);
  }
  if (offers.length > 0) {
    strengths.push(`Already operating an offer ecosystem (${offers.length} linked product/service${offers.length > 1 ? "s" : ""} found).`);
  }
  if (coverageScore >= 50) {
    strengths.push("Reasonable public discoverability — most attempted sources were reachable.");
  }

  const weaknesses: string[] = [];
  if (offers.length === 0) {
    weaknesses.push("No discoverable monetized offer — website/Linktree do not link to a paid product or service.");
  }
  if (!hasPricing) {
    weaknesses.push("No public pricing information, making willingness-to-pay unverified.");
  }
  if (!hasAudienceData) {
    weaknesses.push("No verified audience size/engagement data — social APIs are not connected in this deployment.");
  }
  weaknesses.push("Content history and posting cadence could not be analyzed without a connected platform API.");

  const opportunities = playbook.productFormats
    .filter((pf) => !offers.some((o) => classifyOffer(o) === classifyOffer(pf.format)))
    .map((pf) => `Introduce a ${pf.format.toLowerCase()} (${pf.priceRange}) — a common gap for creators in this category.`);

  const threats = playbook.competitorArchetypes.map(
    (archetype) => `Competitive pressure from ${archetype.toLowerCase()} already serving ${playbook.audienceHint}.`,
  );

  return { strengths, weaknesses, opportunities: opportunities.length ? opportunities : ["No clear gap identified from available data."], threats };
}

function buildProductConcepts(playbook: NichePlaybook, nicheEvidenceIds: string[], offerEvidenceIds: string[]): ProductConcept[] {
  const concepts: ProductConcept[] = [];
  outer: for (const painPoint of playbook.painPoints) {
    for (const pf of playbook.productFormats) {
      if (concepts.length >= 10) break outer;
      const effort = effortFor(pf.format);
      const impact = impactFor(pf.format, playbook.painPoints.indexOf(painPoint));
      concepts.push({
        id: makeId("concept"),
        title: `${pf.format} — ${painPoint}`,
        description: `A ${pf.format.toLowerCase()} (e.g. "${pf.example}") aimed at solving "${painPoint.toLowerCase()}" for ${playbook.audienceHint}.`,
        format: pf.format,
        priceRange: pf.priceRange,
        effort,
        impact,
        citedEvidenceIds: [...nicheEvidenceIds, ...offerEvidenceIds],
      });
    }
  }
  return concepts.slice(0, 10);
}

function buildRoadmap(concepts: ProductConcept[], priorityMatrix: PriorityMatrixItem[]): RoadmapPhase[] {
  const quickWins = priorityMatrix.filter((p) => p.quadrant === "quick-win").map((p) => p.label);
  const majorBets = priorityMatrix.filter((p) => p.quadrant === "major-bet").map((p) => p.label);
  void concepts;

  return [
    {
      id: makeId("phase"),
      title: "Phase 1 — Foundation",
      window: "Days 1–30",
      goals: ["Validate positioning with the audience", "Ship the lowest-effort, highest-impact offer"],
      actions: quickWins.slice(0, 2).length
        ? quickWins.slice(0, 2).map((label) => `Launch: ${label}`)
        : ["Confirm niche positioning with direct audience research before building anything new."],
    },
    {
      id: makeId("phase"),
      title: "Phase 2 — Core Offer Build",
      window: "Days 31–60",
      goals: ["Build the primary revenue-driving offer", "Instrument pricing/demand feedback"],
      actions: majorBets.slice(0, 2).length
        ? majorBets.slice(0, 2).map((label) => `Design and pre-sell: ${label}`)
        : ["Design a core offer once quick-win data confirms demand."],
    },
    {
      id: makeId("phase"),
      title: "Phase 3 — Scale & Retain",
      window: "Days 61–90",
      goals: ["Introduce a recurring/retention product", "Formalize the customer journey end to end"],
      actions: ["Layer in a membership/community offer for retention.", "Review 90-day data and re-run KYRO analysis with updated evidence."],
    },
  ];
}

/**
 * The Proposal Engine only runs after Analysis has succeeded, and only
 * ever uses the niche's category playbook plus whatever offers/pricing
 * the Knowledge Base actually verified — it never invents named
 * competitors, revenue figures, or audience data.
 */
export function generateProposal(analysis: AnalysisResult): ProposalResult {
  if (analysis.status === "blocked") {
    return emptyProposal(`Analysis was blocked, so no proposal can be generated: ${analysis.blockReason ?? "insufficient evidence."}`);
  }

  const kb = analysis.knowledgeBase;
  const nicheField = kb.fields["positioning.niche"];
  const nicheKey = typeof nicheField?.value === "string" ? nicheField.value : null;
  const playbook = getPlaybook(nicheKey);

  if (!playbook) {
    return emptyProposal("No niche/category playbook could be matched — cannot safely generate recommendations.");
  }

  const businessSection = analysis.sections.find((s) => s.id === "business-model");
  const revenueSection = analysis.sections.find((s) => s.id === "revenue-sources");
  const audienceSection = analysis.sections.find((s) => s.id === "audience-analysis");

  const offers = businessSection?.status === "ready" ? ((businessSection.data as { offers: string[] }).offers ?? []) : [];
  const hasPricing = revenueSection?.status === "ready";
  const hasAudienceData = audienceSection?.status === "ready";
  const offerEvidenceIds = businessSection?.citedEvidenceIds ?? [];
  const nicheEvidenceIds = nicheField?.evidenceIds ?? [];

  const swot = buildSwot(playbook, nicheField?.confidence ?? "unknown", offers, hasPricing, hasAudienceData, kb.coverageScore);

  const competitorSnapshot: CompetitorArchetype[] = playbook.competitorArchetypes.map((archetype) => ({
    archetype,
    description: "A recurring competitive pattern in this category — verify named, specific competitors manually before citing them to the client.",
  }));

  const marketOpportunities = playbook.painPoints.map(
    (p) => `"${p}" remains a common underserved need for ${playbook.audienceHint}.`,
  );

  const monetizationOpportunities = playbook.productFormats
    .filter((pf) => !offers.some((o) => classifyOffer(o) === classifyOffer(pf.format)))
    .map((pf) => `${pf.format} (${pf.priceRange}) — not currently offered.`);

  const productEcosystem = [
    ...offers.map((o) => `[Existing] ${o}`),
    ...playbook.productFormats
      .filter((pf) => !offers.some((o) => classifyOffer(o) === classifyOffer(pf.format)))
      .map((pf) => `[Opportunity] ${pf.format}`),
  ];

  const cheapestFormat = [...playbook.productFormats].sort((a, b) => a.priceRange.length - b.priceRange.length)[0];
  const customerJourney: CustomerJourneyStage[] = [
    { stage: "Awareness", description: `Discovery through ${playbook.channels[0] ?? "primary content channel"}.`, touchpoint: playbook.contentPillars[0] ?? "Core content" },
    { stage: "Engagement", description: "Consistent value-driven content builds trust.", touchpoint: playbook.contentPillars.slice(1, 3).join(", ") || "Content pillars" },
    { stage: "Conversion", description: `Low-friction entry offer.`, touchpoint: cheapestFormat ? `${cheapestFormat.format} (${cheapestFormat.priceRange})` : "Entry offer" },
    { stage: "Retention", description: "Recurring touchpoint keeps customers engaged.", touchpoint: playbook.productFormats.find((pf) => /membership|community/i.test(pf.format))?.format ?? "Community / membership" },
  ];

  const businessArchitecture = [
    `Front-of-funnel: ${playbook.channels.join(", ")}.`,
    `Lead-in offer: ${cheapestFormat ? `${cheapestFormat.format} (${cheapestFormat.priceRange})` : "low-cost digital product"}.`,
    `Core revenue offer: ${playbook.productFormats.find((pf) => classifyOffer(pf.format) !== "other")?.format ?? "primary paid offer"}.`,
    `Retention layer: recurring membership/community to compound customer lifetime value.`,
  ];

  const productConcepts = buildProductConcepts(playbook, nicheEvidenceIds, offerEvidenceIds);

  const priorityMatrix: PriorityMatrixItem[] = productConcepts.map((c) => ({
    id: makeId("pm"),
    label: c.title,
    effort: c.effort,
    impact: c.impact,
    quadrant: quadrantFor(c.effort, c.impact),
  }));

  const roadmap = buildRoadmap(productConcepts, priorityMatrix);

  const basis: ProposalResult["basis"] = offers.length > 0 || hasPricing ? "creator-specific" : "category-pattern";

  const finalRecommendation =
    basis === "creator-specific"
      ? `Verified evidence places this creator in the ${playbook.label} category with an existing offer ecosystem. Prioritize the quick-win concepts below before investing in the major bets, and revisit this analysis once pricing/audience data is more complete.`
      : `Only the niche (${playbook.label}) could be confidently verified from public sources — no existing offers or pricing were found. The recommendations below follow proven category patterns rather than this specific creator's data. Treat them as a starting hypothesis: validate with the creator directly, then re-run KYRO with consultant notes or connected social APIs for a creator-specific plan.`;

  return {
    status: "generated",
    basis,
    swot,
    competitorSnapshot,
    marketOpportunities,
    monetizationOpportunities,
    productEcosystem,
    customerJourney,
    businessArchitecture,
    productConcepts,
    priorityMatrix,
    roadmap,
    finalRecommendation,
  };
}
