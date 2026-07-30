import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, LogOut, Pencil, Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { SubscriptionBanner } from "@/components/SubscriptionBanner";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { usePlans } from "@/hooks/usePlans";
import { buildRenewWhatsAppLink } from "@/lib/whatsapp";
import type { Client } from "@/types/domain";

interface ClientFormState {
  id: number | null;
  full_name: string;
  weight: string;
  fitness_goal: string;
  training_program: string;
}

const EMPTY_FORM: ClientFormState = { id: null, full_name: "", weight: "", fitness_goal: "", training_program: "" };

export function DashboardPage() {
  const navigate = useNavigate();
  const { coach, signOut, refreshCoach } = useAuthStore();
  const { plans } = usePlans();
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [form, setForm] = useState<ClientFormState>(EMPTY_FORM);
  const [formOpen, setFormOpen] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const plansRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (coach) return;
    const timeout = setTimeout(() => setShowRetry(true), 4000);
    return () => clearTimeout(timeout);
  }, [coach]);

  useEffect(() => {
    if (!coach) return;
    supabase
      .from("clients")
      .select("*")
      .eq("coach_id", coach.id)
      .order("id", { ascending: false })
      .then(({ data }) => {
        setClients((data as Client[]) ?? []);
        setLoadingClients(false);
      });
  }, [coach]);

  if (!coach) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center text-ink-muted">
        <p>جارٍ تحميل بيانات حسابك...</p>
        {showRetry && (
          <div className="flex flex-col items-center gap-3">
            <p className="max-w-xs text-sm text-ink-faint">
              يبدو أن هذا يستغرق وقتاً أطول من المعتاد. جرّب إعادة المحاولة أو سجّل الدخول من جديد.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => void refreshCoach()}>
                إعادة المحاولة
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  void signOut();
                  navigate("/login");
                }}
              >
                تسجيل الخروج
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  async function refreshClients() {
    const { data } = await supabase.from("clients").select("*").eq("coach_id", coach!.id).order("id", { ascending: false });
    setClients((data as Client[]) ?? []);
  }

  async function handleSaveClient() {
    if (!form.full_name.trim()) return;
    const payload = {
      coach_id: coach!.id,
      full_name: form.full_name.trim(),
      weight: form.weight ? Number(form.weight) : null,
      fitness_goal: form.fitness_goal.trim() || null,
      training_program: form.training_program.trim() || null,
    };

    if (form.id) {
      await supabase.from("clients").update(payload).eq("id", form.id);
    } else {
      await supabase.from("clients").insert(payload);
    }
    setForm(EMPTY_FORM);
    setFormOpen(false);
    await refreshClients();
  }

  async function handleDeleteClient(id: number) {
    await supabase.from("clients").delete().eq("id", id);
    await refreshClients();
  }

  function startEdit(client: Client) {
    setForm({
      id: client.id,
      full_name: client.full_name,
      weight: client.weight?.toString() ?? "",
      fitness_goal: client.fitness_goal ?? "",
      training_program: client.training_program ?? "",
    });
    setFormOpen(true);
  }

  async function handleLogout() {
    await signOut();
    navigate("/");
  }

  return (
    <div className="min-h-svh bg-canvas">
      <SubscriptionBanner coach={coach} onUpgradeClick={() => plansRef.current?.scrollIntoView({ behavior: "smooth" })} />

      <header className="border-b border-border bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-brand-500 text-white">
              <Dumbbell className="size-5" />
            </div>
            <div>
              <p className="font-bold text-ink">{coach.full_name || coach.username}</p>
              <p className="text-xs text-ink-faint">@{coach.username}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="size-4" />
            تسجيل الخروج
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5 text-brand-500" />
                عملاؤك ({clients.length})
              </CardTitle>
              <CardDescription>أضف عملاءك وتابع أوزانهم وأهدافهم وبرامجهم التدريبية.</CardDescription>
            </div>
            <Button size="sm" onClick={() => (formOpen ? setFormOpen(false) : (setForm(EMPTY_FORM), setFormOpen(true)))}>
              <Plus className="size-4" />
              عميل جديد
            </Button>
          </CardHeader>

          {formOpen && (
            <div className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-border bg-surface-muted p-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="c_name">اسم العميل</Label>
                <Input id="c_name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="c_weight">الوزن (كغ)</Label>
                <Input id="c_weight" type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="c_goal">الهدف</Label>
                <Input id="c_goal" value={form.fitness_goal} onChange={(e) => setForm({ ...form, fitness_goal: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="c_program">البرنامج التدريبي</Label>
                <Input
                  id="c_program"
                  value={form.training_program}
                  onChange={(e) => setForm({ ...form, training_program: e.target.value })}
                />
              </div>
              <div className="flex items-end gap-2 sm:col-span-2">
                <Button onClick={handleSaveClient}>{form.id ? "حفظ التعديلات" : "إضافة العميل"}</Button>
                <Button variant="ghost" onClick={() => setFormOpen(false)}>
                  إلغاء
                </Button>
              </div>
            </div>
          )}

          {loadingClients ? (
            <p className="py-8 text-center text-sm text-ink-faint">جارٍ التحميل...</p>
          ) : clients.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-faint">لا يوجد عملاء بعد — أضف أول عميل لك.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-border text-ink-faint">
                    <th className="py-2 font-medium">الاسم</th>
                    <th className="py-2 font-medium">الوزن</th>
                    <th className="py-2 font-medium">الهدف</th>
                    <th className="py-2 font-medium">البرنامج</th>
                    <th className="py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="py-3 font-medium text-ink">{c.full_name}</td>
                      <td className="py-3 text-ink-muted">{c.weight ? `${c.weight} كغ` : "—"}</td>
                      <td className="py-3 text-ink-muted">{c.fitness_goal || "—"}</td>
                      <td className="py-3 text-ink-muted">{c.training_program || "—"}</td>
                      <td className="py-3">
                        <div className="flex justify-end gap-1.5">
                          <Button variant="ghost" size="sm" onClick={() => startEdit(c)}>
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteClient(c.id)}>
                            <Trash2 className="size-3.5 text-rose-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div ref={plansRef} className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-ink">خطط الاشتراك</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.code}>
                <p className="text-sm font-semibold text-ink-muted">{plan.label}</p>
                <p className="mt-1 text-2xl font-extrabold text-ink">
                  {plan.price_dzd.toLocaleString("ar-DZ")} <span className="text-sm font-medium text-ink-faint">دج</span>
                </p>
                <p className="mt-1 text-xs text-ink-faint">لمدة {plan.duration_days} يوماً</p>
                <a
                  href={buildRenewWhatsAppLink({
                    coachName: coach.full_name || coach.username,
                    email: coach.email ?? "",
                    planLabel: plan.label,
                    priceDzd: plan.price_dzd,
                  })}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 block"
                >
                  <Button className="w-full" variant="secondary">
                    تفعيل عبر واتساب
                  </Button>
                </a>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
