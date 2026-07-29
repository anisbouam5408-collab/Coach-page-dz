# KYRO — Creator Intelligence Platform

Paste a creator's public presence (Instagram, website, Linktree, TikTok,
YouTube...) and KYRO runs it through four independent engines to produce an
evidence-backed strategic report — or stops and tells you exactly what's
missing instead of guessing.

## Why it's built this way

An earlier version analyzed creators directly and sometimes produced
confident-sounding but wrong output (e.g. an unrelated niche for a fitness
creator). The fix isn't a better prompt — it's an architecture where an AI
model can never see a creator's data before that data has been verified and
scored:

```
Research Engine → Knowledge Engine → Analysis Engine → Proposal Engine → Export Engine
```

Each stage only receives the previous stage's structured output, never raw
input:

- **Research Engine** (`src/engines/research/`) — collects raw, source-attributed
  findings. Providers are plugins implementing `ResearchProvider`
  (`src/engines/research/types.ts`); see `registry.ts` to add a new one. A
  provider either has real data or reports `unreachable` / `not_connected` —
  it never fabricates a finding.
- **Knowledge Engine** (`src/engines/knowledge/`) — turns raw findings into a
  `KnowledgeBase`: every field is a Fact (with evidence + confidence), an
  Assumption (explicitly flagged), or an Unknown. A claim only reaches
  `verified` confidence when 2+ independent sources agree.
- **Analysis Engine** (`src/engines/analysis/`) — only reads the
  `KnowledgeBase`, never raw research. If the creator's niche can't be
  established from any source, the whole run stops (`status: "blocked"`)
  with a plain-language explanation and suggested next sources instead of
  continuing into speculative territory.
- **Proposal Engine** (`src/engines/proposal/`) — generates recommendations
  strictly from the Analysis Engine's verified output plus a niche
  "category playbook" (pattern library, not creator facts). Every proposal
  is labeled either **creator-specific** (backed by verified offers/pricing)
  or **category pattern** (extrapolated from the niche only) so a consultant
  never mistakes a template suggestion for a verified fact.
- **Export Engine** (`src/engines/export/`) — turns the pipeline's output
  into an internal (full evidence trail) or client-facing (polished, no
  confidence scores) document, plus local "Save Project" persistence.

The orchestrator that wires all four together is `src/engines/pipeline.ts`.

## Adding a new research provider

Implement `ResearchProvider` (`src/engines/research/types.ts`) and add it to
`RESEARCH_PROVIDERS` in `src/engines/research/registry.ts`. Nothing else
needs to change — the Knowledge Engine, Analysis Engine, and the Research
Coverage UI panel all pick it up automatically from the sources/findings it
returns.

Two providers do real, live work today: `websiteProvider` and
`linktreeProvider` attempt an actual `fetch()` of the pasted URL and extract
title/meta/headings/links (see `fetchUtils.ts`). Everything requiring an
authenticated platform API (Instagram, TikTok, YouTube, Facebook, LinkedIn,
X, search, press) ships as a clearly-labeled `not_connected` source — wiring
up the real API later means writing one provider matching the same
interface and swapping it into the registry.

If cross-origin requests are blocked in production, set `VITE_CORS_PROXY` to
a server-side proxy endpoint (e.g. a Cloudflare Worker/Supabase Edge
Function) — no provider code needs to change.

## Tech stack

React 19 · Vite · TypeScript (strict) · Tailwind CSS v4 · Framer Motion ·
React Router · Recharts · React Markdown · Zustand · Lucide icons.

## Development

```bash
npm install
npm run dev      # start dev server
npm run build    # type-check + production build
npm run preview  # serve the production build locally
```

Static output (`npm run build` → `dist/`) is ready for Cloudflare Pages.
Supabase is not wired in yet; `src/engines/export/exportEngine.ts`'s
`saveProject`/`listSavedProjects` currently use `localStorage` and are the
natural place to swap in a Supabase-backed store.
