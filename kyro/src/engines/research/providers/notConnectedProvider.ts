import { makeId } from "@/lib/id";
import type { SourceType } from "@/types/domain";
import type { ProviderResult, ResearchProvider } from "../types";

/**
 * Factory for platforms that require an official API/credential KYRO
 * doesn't have wired up yet (Instagram Graph API, TikTok API, YouTube
 * Data API, LinkedIn, X/Twitter, a search-index API, press/PR archives...).
 *
 * These still register as attempted sources — visible in the Research
 * Coverage report — but return zero findings and an explicit
 * "not_connected" status. This is the load-bearing guarantee against
 * hallucination: a plugin either has real data, or it says so plainly.
 * Wiring up the real API later means writing one provider that matches
 * this same interface and swapping it in — nothing else changes.
 */
export function notConnectedProvider(id: SourceType, label: string, progressMessage: string): ResearchProvider {
  return {
    id,
    label,
    isLive: false,
    canHandle: () => true,
    async run(ctx): Promise<ProviderResult> {
      ctx.onProgress?.(progressMessage);
      return {
        source: {
          id: makeId("src"),
          type: id,
          label,
          status: "not_connected",
          statusNote: `${label} requires an authenticated API connection that isn't configured in this deployment yet.`,
          retrievedAt: new Date().toISOString(),
        },
        findings: [],
      };
    },
  };
}
