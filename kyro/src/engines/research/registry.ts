import type { ResearchProvider } from "./types";
import { urlSignalProvider } from "./providers/urlSignalProvider";
import { consultantNotesProvider } from "./providers/consultantNotesProvider";
import { websiteProvider } from "./providers/websiteProvider";
import { linktreeProvider } from "./providers/linktreeProvider";
import { notConnectedProvider } from "./providers/notConnectedProvider";

/**
 * The full plugin registry. To add a new research source: implement
 * `ResearchProvider` and push it here — the orchestrator, the Knowledge
 * Engine, and the UI's Research Coverage panel all pick it up automatically.
 */
export const RESEARCH_PROVIDERS: ResearchProvider[] = [
  urlSignalProvider,
  consultantNotesProvider,
  websiteProvider,
  linktreeProvider,
  notConnectedProvider("instagram", "Instagram", "Studying Instagram presence..."),
  notConnectedProvider("tiktok", "TikTok", "Studying TikTok presence..."),
  notConnectedProvider("youtube", "YouTube", "Analyzing YouTube channel..."),
  notConnectedProvider("facebook", "Facebook Page", "Checking Facebook page..."),
  notConnectedProvider("linkedin", "LinkedIn", "Checking LinkedIn presence..."),
  notConnectedProvider("twitter", "X (Twitter)", "Checking X / Twitter presence..."),
  notConnectedProvider("search_engine", "Search Engine Results", "Searching public web results..."),
  notConnectedProvider("press_article", "Press & Interviews", "Finding public interviews and articles..."),
];
