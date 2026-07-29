import { makeId } from "@/lib/id";
import { matchNiches } from "../nicheKeywords";
import type { ProviderResult, RawFinding, ResearchProvider } from "../types";

/**
 * The one provider that can never be "unreachable": it reads only the
 * text the consultant actually pasted (the URL/handle itself). Every
 * finding here is a literal fact about the input, not an inference about
 * the creator — e.g. "the handle contains the word 'fit'" rather than
 * "this creator is a fitness coach".
 */
export const urlSignalProvider: ResearchProvider = {
  id: "url_signal",
  label: "Input URL / Handle",
  isLive: true,
  canHandle: () => true,
  async run(ctx): Promise<ProviderResult> {
    const findings: RawFinding[] = [];

    findings.push({
      field: "identity.handle",
      claim: `The pasted input resolves to the handle "${ctx.handle}".`,
      value: ctx.handle,
      confidence: "high",
    });

    findings.push({
      field: "identity.platformOfOrigin",
      claim: `The pasted link points to a ${ctx.detectedPlatform} page.`,
      value: ctx.detectedPlatform,
      confidence: "high",
    });

    const niches = matchNiches(ctx.handle, "the handle text");
    for (const m of niches) {
      findings.push({
        field: "positioning.nicheSignal",
        claim: `The word "${m.matchedTerm}" appears in ${m.inText} ("${ctx.handle}"), suggesting a ${m.niche} angle.`,
        value: m.niche,
        confidence: "medium",
      });
    }

    return {
      source: {
        id: makeId("src"),
        type: "url_signal",
        label: "Input URL / Handle",
        url: ctx.inputUrl,
        status: "fetched",
        retrievedAt: new Date().toISOString(),
      },
      findings,
    };
  },
};
