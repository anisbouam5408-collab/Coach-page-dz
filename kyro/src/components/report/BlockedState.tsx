import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { AnalysisResult } from "@/types/domain";

export function BlockedState({ analysis }: { analysis: AnalysisResult }) {
  const navigate = useNavigate();
  return (
    <div className="mx-auto flex min-h-svh max-w-2xl flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-rose-400/10">
        <ShieldAlert className="size-7 text-rose-400" />
      </div>
      <h1 className="text-2xl font-semibold text-ink">Analysis Halted</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">{analysis.blockReason}</p>
      <p className="mt-2 text-xs text-ink-faint">
        KYRO never speculates when evidence is thin — it stops and tells you what's missing instead.
      </p>

      <div className="mt-8 flex w-full flex-col gap-3 text-left">
        {analysis.gaps.map((gap) => (
          <div key={gap.field} className="glass rounded-2xl p-4">
            <p className="text-sm font-medium text-ink">{gap.field}</p>
            <p className="mt-1 text-xs text-ink-muted">{gap.reason}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {gap.suggestedSources.map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button className="mt-8" onClick={() => navigate("/")}>
        Try again with more sources
      </Button>
    </div>
  );
}
