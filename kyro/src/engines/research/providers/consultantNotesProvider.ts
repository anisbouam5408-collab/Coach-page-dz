import { makeId } from "@/lib/id";
import { matchNiches } from "../nicheKeywords";
import type { ProviderResult, RawFinding, ResearchProvider } from "../types";

/**
 * Lets the consultant paste anything they already know to be true
 * (a bio they read, follower counts from a screenshot, a quote from an
 * interview). Treated as high-confidence, first-party evidence because a
 * human verified it directly — this is the fastest way to raise accuracy
 * without waiting on paid platform APIs.
 */
export const consultantNotesProvider: ResearchProvider = {
  id: "consultant_input",
  label: "Consultant-Provided Notes",
  isLive: true,
  canHandle: (ctx) => Boolean(ctx.consultantNotes && ctx.consultantNotes.trim().length > 0),
  async run(ctx): Promise<ProviderResult> {
    const notes = ctx.consultantNotes?.trim() ?? "";
    const findings: RawFinding[] = [
      {
        field: "consultant.rawNotes",
        claim: "Consultant supplied additional verified notes.",
        value: notes,
        confidence: "high",
      },
    ];

    for (const m of matchNiches(notes, "the consultant's notes")) {
      findings.push({
        field: "positioning.nicheSignal",
        claim: `The word "${m.matchedTerm}" appears in ${m.inText}, suggesting a ${m.niche} angle.`,
        value: m.niche,
        confidence: "high",
      });
    }

    const followerMatch = notes.match(/([\d.,]+\s?[kKmM]?)\s*(followers|subscribers|abonn[ée]s)/i);
    if (followerMatch) {
      findings.push({
        field: "audience.followerCountSignal",
        claim: `Consultant notes state a follower/subscriber count of "${followerMatch[1]}".`,
        value: followerMatch[1],
        confidence: "high",
      });
    }

    const priceMatches = notes.match(/[$€£]\s?\d[\d.,]*/g);
    if (priceMatches) {
      for (const price of priceMatches.slice(0, 5)) {
        findings.push({
          field: "monetization.priceSignal",
          claim: `Consultant notes mention a price point of "${price}".`,
          value: price,
          confidence: "high",
        });
      }
    }

    return {
      source: {
        id: makeId("src"),
        type: "consultant_input",
        label: "Consultant-Provided Notes",
        status: "fetched",
        retrievedAt: new Date().toISOString(),
      },
      findings,
    };
  },
};
