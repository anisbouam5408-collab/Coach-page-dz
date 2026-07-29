import { Globe, Link2 } from "lucide-react";
import type { ConfidenceLevel, ReportSection } from "@/types/domain";
import { SectionWrapper } from "./SectionWrapper";
import { ConfidenceBadge } from "./ConfidenceBadge";

interface CreatorOverviewData {
  handle: string;
  detectedPlatform: string;
  inputUrl: string;
  coverageScore: number;
  sourcesAttempted: number;
  sourcesReachable: number;
}
interface BrandPositioningData {
  niche: string;
  nicheConfidence: ConfidenceLevel;
  description: string | null;
  descriptionConfidence: ConfidenceLevel;
}
interface OfferListData {
  offers?: string[];
  items?: string[];
}
interface RevenueData {
  prices: string[];
}
interface AudienceData {
  followerCountSignal: string | number | null;
  confidence: ConfidenceLevel;
}

export function AnalysisSectionCard({ section }: { section: ReportSection }) {
  const base = { id: section.id, title: section.title, status: section.status, insufficientReason: section.insufficientReason };

  switch (section.id) {
    case "creator-overview": {
      const d = section.data as CreatorOverviewData;
      return (
        <SectionWrapper {...base} eyebrow="Who they are">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat label="Handle" value={`@${d.handle}`} />
            <Stat label="Origin platform" value={d.detectedPlatform} />
            <Stat label="Sources reachable" value={`${d.sourcesReachable}/${d.sourcesAttempted}`} />
            <Stat label="Coverage" value={`${d.coverageScore}%`} />
          </div>
          <a href={d.inputUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-1.5 text-sm text-violet-300 hover:underline">
            <Link2 className="size-3.5" />
            {d.inputUrl}
          </a>
        </SectionWrapper>
      );
    }

    case "brand-positioning": {
      const d = section.data as BrandPositioningData;
      return (
        <SectionWrapper {...base} eyebrow="Positioning">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-2xl font-semibold capitalize text-ink">{d.niche}</span>
            <ConfidenceBadge level={d.nicheConfidence} />
          </div>
          {d.description ? (
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              "{d.description}"
              <span className="ml-2 inline-block align-middle">
                <ConfidenceBadge level={d.descriptionConfidence} />
              </span>
            </p>
          ) : (
            <p className="mt-4 text-sm text-ink-faint">No brand description found on any reachable source.</p>
          )}
        </SectionWrapper>
      );
    }

    case "business-model":
    case "digital-products":
    case "services": {
      const d = (section.data ?? {}) as OfferListData;
      const list = d.offers ?? d.items ?? [];
      return (
        <SectionWrapper {...base} eyebrow="Discovered from Linktree / website">
          <ul className="flex flex-col gap-2">
            {list.map((item) => (
              <li key={item} className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] px-4 py-3 text-sm text-ink">
                <Globe className="size-3.5 shrink-0 text-ink-faint" />
                {item}
              </li>
            ))}
          </ul>
        </SectionWrapper>
      );
    }

    case "revenue-sources": {
      const d = (section.data ?? { prices: [] }) as RevenueData;
      return (
        <SectionWrapper {...base} eyebrow="Verified price points">
          <div className="flex flex-wrap gap-2">
            {d.prices.map((p) => (
              <span key={p} className="rounded-full bg-emerald-400/10 px-3 py-1.5 text-sm font-medium text-emerald-300">
                {p}
              </span>
            ))}
          </div>
        </SectionWrapper>
      );
    }

    case "audience-analysis": {
      const d = (section.data ?? { followerCountSignal: null, confidence: "unknown" }) as AudienceData;
      return (
        <SectionWrapper {...base} eyebrow="Reach signal">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold text-ink">{d.followerCountSignal}</span>
            <ConfidenceBadge level={d.confidence} />
          </div>
        </SectionWrapper>
      );
    }

    default:
      return <SectionWrapper {...base} />;
  }
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.03] px-4 py-3">
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="mt-1 truncate text-sm font-medium text-ink">{value}</p>
    </div>
  );
}
