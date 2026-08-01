import { Lock, LogOut, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { usePlans } from "@/hooks/usePlans";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { buildRenewWhatsAppLink } from "@/lib/whatsapp";
import { useAuthStore } from "@/store/authStore";
import type { Coach } from "@/types/domain";

export function SubscriptionLockedPage({ coach }: { coach: Coach }) {
  const { plans } = usePlans();
  const platformSettings = usePlatformSettings();
  const signOut = useAuthStore((s) => s.signOut);

  const wasTrial = coach.subscription_status === "TRIAL";

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-canvas px-6 py-12">
      <Card className="w-full max-w-lg text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600">
          <Lock className="size-6" />
        </div>
        <h1 className="text-xl font-bold text-ink">{wasTrial ? "انتهت فترتك التجريبية المجانية" : "انتهى اشتراكك"}</h1>
        <p className="mt-2 text-sm text-ink-muted">
          حسابك موقوف مؤقتاً حتى يتم تجديد الاشتراك. اختر خطة وتواصل مع المشرف عبر واتساب لإعادة التفعيل مباشرة بعد
          الدفع.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.code} className="rounded-xl border border-border p-4">
              <p className="text-sm font-semibold text-ink-muted">{plan.label}</p>
              <p className="mt-1 text-xl font-extrabold text-ink">
                {plan.price_dzd.toLocaleString("ar-DZ")} <span className="text-xs font-medium text-ink-faint">دج</span>
              </p>
              <a
                href={buildRenewWhatsAppLink({
                  coachName: coach.full_name || coach.username,
                  email: coach.email ?? "",
                  planLabel: plan.label,
                  priceDzd: plan.price_dzd,
                  ownerWhatsapp: platformSettings?.owner_whatsapp || "213553093511",
                })}
                target="_blank"
                rel="noreferrer"
                className="mt-3 block"
              >
                <Button size="sm" className="w-full">
                  <MessageCircle className="size-3.5" />
                  تفعيل
                </Button>
              </a>
            </div>
          ))}
        </div>

        <Button variant="ghost" size="sm" className="mt-6" onClick={() => void signOut()}>
          <LogOut className="size-3.5" />
          تسجيل الخروج
        </Button>
      </Card>
    </div>
  );
}
