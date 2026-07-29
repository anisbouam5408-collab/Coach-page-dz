/**
 * Rule-based keyword matching used to turn real text (a handle, a domain,
 * a page title/description/heading) into a niche signal.
 *
 * This is intentionally NOT a language model guessing a niche — it is a
 * literal substring match against text the Research Engine actually
 * retrieved, so every match can be quoted back to the consultant as
 * evidence ("the word 'coach' appears in the bio").
 */
export const NICHE_KEYWORDS: Record<string, string[]> = {
  fitness: [
    "fitness",
    "fit",
    "gym",
    "workout",
    "training",
    "trainer",
    "coach",
    "strength",
    "muscle",
    "bodybuilding",
    "crossfit",
    "hiit",
    "calisthenics",
  ],
  nutrition: ["nutrition", "diet", "meal", "macros", "recipe", "cooking", "chef", "food"],
  wellness: ["wellness", "yoga", "mindfulness", "meditation", "holistic", "wellbeing", "health"],
  business: ["business", "entrepreneur", "startup", "founder", "ceo", "consult", "agency", "marketing"],
  finance: ["finance", "invest", "money", "wealth", "trading", "crypto", "budget"],
  beauty: ["beauty", "makeup", "skincare", "cosmetic", "glam"],
  fashion: ["fashion", "style", "outfit", "model", "designer"],
  tech: ["tech", "developer", "coding", "software", "engineer", "ai", "startup"],
  travel: ["travel", "wanderlust", "explore", "nomad", "adventure"],
  education: ["teach", "tutor", "course", "academy", "learning", "education", "mentor"],
  parenting: ["mom", "mama", "dad", "parent", "family", "kids"],
  gaming: ["gamer", "gaming", "esports", "twitch", "streamer"],
};

export interface NicheMatch {
  niche: string;
  matchedTerm: string;
  inText: string;
}

export function matchNiches(text: string, sourceLabel: string): NicheMatch[] {
  const lower = text.toLowerCase();
  const matches: NicheMatch[] = [];
  for (const [niche, terms] of Object.entries(NICHE_KEYWORDS)) {
    for (const term of terms) {
      if (lower.includes(term)) {
        matches.push({ niche, matchedTerm: term, inText: sourceLabel });
        break;
      }
    }
  }
  return matches;
}
