import type { AnalysisGap, AnalysisResult, KnowledgeBase, ReportSection } from "@/types/domain";
import { classifyOffer, isUsable } from "./thresholds";

const SUGGESTED_SOURCES_FOR_NICHE = [
  "Ask the consultant to paste a bio or short description in the notes field",
  "Provide the creator's official website or Linktree URL",
  "Connect the Instagram/TikTok/YouTube API to read their public bio",
];

function section(id: string, title: string, ready: boolean, citedEvidenceIds: string[], data: unknown, insufficientReason?: string): ReportSection {
  return {
    id,
    title,
    status: ready ? "ready" : "insufficient",
    citedEvidenceIds,
    insufficientReason,
    data: ready ? data : null,
  };
}

/**
 * The Analysis Engine only ever reads `KnowledgeBase.fields` /
 * `KnowledgeBase.evidence` — never raw provider output — and refuses to
 * produce a section when the backing field is unknown. If the creator's
 * niche itself can't be established, the whole run stops here rather
 * than continuing into speculative territory.
 */
export function analyzeCreator(kb: KnowledgeBase): AnalysisResult {
  const handleField = kb.fields["identity.handle"];
  const nicheField = kb.fields["positioning.niche"];

  if (!handleField || handleField.isUnknown || !nicheField || nicheField.isUnknown) {
    const gaps: AnalysisGap[] = [
      {
        field: "positioning.niche",
        reason: "No reachable source contained enough text to identify a niche or category for this creator.",
        suggestedSources: SUGGESTED_SOURCES_FOR_NICHE,
      },
    ];
    return {
      status: "blocked",
      knowledgeBase: kb,
      sections: [],
      gaps,
      blockReason:
        "The Research Engine could not verify enough public information to safely analyze this creator. Continuing would mean guessing — KYRO does not do that.",
    };
  }

  const sections: ReportSection[] = [];
  const gaps: AnalysisGap[] = [];

  // Creator Overview — always available once we get past the gate above.
  sections.push(
    section(
      "creator-overview",
      "Creator Overview",
      true,
      [...handleField.evidenceIds, ...nicheField.evidenceIds],
      {
        handle: kb.handle,
        detectedPlatform: kb.detectedPlatform,
        inputUrl: kb.inputUrl,
        coverageScore: kb.coverageScore,
        sourcesAttempted: kb.sources.length,
        sourcesReachable: kb.sources.filter((s) => s.status === "fetched" || s.status === "partial").length,
      },
    ),
  );

  // Brand Positioning
  const descField = kb.fields["brand.description"];
  sections.push(
    section(
      "brand-positioning",
      "Brand Positioning",
      true,
      [...nicheField.evidenceIds, ...(descField?.evidenceIds ?? [])],
      {
        niche: nicheField.value,
        nicheConfidence: nicheField.confidence,
        description: descField && !descField.isUnknown ? descField.value : null,
        descriptionConfidence: descField?.confidence ?? "unknown",
      },
    ),
  );
  if (!descField || descField.isUnknown) {
    gaps.push({
      field: "brand.description",
      reason: "No site title, meta description, or headline text was retrieved.",
      suggestedSources: ["Official website", "Linktree bio", "Consultant notes"],
    });
  }

  // Business Model / offers
  const offersField = kb.fields["ecosystem.offers"];
  const offers = Array.isArray(offersField?.value) ? (offersField.value as string[]) : [];
  const hasOffers = isUsable(offersField?.confidence ?? "unknown") && offers.length > 0;

  sections.push(
    section(
      "business-model",
      "Business Model",
      hasOffers,
      offersField?.evidenceIds ?? [],
      { offers },
      "No linked products, services, or offers were found on any reachable source (website or Linktree).",
    ),
  );

  const products = offers.filter((o) => classifyOffer(o) === "product");
  const services = offers.filter((o) => classifyOffer(o) === "service");

  sections.push(
    section(
      "digital-products",
      "Existing Digital Products",
      hasOffers && products.length > 0,
      offersField?.evidenceIds ?? [],
      { items: products },
      hasOffers
        ? "None of the discovered links matched product-style keywords (course, ebook, program, template...)."
        : "No offers were discovered at all — see Business Model gap.",
    ),
  );

  sections.push(
    section(
      "services",
      "Existing Services",
      hasOffers && services.length > 0,
      offersField?.evidenceIds ?? [],
      { items: services },
      hasOffers
        ? "None of the discovered links matched service-style keywords (coaching, consulting, session...)."
        : "No offers were discovered at all — see Business Model gap.",
    ),
  );

  if (!hasOffers) {
    gaps.push({
      field: "ecosystem.offers",
      reason: "No linked products, services, or offers were found.",
      suggestedSources: ["Official website", "Linktree", "Consultant notes describing current offers"],
    });
  }

  // Revenue Sources
  const priceField = kb.fields["monetization.pricing"];
  const prices = Array.isArray(priceField?.value) ? (priceField.value as string[]) : [];
  const hasPricing = isUsable(priceField?.confidence ?? "unknown") && prices.length > 0;
  sections.push(
    section(
      "revenue-sources",
      "Revenue Sources",
      hasPricing,
      priceField?.evidenceIds ?? [],
      { prices },
      "No pricing information was found on any reachable source. Public pages rarely list prices — ask the consultant to paste known pricing in the notes field.",
    ),
  );
  if (!hasPricing) {
    gaps.push({
      field: "monetization.pricing",
      reason: "No price points were found on any reachable source.",
      suggestedSources: ["Consultant notes (e.g. screenshots of pricing pages)", "Sales page URL"],
    });
  }

  // Audience Analysis
  const followerField = kb.fields["audience.followerCount"];
  const hasFollowerData = followerField ? !followerField.isUnknown : false;
  sections.push(
    section(
      "audience-analysis",
      "Audience Analysis",
      hasFollowerData,
      followerField?.evidenceIds ?? [],
      { followerCountSignal: followerField?.value ?? null, confidence: followerField?.confidence ?? "unknown" },
      "Follower count, demographics, and engagement rate require an authenticated platform API (Instagram/TikTok/YouTube) that isn't connected yet, or consultant-supplied notes.",
    ),
  );
  if (!hasFollowerData) {
    gaps.push({
      field: "audience.followerCount",
      reason: "No follower/subscriber count is available without a connected social API.",
      suggestedSources: ["Instagram Graph API", "TikTok API", "YouTube Data API", "Consultant notes"],
    });
  }

  // Content Analysis — never fabricated; genuinely requires a social API.
  sections.push(
    section(
      "content-analysis",
      "Content Analysis",
      false,
      [],
      null,
      "Posting cadence, formats, and recurring themes require pulling actual post history from a platform API, which isn't connected in this deployment.",
    ),
  );
  gaps.push({
    field: "content.history",
    reason: "No platform API is connected to retrieve post history.",
    suggestedSources: ["Instagram Graph API", "TikTok API", "YouTube Data API"],
  });

  const readySections = sections.filter((s) => s.status === "ready").length;
  const status: AnalysisResult["status"] = readySections >= 5 ? "complete" : readySections >= 2 ? "partial" : "blocked";

  if (status === "blocked") {
    return {
      status: "blocked",
      knowledgeBase: kb,
      sections,
      gaps,
      blockReason: "Too few verified fields were available to build a meaningful analysis beyond the creator's basic identity and niche.",
    };
  }

  return { status, knowledgeBase: kb, sections, gaps };
}
