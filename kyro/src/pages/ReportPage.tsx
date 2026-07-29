import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { PipelineOutput } from "@/types/domain";
import { useAnalysisStore } from "@/store/analysisStore";
import { listSavedProjects } from "@/engines/export/exportEngine";
import { ReportTopBar } from "@/components/report/ReportTopBar";
import { Sidebar, type SidebarGroup } from "@/components/report/Sidebar";
import { BlockedState } from "@/components/report/BlockedState";
import { AnalysisSectionCard } from "@/components/report/AnalysisSectionCard";
import { ResearchCoverageSection, EvidenceLogSection, GapsSection } from "@/components/report/ResearchPanel";
import {
  SwotSection,
  CompetitorSection,
  MarketOpportunitiesSection,
  MonetizationOpportunitiesSection,
  EcosystemSection,
  CustomerJourneySection,
  ArchitectureSection,
  ProductConceptsSection,
  PriorityMatrixSection,
  RoadmapSection,
  FinalRecommendationSection,
} from "@/components/report/ProposalSections";

function resolveOutput(projectId: string | undefined, storeOutput: PipelineOutput | null): PipelineOutput | null {
  if (projectId) {
    const saved = listSavedProjects().find((p) => p.id === projectId);
    return saved?.output ?? null;
  }
  return storeOutput;
}

export function ReportPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const storeOutput = useAnalysisStore((s) => s.output);
  const output = resolveOutput(projectId, storeOutput);

  useEffect(() => {
    if (!output) navigate("/", { replace: true });
  }, [output, navigate]);

  if (!output) return null;

  const { analysis, proposal } = output;

  if (analysis.status === "blocked") {
    return <BlockedState analysis={analysis} />;
  }

  const sidebarGroups: SidebarGroup[] = [
    {
      label: "Research & Evidence",
      items: [
        { id: "research-coverage", title: "Research Coverage" },
        { id: "evidence-log", title: "Evidence Log" },
        ...(analysis.gaps.length > 0 ? [{ id: "gaps", title: "Gaps & Next Sources" }] : []),
      ],
    },
    {
      label: "Creator Analysis",
      items: analysis.sections.map((s) => ({ id: s.id, title: s.title, disabled: s.status === "insufficient" })),
    },
  ];

  if (proposal && proposal.status === "generated") {
    sidebarGroups.push(
      {
        label: "Strategy",
        items: [
          { id: "swot", title: "SWOT Analysis" },
          { id: "competitor-snapshot", title: "Competitor Snapshot" },
          { id: "market-opportunities", title: "Market Opportunities" },
          { id: "monetization-opportunities", title: "Monetization Opportunities" },
          { id: "product-ecosystem", title: "Product Ecosystem" },
          { id: "customer-journey", title: "Customer Journey" },
          { id: "business-architecture", title: "Business Architecture" },
        ],
      },
      {
        label: "Action Plan",
        items: [
          { id: "product-concepts", title: "10 Premium Product Concepts" },
          { id: "priority-matrix", title: "Priority Matrix" },
          { id: "roadmap", title: "90-Day Roadmap" },
          { id: "final-recommendation", title: "Final Recommendation" },
        ],
      },
    );
  }

  return (
    <div className="min-h-svh">
      <ReportTopBar output={output} />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-8 md:grid-cols-[220px_1fr]">
        <aside className="hidden md:block">
          <Sidebar groups={sidebarGroups} />
        </aside>

        <main className="flex flex-col gap-6 pb-24">
          <ResearchCoverageSection kb={output.knowledgeBase} />
          <EvidenceLogSection kb={output.knowledgeBase} />
          <GapsSection gaps={analysis.gaps} />

          {analysis.sections.map((section) => (
            <AnalysisSectionCard key={section.id} section={section} />
          ))}

          {proposal && proposal.status === "generated" && (
            <>
              <SwotSection proposal={proposal} />
              <CompetitorSection proposal={proposal} />
              <MarketOpportunitiesSection proposal={proposal} />
              <MonetizationOpportunitiesSection proposal={proposal} />
              <EcosystemSection proposal={proposal} />
              <CustomerJourneySection proposal={proposal} />
              <ArchitectureSection proposal={proposal} />
              <ProductConceptsSection proposal={proposal} />
              <PriorityMatrixSection proposal={proposal} />
              <RoadmapSection proposal={proposal} />
              <FinalRecommendationSection proposal={proposal} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
