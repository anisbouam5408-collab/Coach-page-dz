import { CheckCircle2, XCircle, MinusCircle, AlertTriangle } from "lucide-react";
import type { AnalysisGap, KnowledgeBase } from "@/types/domain";
import { SectionWrapper } from "./SectionWrapper";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { Badge } from "@/components/ui/Badge";

const STATUS_META = {
  fetched: { icon: CheckCircle2, tone: "text-emerald-400" },
  partial: { icon: AlertTriangle, tone: "text-amber-400" },
  unreachable: { icon: XCircle, tone: "text-rose-400" },
  not_connected: { icon: MinusCircle, tone: "text-ink-faint" },
} as const;

export function ResearchCoverageSection({ kb }: { kb: KnowledgeBase }) {
  return (
    <SectionWrapper
      id="research-coverage"
      title="Research Coverage"
      status="ready"
      eyebrow="Every source the Research Engine attempted"
      headerRight={
        <div className="flex items-center gap-2">
          <ConfidenceBadge level={kb.overallConfidence} />
          <Badge tone={kb.coverageScore >= 50 ? "emerald" : "amber"}>{kb.coverageScore}% reachable</Badge>
        </div>
      }
    >
      <ul className="flex flex-col divide-y divide-border">
        {kb.sources.map((s) => {
          const meta = STATUS_META[s.status];
          const Icon = meta.icon;
          return (
            <li key={s.id} className="flex items-start gap-3 py-3">
              <Icon className={`mt-0.5 size-4 shrink-0 ${meta.tone}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink">{s.label}</p>
                {s.statusNote && <p className="mt-0.5 text-xs text-ink-faint">{s.statusNote}</p>}
              </div>
              <span className="shrink-0 text-xs text-ink-faint capitalize">{s.status.replace("_", " ")}</span>
            </li>
          );
        })}
      </ul>
    </SectionWrapper>
  );
}

export function EvidenceLogSection({ kb }: { kb: KnowledgeBase }) {
  return (
    <SectionWrapper id="evidence-log" title="Evidence Log" status="ready" eyebrow="Fact vs. assumption, with a citation trail">
      <ul className="flex max-h-96 flex-col gap-2 overflow-y-auto pr-2">
        {kb.evidence.map((ev) => (
          <li key={ev.id} className="rounded-xl bg-white/[0.03] p-3">
            <div className="mb-1.5 flex items-center gap-2">
              <ConfidenceBadge level={ev.confidence} />
              {ev.isAssumption && <Badge tone="amber">Assumption</Badge>}
            </div>
            <p className="text-sm text-ink-muted">{ev.claim}</p>
          </li>
        ))}
        {kb.evidence.length === 0 && <p className="text-sm text-ink-faint">No evidence was collected.</p>}
      </ul>
    </SectionWrapper>
  );
}

export function GapsSection({ gaps }: { gaps: AnalysisGap[] }) {
  if (gaps.length === 0) return null;
  return (
    <SectionWrapper id="gaps" title="What's Missing & How to Fix It" status="ready" eyebrow="Suggested next sources">
      <ul className="flex flex-col gap-3">
        {gaps.map((gap) => (
          <li key={gap.field} className="rounded-xl border border-dashed border-border-strong p-4">
            <p className="text-sm font-medium text-ink">{gap.field}</p>
            <p className="mt-1 text-xs text-ink-muted">{gap.reason}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {gap.suggestedSources.map((src) => (
                <Badge key={src}>{src}</Badge>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </SectionWrapper>
  );
}
