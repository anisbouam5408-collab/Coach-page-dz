import type { KnowledgeBase, PipelineOutput, ReportSection } from "@/types/domain";

function confidenceTag(confidence: string): string {
  return `\`${confidence.toUpperCase()}\``;
}

function sectionToMarkdown(section: ReportSection): string {
  if (section.status === "insufficient") {
    return `### ${section.title}\n\n> **Insufficient verified data.** ${section.insufficientReason ?? ""}\n`;
  }
  return `### ${section.title}\n\n\`\`\`json\n${JSON.stringify(section.data, null, 2)}\n\`\`\`\n`;
}

function knowledgeAppendix(kb: KnowledgeBase): string {
  const sourceLines = kb.sources
    .map((s) => `- **${s.label}** — ${s.status}${s.statusNote ? ` (${s.statusNote})` : ""}`)
    .join("\n");
  return `## Research Coverage\n\nCoverage score: **${kb.coverageScore}%** of attempted sources were reachable.\nOverall confidence: ${confidenceTag(kb.overallConfidence)}\n\n${sourceLines}\n`;
}

/** Full evidence trail — every claim, its confidence, and its source. Never included in the client-facing version. */
export function generateInternalReport(output: PipelineOutput): string {
  const { knowledgeBase, analysis, proposal } = output;
  const lines: string[] = [];
  lines.push(`# KYRO Internal Research Dossier — ${knowledgeBase.handle}`);
  lines.push(`Generated ${new Date(knowledgeBase.generatedAt).toLocaleString()}\n`);
  lines.push(knowledgeAppendix(knowledgeBase));

  lines.push("## Analysis\n");
  if (analysis.status === "blocked") {
    lines.push(`**BLOCKED** — ${analysis.blockReason}\n`);
  } else {
    lines.push(`Status: **${analysis.status}**\n`);
    lines.push(analysis.sections.map(sectionToMarkdown).join("\n"));
  }

  if (analysis.gaps.length > 0) {
    lines.push("## Gaps & Suggested Additional Sources\n");
    for (const gap of analysis.gaps) {
      lines.push(`- **${gap.field}** — ${gap.reason} _(try: ${gap.suggestedSources.join(", ")})_`);
    }
  }

  lines.push("\n## Evidence Log\n");
  for (const ev of knowledgeBase.evidence) {
    lines.push(`- [${ev.confidence.toUpperCase()}${ev.isAssumption ? ", ASSUMPTION" : ""}] ${ev.claim}`);
  }

  if (proposal && proposal.status === "generated") {
    lines.push(`\n## Proposal (${proposal.basis})\n`);
    lines.push(`${proposal.finalRecommendation}\n`);
  }

  return lines.join("\n");
}

/** Client-facing version: no confidence scores, no raw evidence, no mention of gaps as failures. */
export function generateClientProposal(output: PipelineOutput): string {
  const { knowledgeBase, proposal } = output;
  if (!proposal || proposal.status !== "generated") {
    return `# Proposal Unavailable\n\nNot enough public information could be verified yet to prepare a client-ready proposal for ${knowledgeBase.handle}.`;
  }

  const lines: string[] = [];
  lines.push(`# Growth Proposal — ${knowledgeBase.handle}`);
  lines.push(`Prepared ${new Date().toLocaleDateString()}\n`);
  lines.push("## Where You Stand\n");
  lines.push(proposal.finalRecommendation + "\n");

  lines.push("## Opportunities\n");
  for (const m of proposal.monetizationOpportunities) lines.push(`- ${m}`);

  lines.push("\n## Recommended Product Concepts\n");
  for (const c of proposal.productConcepts.slice(0, 10)) {
    lines.push(`### ${c.title}\n${c.description}\n**Format:** ${c.format} · **Price range:** ${c.priceRange}\n`);
  }

  lines.push("## 90-Day Roadmap\n");
  for (const phase of proposal.roadmap) {
    lines.push(`### ${phase.title} (${phase.window})`);
    for (const action of phase.actions) lines.push(`- ${action}`);
    lines.push("");
  }

  return lines.join("\n");
}

export function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const SAVED_PROJECTS_KEY = "kyro:saved-projects";

export interface SavedProject {
  id: string;
  handle: string;
  savedAt: string;
  output: PipelineOutput;
}

export function saveProject(output: PipelineOutput): SavedProject {
  const existing = listSavedProjects();
  const project: SavedProject = {
    id: `${output.knowledgeBase.handle}-${Date.now()}`,
    handle: output.knowledgeBase.handle,
    savedAt: new Date().toISOString(),
    output,
  };
  localStorage.setItem(SAVED_PROJECTS_KEY, JSON.stringify([project, ...existing].slice(0, 20)));
  return project;
}

export function listSavedProjects(): SavedProject[] {
  try {
    const raw = localStorage.getItem(SAVED_PROJECTS_KEY);
    return raw ? (JSON.parse(raw) as SavedProject[]) : [];
  } catch {
    return [];
  }
}
