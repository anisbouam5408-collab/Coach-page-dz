import type { ConfidenceLevel } from "@/types/domain";

/** Below this, a field is treated as not usable for analysis. */
export const MIN_USABLE_CONFIDENCE: ConfidenceLevel[] = ["verified", "high", "medium", "low"];

export function isUsable(confidence: ConfidenceLevel): boolean {
  return confidence !== "unknown";
}

export const DIGITAL_PRODUCT_KEYWORDS = ["course", "program", "ebook", "guide", "template", "download", "book", "workshop", "app"];
export const SERVICE_KEYWORDS = ["coaching", "consulting", "consult", "session", "call", "1:1", "mentor", "retainer", "membership"];

export function classifyOffer(text: string): "product" | "service" | "other" {
  const lower = text.toLowerCase();
  if (SERVICE_KEYWORDS.some((k) => lower.includes(k))) return "service";
  if (DIGITAL_PRODUCT_KEYWORDS.some((k) => lower.includes(k))) return "product";
  return "other";
}
