import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileDown, FileText, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { PipelineOutput } from "@/types/domain";
import { downloadMarkdown, generateClientProposal, generateInternalReport, saveProject } from "@/engines/export/exportEngine";

export function ReportTopBar({ output }: { output: PipelineOutput }) {
  const navigate = useNavigate();
  const handle = output.knowledgeBase.handle;

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-canvas/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:gap-4 md:px-6 md:py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
            <ArrowLeft className="size-4" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-violet-400" />
            <span className="font-medium text-ink">@{handle}</span>
          </div>
        </div>

        <div className="scrollbar-none -mx-4 flex items-center gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
          <Button variant="secondary" size="sm" className="shrink-0" onClick={() => downloadMarkdown(`${handle}-internal-report.md`, generateInternalReport(output))}>
            <FileText className="size-3.5" />
            Internal Report
          </Button>
          <Button variant="secondary" size="sm" className="shrink-0" onClick={() => downloadMarkdown(`${handle}-client-proposal.md`, generateClientProposal(output))}>
            <FileText className="size-3.5" />
            Client Proposal
          </Button>
          <Button variant="secondary" size="sm" className="shrink-0" onClick={() => window.print()}>
            <FileDown className="size-3.5" />
            Export PDF
          </Button>
          <Button variant="primary" size="sm" className="shrink-0" onClick={() => saveProject(output)}>
            <Save className="size-3.5" />
            Save Project
          </Button>
        </div>
      </div>
    </header>
  );
}
