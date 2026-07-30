import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Search, ShieldCheck, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input, Label } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { usePlans } from "@/hooks/usePlans";
import type { Coach, PlatformSettings, SubscriptionPlanCode, SubscriptionStatus } from "@/types/domain";

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
const STATUS_FILTERS: Array<{ value: SubscriptionStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "كل الحالات" },
  { value: "TRIAL", label: "تجربة مجانية" },
  { value: "ACTIVE", label: "نشط" },
  { value: "EXPIRED", label: "منتهي" },
  { value: "PENDING_APPROVAL", label: "بانتظار المراجعة" },
];

type CoachRow = Coach & { clients: { count: number }[] };

export function AdminPage() {
  const navigate = useNavigate();
  const { signOut } = useAuthStore();
  const { plans } = usePlans();
  const [coaches, setCoaches] = useState<CoachRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState<number | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "ALL">("ALL");

  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  async function loadCoaches() {
    const { data } = await supabase
      .from("coaches")
      .select("*, clients(count)")
      .order("registered_at", { ascending: false });
    setCoaches((data as CoachRow[]) ?? []);
    setLoading(false);
  }

  async function loadSettings() {
    const { data } = await supabase.from("platform_settings").select("*").maybeSingle();
    setSettings((data as PlatformSettings) ?? null);
  }

  useEffect(() => {
    void loadCoaches();
    void loadSettings();
  }, []);

  const stats = {
    total: coaches.length,
    active: coaches.filter((c) => c.subscription_status === "ACTIVE").length,
    expired: coaches.filter((c) => c.subscription_status === "EXPIRED").length,
    pending: coaches.filter((c) => c.subscription_status === "PENDING_APPROVAL").length,
  };

  const filteredCoaches = useMemo(() => {
    const term = search.trim().toLowerCase();
    return coaches.filter((c) => {
      if (statusFilter !== "ALL" && c.subscription_status !== statusFilter) return false;
      if (!term) return true;
      return (
        c.full_name?.toLowerCase().includes(term) ||
        c.username?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.phone_number?.toLowerCase().includes(term)
      );
    });
  }, [coaches, search, statusFilter]);

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

  async function handleDelete(coachId: number) {
    await supabase.from("clients").delete().eq("coach_id", coachId);
    await supabase.from("coaches").delete().eq("id", coachId);
    setConfirmingDeleteId(null);
    await loadCoaches();
  }

  async function handleSaveSettings() {
    if (!settings) return;
    setSavingSettings(true);
    await supabase
      .from("platform_settings")
      .update({
        owner_whatsapp: settings.owner_whatsapp,
        owner_ccp: settings.owner_ccp,
        coach_monthly_price: settings.coach_monthly_price,
        platform_name: settings.platform_name,
      })
      .eq("id", settings.id);
    setSavingSettings(false);
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
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>المدربون</CardTitle>
              <CardDescription>إدارة حسابات واشتراكات المدربين على المنصة.</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
                <Input
                  placeholder="ابحث بالاسم، اسم المستخدم، البريد أو الهاتف"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pe-9 sm:w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as SubscriptionStatus | "ALL")}
                className="h-11 rounded-xl border border-border-strong bg-surface px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400/40"
              >
                {STATUS_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p className="py-8 text-center text-sm text-ink-faint">جارٍ التحميل...</p>
          ) : filteredCoaches.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-faint">لا توجد نتائج مطابقة.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-border text-ink-faint">
                    <th className="py-2 font-medium">الاسم</th>
                    <th className="py-2 font-medium">البريد</th>
                    <th className="py-2 font-medium">الهاتف</th>
                    <th className="py-2 font-medium">العملاء</th>
                    <th className="py-2 font-medium">الحالة</th>
                    <th className="py-2 font-medium">تاريخ الانتهاء</th>
                    <th className="py-2 font-medium">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoaches.map((c) => (
                    <tr key={c.id} className="border-b border-border align-top last:border-0">
                      <td className="py-3 font-medium text-ink">{c.full_name || c.username}</td>
                      <td className="py-3 text-ink-muted">{c.email || "—"}</td>
                      <td className="py-3 text-ink-muted" dir="ltr">
                        {c.phone_number || "—"}
                      </td>
                      <td className="py-3 text-ink-muted">
                        <span className="inline-flex items-center gap-1">
                          <Users className="size-3.5" />
                          {c.clients?.[0]?.count ?? 0}
                        </span>
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
                          ) : confirmingDeleteId === c.id ? (
                            <div className="flex flex-wrap justify-end gap-1.5">
                              <span className="self-center text-xs text-rose-600">حذف نهائي مع كل عملائه؟</span>
                              <Button size="sm" variant="destructive" onClick={() => handleDelete(c.id)}>
                                تأكيد الحذف
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setConfirmingDeleteId(null)}>
                                إلغاء
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap justify-end gap-1.5">
                              <Button size="sm" onClick={() => setActivatingId(c.id)}>
                                تفعيل الحساب
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleSuspend(c.id)}>
                                تجميد
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setConfirmingDeleteId(c.id)}>
                                <Trash2 className="size-3.5 text-rose-500" />
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

        {settings && (
          <Card className="mt-8">
            <CardTitle>إعدادات المنصة</CardTitle>
            <CardDescription className="mb-4">
              رقم واتساب التفعيل والأسعار المعروضة للمدربين — تُقرأ مباشرة من الموقع.
            </CardDescription>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="s_name">اسم المنصة</Label>
                <Input
                  id="s_name"
                  value={settings.platform_name}
                  onChange={(e) => setSettings({ ...settings, platform_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="s_whatsapp">رقم واتساب التفعيل</Label>
                <Input
                  id="s_whatsapp"
                  dir="ltr"
                  value={settings.owner_whatsapp}
                  onChange={(e) => setSettings({ ...settings, owner_whatsapp: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="s_ccp">CCP / بريدي موب</Label>
                <Input
                  id="s_ccp"
                  dir="ltr"
                  value={settings.owner_ccp}
                  onChange={(e) => setSettings({ ...settings, owner_ccp: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="s_price">السعر الشهري الافتراضي (دج)</Label>
                <Input
                  id="s_price"
                  type="number"
                  value={settings.coach_monthly_price}
                  onChange={(e) => setSettings({ ...settings, coach_monthly_price: Number(e.target.value) })}
                />
              </div>
            </div>
            <Button className="mt-4" size="sm" onClick={handleSaveSettings} disabled={savingSettings}>
              حفظ الإعدادات
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
}
