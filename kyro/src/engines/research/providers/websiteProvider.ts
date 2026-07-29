import { makeId } from "@/lib/id";
import { fetchPublicHtml, parseHtml } from "../fetchUtils";
import { matchNiches } from "../nicheKeywords";
import type { ProviderResult, RawFinding, ResearchProvider } from "../types";

/**
 * Attempts a real, live fetch of the creator's official website.
 * If the browser can't reach it (CORS, offline, dead link) the source is
 * marked "unreachable" — the Knowledge Engine will treat every field it
 * would have populated as unknown rather than guessing.
 */
export const websiteProvider: ResearchProvider = {
  id: "website",
  label: "Official Website",
  isLive: true,
  canHandle: (ctx) => ctx.detectedPlatform === "website",
  async run(ctx): Promise<ProviderResult> {
    ctx.onProgress?.("Discovering official website...", ctx.inputUrl);
    const page = await fetchPublicHtml(ctx.inputUrl);

    if (!page.ok || !page.html) {
      return {
        source: {
          id: makeId("src"),
          type: "website",
          label: "Official Website",
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
        field: "brand.siteTitle",
        claim: `The site's <title> reads "${parsed.title}".`,
        value: parsed.title,
        confidence: "high",
      });
    }
    if (parsed.description) {
      findings.push({
        field: "brand.metaDescription",
        claim: `The site's meta description states: "${parsed.description}".`,
        value: parsed.description,
        confidence: "high",
      });
    }
    for (const h of parsed.headings.slice(0, 6)) {
      findings.push({
        field: "brand.headline",
        claim: `A headline on the site reads "${h}".`,
        value: h,
        confidence: "medium",
      });
    }

    const combinedText = [parsed.title, parsed.description, ...parsed.headings].filter(Boolean).join(" ");
    for (const m of matchNiches(combinedText, "the website copy")) {
      findings.push({
        field: "positioning.nicheSignal",
        claim: `The word "${m.matchedTerm}" appears in ${m.inText}, suggesting a ${m.niche} angle.`,
        value: m.niche,
        confidence: "medium",
      });
    }

    const productLinks = parsed.links.filter((l) =>
      /shop|store|course|program|book|coaching|product|buy/i.test(l.text + l.href),
    );
    for (const l of productLinks.slice(0, 8)) {
      findings.push({
        field: "products.linkedOffer",
        claim: `The site links to "${l.text}".`,
        value: l.text,
        confidence: "medium",
      });
    }

    if (findings.length === 0) {
      return {
        source: {
          id: makeId("src"),
          type: "website",
          label: "Official Website",
          url: ctx.inputUrl,
          status: "partial",
          statusNote: "Page was reachable but contained no extractable text (likely a JS-only app).",
          retrievedAt: new Date().toISOString(),
        },
        findings: [],
      };
    }

    return {
      source: {
        id: makeId("src"),
        type: "website",
        label: "Official Website",
        url: ctx.inputUrl,
        status: "fetched",
        retrievedAt: new Date().toISOString(),
      },
      findings,
    };
  },
};
