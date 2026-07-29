import type { ReactNode } from "react";
import { CircleSlash } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

interface SectionWrapperProps {
  id: string;
  title: string;
  eyebrow?: string;
  status: "ready" | "insufficient";
  insufficientReason?: string;
  headerRight?: ReactNode;
  children?: ReactNode;
}

export function SectionWrapper({ id, title, eyebrow, status, insufficientReason, headerRight, children }: SectionWrapperProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <Card>
        <CardHeader>
          <div>
            {eyebrow && <p className="mb-1 text-xs font-medium tracking-wide text-violet-300 uppercase">{eyebrow}</p>}
            <CardTitle>{title}</CardTitle>
          </div>
          {headerRight}
        </CardHeader>

        {status === "insufficient" ? (
          <div className="flex items-start gap-3 rounded-2xl border border-dashed border-border-strong bg-white/[0.02] p-5">
            <CircleSlash className="mt-0.5 size-5 shrink-0 text-ink-faint" />
            <div>
              <p className="text-sm font-medium text-ink-muted">Insufficient verified data</p>
              <CardDescription className="mt-1">{insufficientReason ?? "Not enough evidence was found to build this section."}</CardDescription>
            </div>
          </div>
        ) : (
          children
        )}
      </Card>
    </section>
  );
}
