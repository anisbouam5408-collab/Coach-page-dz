import { BadgeCheck, CircleCheck, CircleHelp, CircleAlert, CircleSlash } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { ConfidenceLevel } from "@/types/domain";

const CONFIG: Record<ConfidenceLevel, { tone: "emerald" | "violet" | "amber" | "rose" | "neutral"; label: string; icon: typeof BadgeCheck }> = {
  verified: { tone: "emerald", label: "Verified · 2+ sources", icon: BadgeCheck },
  high: { tone: "violet", label: "High confidence", icon: CircleCheck },
  medium: { tone: "amber", label: "Medium confidence", icon: CircleHelp },
  low: { tone: "rose", label: "Low confidence", icon: CircleAlert },
  unknown: { tone: "neutral", label: "Unknown", icon: CircleSlash },
};

export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const { tone, label, icon: Icon } = CONFIG[level];
  return (
    <Badge tone={tone}>
      <Icon className="size-3.5" />
      {label}
    </Badge>
  );
}
