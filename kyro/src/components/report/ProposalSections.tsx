import ReactMarkdown from "react-markdown";
import { ThumbsUp, ThumbsDown, Compass, ShieldAlert, TrendingUp, DollarSign, Boxes, Map as MapIcon, Building2 } from "lucide-react";
import type { ProposalResult } from "@/types/domain";
import { SectionWrapper } from "./SectionWrapper";
import { Badge } from "@/components/ui/Badge";

function BasisBadge({ basis }: { basis: ProposalResult["basis"] }) {
  return basis === "creator-specific" ? (
    <Badge tone="emerald">Based on this creator's verified data</Badge>
  ) : (
    <Badge tone="amber">Category pattern — validate before using</Badge>
  );
}

export function SwotSection({ proposal }: { proposal: ProposalResult }) {
  const groups: { label: string; icon: typeof ThumbsUp; tone: string; items: string[] }[] = [
    { label: "Strengths", icon: ThumbsUp, tone: "text-emerald-300", items: proposal.swot.strengths },
    { label: "Weaknesses", icon: ThumbsDown, tone: "text-rose-300", items: proposal.swot.weaknesses },
    { label: "Opportunities", icon: Compass, tone: "text-violet-300", items: proposal.swot.opportunities },
    { label: "Threats", icon: ShieldAlert, tone: "text-amber-300", items: proposal.swot.threats },
  ];
  return (
    <SectionWrapper id="swot" title="SWOT Analysis" status="ready" headerRight={<BasisBadge basis={proposal.basis} />}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {groups.map((g) => (
          <div key={g.label} className="rounded-2xl bg-white/[0.03] p-4">
            <p className={`mb-2 flex items-center gap-2 text-sm font-medium ${g.tone}`}>
              <g.icon className="size-4" />
              {g.label}
            </p>
            <ul className="space-y-1.5 text-sm text-ink-muted">
              {g.items.map((item) => (
                <li key={item} className="leading-relaxed">
                  · {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

export function CompetitorSection({ proposal }: { proposal: ProposalResult }) {
  return (
    <SectionWrapper id="competitor-snapshot" title="Competitor Snapshot" status="ready" eyebrow="Competitive patterns, not named competitors">
      <div className="grid gap-3 md:grid-cols-2">
        {proposal.competitorSnapshot.map((c) => (
          <div key={c.archetype} className="rounded-2xl bg-white/[0.03] p-4">
            <p className="text-sm font-medium text-ink">{c.archetype}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-faint">{c.description}</p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

export function MarketOpportunitiesSection({ proposal }: { proposal: ProposalResult }) {
  return (
    <SectionWrapper id="market-opportunities" title="Market Opportunities" status="ready">
      <ul className="flex flex-col gap-2.5">
        {proposal.marketOpportunities.map((m) => (
          <li key={m} className="flex items-start gap-2.5 text-sm text-ink-muted">
            <TrendingUp className="mt-0.5 size-4 shrink-0 text-violet-300" />
            {m}
          </li>
        ))}
      </ul>
    </SectionWrapper>
  );
}

export function MonetizationOpportunitiesSection({ proposal }: { proposal: ProposalResult }) {
  return (
    <SectionWrapper id="monetization-opportunities" title="Monetization Opportunities" status="ready">
      <ul className="flex flex-col gap-2.5">
        {proposal.monetizationOpportunities.map((m) => (
          <li key={m} className="flex items-start gap-2.5 text-sm text-ink-muted">
            <DollarSign className="mt-0.5 size-4 shrink-0 text-emerald-300" />
            {m}
          </li>
        ))}
      </ul>
    </SectionWrapper>
  );
}

export function EcosystemSection({ proposal }: { proposal: ProposalResult }) {
  return (
    <SectionWrapper id="product-ecosystem" title="Product Ecosystem" status="ready">
      <div className="flex flex-wrap gap-2">
        {proposal.productEcosystem.map((item) => (
          <span
            key={item}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              item.startsWith("[Existing]") ? "bg-emerald-400/10 text-emerald-300" : "bg-violet-500/10 text-violet-300"
            }`}
          >
            <Boxes className="mr-1.5 inline size-3" />
            {item.replace(/^\[(Existing|Opportunity)\]\s*/, "")}
          </span>
        ))}
      </div>
    </SectionWrapper>
  );
}

export function CustomerJourneySection({ proposal }: { proposal: ProposalResult }) {
  return (
    <SectionWrapper id="customer-journey" title="Customer Journey" status="ready">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {proposal.customerJourney.map((stage, i) => (
          <div key={stage.stage} className="relative rounded-2xl bg-white/[0.03] p-4">
            <p className="text-xs font-medium text-violet-300">{i + 1}. {stage.stage}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{stage.description}</p>
            <p className="mt-2 text-xs text-ink-faint">{stage.touchpoint}</p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

export function ArchitectureSection({ proposal }: { proposal: ProposalResult }) {
  return (
    <SectionWrapper id="business-architecture" title="Business Architecture" status="ready">
      <ul className="flex flex-col gap-2.5">
        {proposal.businessArchitecture.map((line) => (
          <li key={line} className="flex items-start gap-2.5 text-sm text-ink-muted">
            <Building2 className="mt-0.5 size-4 shrink-0 text-ink-faint" />
            {line}
          </li>
        ))}
      </ul>
    </SectionWrapper>
  );
}

export function ProductConceptsSection({ proposal }: { proposal: ProposalResult }) {
  return (
    <SectionWrapper id="product-concepts" title="10 Premium Product Concepts" status="ready" headerRight={<BasisBadge basis={proposal.basis} />}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {proposal.productConcepts.map((c, i) => (
          <div key={c.id} className="rounded-2xl bg-white/[0.03] p-4">
            <p className="text-xs font-medium text-ink-faint">#{i + 1}</p>
            <p className="mt-1 text-sm font-medium text-ink">{c.title}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{c.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge>{c.priceRange}</Badge>
              <Badge tone={c.effort === "low" ? "emerald" : c.effort === "medium" ? "amber" : "rose"}>{c.effort} effort</Badge>
              <Badge tone={c.impact === "high" ? "violet" : "neutral"}>{c.impact} impact</Badge>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

const QUADRANT_META: Record<string, { label: string; tone: "emerald" | "violet" | "amber" | "rose" }> = {
  "quick-win": { label: "Quick Win", tone: "emerald" },
  "major-bet": { label: "Major Bet", tone: "violet" },
  "fill-in": { label: "Fill-In", tone: "amber" },
  reconsider: { label: "Reconsider", tone: "rose" },
};

export function PriorityMatrixSection({ proposal }: { proposal: ProposalResult }) {
  const quadrants = ["quick-win", "major-bet", "fill-in", "reconsider"] as const;
  return (
    <SectionWrapper id="priority-matrix" title="Priority Matrix" status="ready">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {quadrants.map((q) => {
          const items = proposal.priorityMatrix.filter((p) => p.quadrant === q);
          const meta = QUADRANT_META[q];
          return (
            <div key={q} className="rounded-2xl bg-white/[0.03] p-4">
              <Badge tone={meta.tone}>{meta.label}</Badge>
              <ul className="mt-3 space-y-1.5">
                {items.map((item) => (
                  <li key={item.id} className="text-xs leading-relaxed text-ink-muted">
                    · {item.label}
                  </li>
                ))}
                {items.length === 0 && <li className="text-xs text-ink-faint">None</li>}
              </ul>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

export function RoadmapSection({ proposal }: { proposal: ProposalResult }) {
  return (
    <SectionWrapper id="roadmap" title="90-Day Roadmap" status="ready">
      <div className="relative flex flex-col gap-6 border-l border-border pl-6">
        {proposal.roadmap.map((phase) => (
          <div key={phase.id} className="relative">
            <span className="absolute top-1.5 -left-[29px] size-3 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400" />
            <p className="flex items-center gap-2 text-sm font-medium text-ink">
              <MapIcon className="size-4 text-violet-300" />
              {phase.title}
              <span className="text-xs font-normal text-ink-faint">{phase.window}</span>
            </p>
            <ul className="mt-2 space-y-1">
              {phase.goals.map((goal) => (
                <li key={goal} className="text-xs text-ink-faint">
                  Goal: {goal}
                </li>
              ))}
              {phase.actions.map((action) => (
                <li key={action} className="text-xs text-ink-muted">
                  → {action}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

export function FinalRecommendationSection({ proposal }: { proposal: ProposalResult }) {
  return (
    <SectionWrapper id="final-recommendation" title="Final Strategic Recommendation" status="ready" headerRight={<BasisBadge basis={proposal.basis} />}>
      <div className="text-base leading-relaxed text-ink-muted [&_strong]:font-semibold [&_strong]:text-ink">
        <ReactMarkdown>{proposal.finalRecommendation}</ReactMarkdown>
      </div>
    </SectionWrapper>
  );
}
