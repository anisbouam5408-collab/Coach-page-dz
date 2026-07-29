export interface RequiredField {
  key: string;
  label: string;
  category: string;
  /** Findings whose `field` matches roll up into this resolved field. */
  sourceFieldPatterns: string[];
  /** If true, missing this field alone is enough to block full analysis. */
  critical: boolean;
  /** "list" fields keep every distinct value found; "singular" fields resolve to one winner. */
  kind: "singular" | "list";
}

export const REQUIRED_FIELDS: RequiredField[] = [
  { key: "identity.handle", label: "Handle / Username", category: "Creator Overview", sourceFieldPatterns: ["identity.handle"], critical: true, kind: "singular" },
  { key: "identity.displayName", label: "Display Name", category: "Creator Overview", sourceFieldPatterns: ["identity.displayName"], critical: false, kind: "singular" },
  { key: "positioning.niche", label: "Niche / Category", category: "Brand Positioning", sourceFieldPatterns: ["positioning.nicheSignal"], critical: true, kind: "singular" },
  { key: "brand.description", label: "Brand Description", category: "Brand Positioning", sourceFieldPatterns: ["brand.metaDescription", "brand.siteTitle", "brand.headline"], critical: false, kind: "singular" },
  { key: "ecosystem.offers", label: "Existing Products / Links", category: "Business Model", sourceFieldPatterns: ["ecosystem.linkedProperty", "products.linkedOffer"], critical: false, kind: "list" },
  { key: "audience.followerCount", label: "Follower / Subscriber Count", category: "Audience Analysis", sourceFieldPatterns: ["audience.followerCountSignal"], critical: false, kind: "singular" },
  { key: "monetization.pricing", label: "Pricing / Revenue Signals", category: "Revenue Sources", sourceFieldPatterns: ["monetization.priceSignal"], critical: false, kind: "list" },
];
