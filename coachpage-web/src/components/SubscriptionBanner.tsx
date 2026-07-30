import { AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Coach } from "@/types/domain";

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diffMs = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function SubscriptionBanner({ coach, onUpgradeClick }: { coach: Coach; onUpgradeClick: () => void }) {
  const daysLeft = daysUntil(coach.subscription_expires_at);

  if (coach.subscription_status === "PENDING_APPROVAL") {
    return (
      <div className="flex items-center gap-3 border-b border-sky-500/20 bg-sky-500/10 px-6 py-3 text-sm text-sky-700">
        <Clock className="size-4 shrink-0" />
        طلب تفعيل اشتراكك قيد المراجعة من طرف الإدارة. سنعلمك فور الموافقة.
      </div>
    );
  }

  if (coach.subscription_status === "EXPIRED" || (daysLeft !== null && daysLeft < 0)) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-500/20 bg-rose-500/10 px-6 py-3 text-sm text-rose-700">
        <span className="flex items-center gap-2 font-medium">
          <AlertTriangle className="size-4 shrink-0" />
          انتهت صلاحية اشتراكك — جدد الآن لتجنب انقطاع الخدمة عن عملائك.
        </span>
        <Button size="sm" variant="destructive" onClick={onUpgradeClick}>
          تجديد الاشتراك
        </Button>
      </div>
    );
  }

  if (coach.subscription_status === "TRIAL" && daysLeft !== null) {
    const urgent = daysLeft <= 2;
    return (
      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-b px-6 py-3 text-sm ${
          urgent ? "border-amber-400/30 bg-amber-400/10 text-amber-800" : "border-brand-100 bg-brand-50 text-brand-700"
        }`}
      >
        <span className="flex items-center gap-2 font-medium">
          <Clock className="size-4 shrink-0" />
          تبقى لك {Math.max(daysLeft, 0)} {daysLeft === 1 ? "يوم" : "أيام"} في تجربتك المجانية
        </span>
        <Button size="sm" variant={urgent ? "primary" : "secondary"} onClick={onUpgradeClick}>
          ترقية الحساب
        </Button>
      </div>
    );
  }

  if (coach.subscription_status === "ACTIVE" && daysLeft !== null && daysLeft <= 5) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-400/30 bg-amber-400/10 px-6 py-3 text-sm text-amber-800">
        <span className="flex items-center gap-2 font-medium">
          <AlertTriangle className="size-4 shrink-0" />
          اشتراكك سينتهي خلال {daysLeft} {daysLeft === 1 ? "يوم" : "أيام"} — جدد الآن لتجنب انقطاع الخدمة.
        </span>
        <Button size="sm" onClick={onUpgradeClick}>
          تجديد الآن
        </Button>
      </div>
    );
  }

  return null;
}
