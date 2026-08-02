import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, CheckCircle2, Loader2, Plus, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import type { Appointment, AppointmentStatus, Client } from "@/types/domain";

interface FormState {
  client_id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: string;
  location: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  client_id: "",
  title: "",
  scheduled_at: "",
  duration_minutes: "30",
  location: "",
  notes: "",
};

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  SCHEDULED: "مجدول",
  COMPLETED: "منجز",
  CANCELLED: "ملغى",
};
const STATUS_TONE: Record<AppointmentStatus, "brand" | "amber" | "rose"> = {
  SCHEDULED: "brand",
  COMPLETED: "amber",
  CANCELLED: "rose",
};

function toLocalInputValue(d = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AppointmentsPage() {
  const { coach } = useAuthStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM, scheduled_at: toLocalInputValue() });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!coach) return;
    void loadAll();
  }, [coach]);

  async function loadAll() {
    const [{ data: clientRows }, { data: apptRows }] = await Promise.all([
      supabase.from("clients").select("*").eq("coach_id", coach!.id).order("full_name"),
      supabase.from("appointments").select("*").eq("coach_id", coach!.id).order("scheduled_at"),
    ]);
    setClients((clientRows as Client[]) ?? []);
    setAppointments((apptRows as Appointment[]) ?? []);
    setLoading(false);
  }

  function clientName(id: number | null) {
    if (!id) return "بدون عميل محدد";
    return clients.find((c) => c.id === id)?.full_name ?? "عميل محذوف";
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.scheduled_at) return;
    setSaving(true);
    const { error } = await supabase.from("appointments").insert({
      coach_id: coach!.id,
      client_id: form.client_id ? Number(form.client_id) : null,
      title: form.title.trim(),
      scheduled_at: new Date(form.scheduled_at).toISOString(),
      duration_minutes: Number(form.duration_minutes) || 30,
      location: form.location.trim() || null,
      notes: form.notes.trim() || null,
    });
    setSaving(false);
    if (!error) {
      setForm({ ...EMPTY_FORM, scheduled_at: toLocalInputValue() });
      setFormOpen(false);
      await loadAll();
    }
  }

  async function updateStatus(id: number, status: AppointmentStatus) {
    await supabase.from("appointments").update({ status }).eq("id", id);
    await loadAll();
  }

  async function handleDelete(id: number) {
    if (!confirm("حذف هذا الموعد؟")) return;
    await supabase.from("appointments").delete().eq("id", id);
    await loadAll();
  }

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const up: Appointment[] = [];
    const pa: Appointment[] = [];
    for (const a of appointments) {
      if (a.status === "SCHEDULED" && new Date(a.scheduled_at).getTime() >= now) up.push(a);
      else pa.push(a);
    }
    up.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
    pa.sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
    return { upcoming: up, past: pa };
  }, [appointments]);

  if (!coach || loading) {
    return <div className="flex min-h-svh items-center justify-center text-ink-muted">جارٍ التحميل...</div>;
  }

  function AppointmentRow({ appt }: { appt: Appointment }) {
    const date = new Date(appt.scheduled_at);
    return (
      <div className="flex flex-col gap-3 border-b border-border py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-bold text-ink">
            {appt.title}
            <Badge tone={STATUS_TONE[appt.status]}>{STATUS_LABEL[appt.status]}</Badge>
          </p>
          <p className="mt-0.5 text-xs text-ink-faint">
            {clientName(appt.client_id)} · {date.toLocaleDateString("ar-DZ")} ·{" "}
            {date.toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" })} ({appt.duration_minutes} د)
            {appt.location && ` · ${appt.location}`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {appt.status === "SCHEDULED" && (
            <>
              <button
                type="button"
                title="تحديد كمنجز"
                onClick={() => updateStatus(appt.id, "COMPLETED")}
                className="flex size-8 items-center justify-center rounded-lg text-ink-faint hover:bg-surface-muted hover:text-brand-600"
              >
                <CheckCircle2 className="size-4" />
              </button>
              <button
                type="button"
                title="إلغاء"
                onClick={() => updateStatus(appt.id, "CANCELLED")}
                className="flex size-8 items-center justify-center rounded-lg text-ink-faint hover:bg-surface-muted hover:text-rose-500"
              >
                <XCircle className="size-4" />
              </button>
            </>
          )}
          <button
            type="button"
            title="حذف"
            onClick={() => handleDelete(appt.id)}
            className="flex size-8 items-center justify-center rounded-lg text-ink-faint hover:bg-surface-muted hover:text-rose-500"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-canvas">
      <header className="border-b border-border bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex size-9 items-center justify-center rounded-xl border border-border-strong text-ink-muted hover:bg-surface-muted"
            >
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
            <div>
              <p className="font-bold text-ink">المواعيد</p>
              <p className="text-xs text-ink-faint">جدولة جلسات وحصص التدريب مع عملائك</p>
            </div>
          </div>
          <Button size="sm" onClick={() => setFormOpen((v) => !v)}>
            <Plus className="size-4" />
            موعد جديد
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        {formOpen && (
          <Card className="mb-6">
            <CardTitle className="mb-4">إضافة موعد</CardTitle>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="a_client">العميل</Label>
                  <select
                    id="a_client"
                    value={form.client_id}
                    onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-border-strong bg-surface px-4 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400/40"
                  >
                    <option value="">بدون عميل محدد</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="a_title">عنوان الموعد</Label>
                  <Input
                    id="a_title"
                    required
                    placeholder="مثال: حصة تدريب"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="a_time">التاريخ والوقت</Label>
                  <Input
                    id="a_time"
                    type="datetime-local"
                    required
                    dir="ltr"
                    value={form.scheduled_at}
                    onChange={(e) => setForm((f) => ({ ...f, scheduled_at: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="a_duration">المدة (دقيقة)</Label>
                  <Input
                    id="a_duration"
                    type="number"
                    dir="ltr"
                    value={form.duration_minutes}
                    onChange={(e) => setForm((f) => ({ ...f, duration_minutes: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="a_location">المكان</Label>
                  <Input
                    id="a_location"
                    placeholder="مثال: النادي، عن بعد..."
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="a_notes">ملاحظات</Label>
                <textarea
                  id="a_notes"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400/40"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                  حفظ الموعد
                </Button>
                <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
                  إلغاء
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Card className="mb-4">
          <CardTitle className="mb-1 flex items-center gap-2">
            <Calendar className="size-4 text-brand-500" />
            المواعيد القادمة
          </CardTitle>
          {upcoming.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-faint">لا توجد مواعيد قادمة.</p>
          ) : (
            <div className="mt-3 flex flex-col">
              {upcoming.map((a) => (
                <AppointmentRow key={a.id} appt={a} />
              ))}
            </div>
          )}
        </Card>

        {past.length > 0 && (
          <Card>
            <CardTitle className="mb-1">السجل</CardTitle>
            <div className="mt-3 flex flex-col">
              {past.map((a) => (
                <AppointmentRow key={a.id} appt={a} />
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
