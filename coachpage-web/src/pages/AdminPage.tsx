import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { usePlans } from "@/hooks/usePlans";
import type { Coach, SubscriptionPlanCode } from "@/types/domain";

const STATUS_TONE: Record<Coach["subscription_status"], "brand" | "amber" | "rose" | "sky"> = {
  ACTIVE: "brand",
  TRIAL: "sky",
  EXPIRED: "rose",
  PENDING_APPROVAL: "amber",
};
const STATUS_LABEL: Record<Coach["subscription_status"], string> = {
  ACTIVE: "نشط",
  TRIAL: "تجربة مجانية",
  EXPIRED: "منتهي",
  PENDING_APPROVAL: "بانتظار المراجعة",
};

export function AdminPage() {
  const navigate = useNavigate();
  const { signOut } = useAuthStore();
  const { plans } = usePlans();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState<number | null>(null);

  async function loadCoaches() {
    const { data } = await supabase.from("coaches").select("*").order("registered_at", { ascending: false });
    setCoaches((data as Coach[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadCoaches();
  }, []);

  const stats = {
    total: coaches.length,
    active: coaches.filter((c) => c.subscription_status === "ACTIVE").length,
    expired: coaches.filter((c) => c.subscription_status === "EXPIRED").length,
    pending: coaches.filter((c) => c.subscription_status === "PENDING_APPROVAL").length,
  };

  async function handleActivate(coachId: number, planCode: SubscriptionPlanCode) {
    const plan = plans.find((p) => p.code === planCode);
    if (!plan) return;
    const expiresAt = new Date(Date.now() + plan.duration_days * 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from("coaches")
      .update({ subscription_status: "ACTIVE", subscription_plan: planCode, subscription_expires_at: expiresAt })
      .eq("id", coachId);
    setActivatingId(null);
    await loadCoaches();
  }

  async function handleSuspend(coachId: number) {
    await supabase.from("coaches").update({ subscription_status: "EXPIRED" }).eq("id", coachId);
    await loadCoaches();
  }

  async function handleLogout() {
    await signOut();
    navigate("/");
  }

  return (
    <div className="min-h-svh bg-canvas">
      <header className="border-b border-border bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-ink text-white">
              <ShieldCheck className="size-5" />
            </div>
            <p className="font-bold text-ink">لوحة المشرف الرئيسي</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="size-4" />
            تسجيل الخروج
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "إجمالي المدربين", value: stats.total },
            { label: "الحسابات النشطة", value: stats.active },
            { label: "الحسابات المنتهية", value: stats.expired },
            { label: "طلبات معلقة", value: stats.pending },
          ].map((s) => (
            <Card key={s.label} className="text-center">
              <p className="text-3xl font-extrabold text-ink">{s.value}</p>
              <p className="mt-1 text-xs text-ink-faint">{s.label}</p>
            </Card>
          ))}
        </div>

        <Card>
          <CardTitle>المدربون</CardTitle>
          <CardDescription className="mb-4">إدارة حسابات واشتراكات المدربين على المنصة.</CardDescription>

          {loading ? (
            <p className="py-8 text-center text-sm text-ink-faint">جارٍ التحميل...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-border text-ink-faint">
                    <th className="py-2 font-medium">الاسم</th>
                    <th className="py-2 font-medium">البريد</th>
                    <th className="py-2 font-medium">الهاتف</th>
                    <th className="py-2 font-medium">الحالة</th>
                    <th className="py-2 font-medium">تاريخ الانتهاء</th>
                    <th className="py-2 font-medium">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {coaches.map((c) => (
                    <tr key={c.id} className="border-b border-border align-top last:border-0">
                      <td className="py-3 font-medium text-ink">{c.full_name || c.username}</td>
                      <td className="py-3 text-ink-muted">{c.email || "—"}</td>
                      <td className="py-3 text-ink-muted" dir="ltr">
                        {c.phone_number || "—"}
                      </td>
                      <td className="py-3">
                        <Badge tone={STATUS_TONE[c.subscription_status]}>{STATUS_LABEL[c.subscription_status]}</Badge>
                      </td>
                      <td className="py-3 text-ink-muted">
                        {c.subscription_expires_at ? new Date(c.subscription_expires_at).toLocaleDateString("ar-DZ") : "—"}
                      </td>
                      <td className="py-3">
                        <div className="flex flex-col items-end gap-2">
                          {activatingId === c.id ? (
                            <div className="flex flex-wrap justify-end gap-1.5">
                              {plans.map((p) => (
                                <Button key={p.code} size="sm" onClick={() => handleActivate(c.id, p.code)}>
                                  {p.label}
                                </Button>
                              ))}
                              <Button size="sm" variant="ghost" onClick={() => setActivatingId(null)}>
                                إلغاء
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-1.5">
                              <Button size="sm" onClick={() => setActivatingId(c.id)}>
                                تفعيل الحساب
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleSuspend(c.id)}>
                                تجميد
                              </Button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
