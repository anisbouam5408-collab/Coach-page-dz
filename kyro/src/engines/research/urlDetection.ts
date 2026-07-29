import type { SourceType } from "@/types/domain";

export interface DetectedInput {
  normalizedUrl: string;
  handle: string;
  platform: SourceType | "unknown";
  domain: string;
}

const PLATFORM_HOSTS: { match: RegExp; platform: SourceType }[] = [
  { match: /(^|\.)instagram\.com$/, platform: "instagram" },
  { match: /(^|\.)tiktok\.com$/, platform: "tiktok" },
  { match: /(^|\.)youtube\.com$/, platform: "youtube" },
  { match: /(^|\.)youtu\.be$/, platform: "youtube" },
  { match: /(^|\.)linktr\.ee$/, platform: "linktree" },
  { match: /(^|\.)facebook\.com$/, platform: "facebook" },
  { match: /(^|\.)linkedin\.com$/, platform: "linkedin" },
  { match: /(^|\.)(twitter\.com|x\.com)$/, platform: "twitter" },
];

/**
 * Accepts a bare handle ("@sara.fit"), a bare domain, or a full URL and
 * normalizes it. This is real parsing of what the consultant actually
 * pasted — not a guess about the creator.
 */
export function detectInput(raw: string): DetectedInput {
  const trimmed = raw.trim();
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed.replace(/^@/, "")}`;

  let url: URL | null = null;
  try {
    url = new URL(withScheme);
  } catch {
    url = null;
  }

  if (!url) {
    // Bare handle, no dot/domain at all (e.g. "@sara.fit" meant as a name, not a domain)
    const handle = trimmed.replace(/^@/, "");
    return { normalizedUrl: trimmed, handle, platform: "unknown", domain: "" };
  }

  const host = url.hostname.replace(/^www\./, "");
  const matched = PLATFORM_HOSTS.find((p) => p.match.test(host));
  const pathParts = url.pathname.split("/").filter(Boolean);

  let handle = pathParts[0] ?? host;
  if (matched?.platform === "youtube") {
    handle = pathParts.find((p) => p.startsWith("@")) ?? pathParts[0] ?? host;
  }

  return {
    normalizedUrl: url.toString(),
    handle: handle.replace(/^@/, ""),
    platform: matched?.platform ?? (pathParts.length === 0 ? "website" : "website"),
    domain: host,
  };
}
