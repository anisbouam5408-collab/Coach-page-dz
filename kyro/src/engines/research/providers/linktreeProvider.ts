import { makeId } from "@/lib/id";
import { fetchPublicHtml, parseHtml } from "../fetchUtils";
import { matchNiches } from "../nicheKeywords";
import type { ProviderResult, RawFinding, ResearchProvider } from "../types";

/**
 * Linktree (and equivalents like Beacons, Koji, Stan Store) pages are a
 * curated list of everything the creator wants a visitor to click —
 * which makes them one of the highest-signal, lowest-effort sources for
 * mapping the existing product/service ecosystem.
 */
export const linktreeProvider: ResearchProvider = {
  id: "linktree",
  label: "Linktree",
  isLive: true,
  canHandle: (ctx) => ctx.detectedPlatform === "linktree",
  async run(ctx): Promise<ProviderResult> {
    ctx.onProgress?.("Reading Linktree...", ctx.inputUrl);
    const page = await fetchPublicHtml(ctx.inputUrl);

    if (!page.ok || !page.html) {
      return {
        source: {
          id: makeId("src"),
          type: "linktree",
          label: "Linktree",
          url: ctx.inputUrl,
          status: "unreachable",
          statusNote: page.reason ?? "Could not retrieve the page.",
          retrievedAt: new Date().toISOString(),
        },
        findings: [],
      };
    }

    const parsed = parseHtml(page.html);
    const findings: RawFinding[] = [];

    if (parsed.title) {
      findings.push({
        field: "identity.displayName",
        claim: `The Linktree page title is "${parsed.title}".`,
        value: parsed.title,
        confidence: "high",
      });
    }

    const outboundLinks = parsed.links.filter((l) => !/linktr\.ee/i.test(l.href));
    for (const l of outboundLinks) {
      findings.push({
        field: "ecosystem.linkedProperty",
        claim: `The Linktree links out to "${l.text}" (${l.href}).`,
        value: l.href,
        confidence: "high",
      });
    }

    const combinedText = [parsed.title, ...outboundLinks.map((l) => l.text)].join(" ");
    for (const m of matchNiches(combinedText, "the Linktree links")) {
      findings.push({
        field: "positioning.nicheSignal",
        claim: `The word "${m.matchedTerm}" appears in ${m.inText}, suggesting a ${m.niche} angle.`,
        value: m.niche,
        confidence: "medium",
      });
    }

    return {
      source: {
        id: makeId("src"),
        type: "linktree",
        label: "Linktree",
        url: ctx.inputUrl,
        status: outboundLinks.length > 0 ? "fetched" : "partial",
        statusNote: outboundLinks.length === 0 ? "Page reachable but no outbound links found." : undefined,
        retrievedAt: new Date().toISOString(),
      },
      findings,
    };
  },
};
