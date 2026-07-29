/**
 * Best-effort, browser-safe fetch of a public page's HTML.
 *
 * Many sites block cross-origin reads (CORS) from the browser. When that
 * happens we do NOT fabricate a result — we report the source as
 * "unreachable" and let the Knowledge Engine record it as an unknown.
 * A CORS relay can be configured via VITE_CORS_PROXY for production
 * deployments (e.g. a Cloudflare Worker / Supabase Edge Function that
 * proxies the request server-side) without changing any provider code.
 */

const PROXY = import.meta.env.VITE_CORS_PROXY?.trim();
const TIMEOUT_MS = 8000;

export interface FetchedPage {
  ok: boolean;
  html?: string;
  reason?: string;
}

export async function fetchPublicHtml(url: string): Promise<FetchedPage> {
  const target = PROXY ? `${PROXY}${encodeURIComponent(url)}` : url;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(target, {
      signal: controller.signal,
      headers: { Accept: "text/html" },
    });
    if (!res.ok) {
      return { ok: false, reason: `Source responded with HTTP ${res.status}` };
    }
    const html = await res.text();
    return { ok: true, html };
  } catch (err) {
    const reason =
      err instanceof DOMException && err.name === "AbortError"
        ? "Request timed out"
        : "Blocked by browser (CORS) or unreachable — connect a server-side proxy to enable this source";
    return { ok: false, reason };
  } finally {
    clearTimeout(timer);
  }
}

export interface ParsedPage {
  title?: string;
  description?: string;
  headings: string[];
  links: { text: string; href: string }[];
  visibleText: string;
}

export function parseHtml(html: string): ParsedPage {
  const doc = new DOMParser().parseFromString(html, "text/html");

  const title = doc.querySelector("title")?.textContent?.trim() || undefined;
  const description =
    doc.querySelector('meta[name="description"]')?.getAttribute("content")?.trim() ||
    doc.querySelector('meta[property="og:description"]')?.getAttribute("content")?.trim() ||
    undefined;

  const headings = Array.from(doc.querySelectorAll("h1, h2"))
    .map((h) => h.textContent?.trim() ?? "")
    .filter(Boolean)
    .slice(0, 12);

  const links = Array.from(doc.querySelectorAll("a[href]"))
    .map((a) => ({
      text: a.textContent?.trim() ?? "",
      href: a.getAttribute("href") ?? "",
    }))
    .filter((l) => l.text && l.href.startsWith("http"))
    .slice(0, 40);

  const bodyClone = doc.body?.cloneNode(true) as HTMLElement | undefined;
  bodyClone?.querySelectorAll("script, style, noscript").forEach((el) => el.remove());
  const visibleText = (bodyClone?.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 4000);

  return { title, description, headings, links, visibleText };
}
