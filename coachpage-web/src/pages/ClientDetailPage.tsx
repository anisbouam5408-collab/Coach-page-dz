import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  Camera,
  ChevronDown,
  Dumbbell,
  Eye,
  FileText,
  Heart,
  Loader2,
  Plus,
  RefreshCw,
  Ruler,
  Save,
  Share2,
  Target,
  Trash2,
  TrendingUp,
  User,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useLanguage } from "@/lib/i18n";
import type {
  Client,
  ClientStatus,
  Coach,
  Exercise,
  Invoice,
  InvoiceStatus,
  MeasurementLog,
  ProgressPhoto,
  ProgressPhotoType,
  TrainingDay,
  TrainingExercise,
  TrainingProgram,
  WeightLog,
} from "@/types/domain";

type DayWithExercises = TrainingDay & { training_exercises: TrainingExercise[] };

const ACTIVITY_LEVELS: Array<{ value: string; label: string }> = [
  { value: "sedentary", label: "خامل" },
  { value: "light", label: "نشاط خفيف" },
  { value: "moderate", label: "نشاط متوسط" },
  { value: "active", label: "نشيط" },
  { value: "very_active", label: "نشيط جداً" },
];

const STATUS_TONE: Record<ClientStatus, "brand" | "amber" | "rose"> = {
  ACTIVE: "brand",
  PAUSED: "amber",
  EXPIRED: "rose",
};
const STATUS_LABEL: Record<ClientStatus, string> = {
  ACTIVE: "نشط",
  PAUSED: "متوقف",
  EXPIRED: "منتهي",
};

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diffMs = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function ClientDetailPage() {
  const { id } = useParams();
  const { coach } = useAuthStore();
  const { t } = useLanguage();
  const clientId = Number(id);

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "training" | "progress" | "payments">("overview");

  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [recentLogCount, setRecentLogCount] = useState(0);

  const [renewOpen, setRenewOpen] = useState(false);
  const [renewSaving, setRenewSaving] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  async function loadClient() {
    const { data } = await supabase.from("clients").select("*").eq("id", clientId).maybeSingle();
    setClient(data as Client | null);
    setLoading(false);
  }

  useEffect(() => {
    if (!coach || !clientId) return;
    void loadClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coach, clientId]);

  useEffect(() => {
    if (!client) return;
    const since = new Date();
    since.setDate(since.getDate() - 28);
    supabase
      .from("weight_logs")
      .select("weight, date")
      .eq("client_id", client.id)
      .order("date", { ascending: false })
      .then(({ data }) => {
        const logs = (data as { weight: number; date: string }[]) ?? [];
        setLatestWeight(logs[0]?.weight ?? client.weight ?? null);
        setRecentLogCount(logs.filter((l) => new Date(l.date) >= since).length);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client?.id]);

  const remainingDays = client ? daysUntil(client.subscription_expires_at) : null;
  const adherencePct = Math.min(100, Math.round((recentLogCount / 4) * 100));

  async function handleRenew(days: number) {
    if (!client) return;
    setRenewSaving(true);
    const base =
      remainingDays !== null && remainingDays > 0 && client.subscription_expires_at
        ? new Date(client.subscription_expires_at)
        : new Date();
    base.setDate(base.getDate() + days);
    await supabase
      .from("clients")
      .update({ subscription_expires_at: base.toISOString().slice(0, 10), status: "ACTIVE" })
      .eq("id", client.id);
    await loadClient();
    setRenewSaving(false);
    setRenewOpen(false);
  }

  function handleSendLink() {
    if (!client) return;
    const text = `مرحباً ${client.full_name}، هذا كود الوصول الخاص بك في CoachPage DZ: ${client.access_code}`;
    if (client.phone_number) {
      window.open(`https://wa.me/${client.phone_number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`, "_blank");
    } else {
      void navigator.clipboard.writeText(text);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  }

  if (!coach || loading) {
    return <div className="flex min-h-svh items-center justify-center text-ink-muted">جارٍ التحميل...</div>;
  }

  if (!client) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 text-ink-muted">
        <p>لم يتم العثور على هذا العميل.</p>
        <Link to="/dashboard">
          <Button size="sm">العودة للوحة التحكم</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-canvas">
      <header className="border-b border-border bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex size-9 items-center justify-center rounded-xl border border-border-strong text-ink-muted hover:bg-surface-muted"
            >
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
            <div>
              <p className="font-bold text-ink">{client.full_name}</p>
              <p className="text-xs text-ink-faint">{client.phone_number || client.email || "—"}</p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-6">
        <SummaryCard client={client} latestWeight={latestWeight} remainingDays={remainingDays} adherencePct={adherencePct} />

        <QuickActions
          onRecordWeight={() => setTab("progress")}
          onRenew={() => setRenewOpen((v) => !v)}
          onSendLink={handleSendLink}
          onGenerateWorkout={() => setTab("training")}
          onViewProgress={() => setTab("progress")}
          linkCopied={linkCopied}
        />

        {renewOpen && (
          <Card className="mb-6 border-2 border-brand-500">
            <CardTitle className="mb-3">تجديد الاشتراك</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => handleRenew(30)} disabled={renewSaving}>
                {renewSaving && <Loader2 className="size-4 animate-spin" />}+ 30 يوم
              </Button>
              <Button size="sm" onClick={() => handleRenew(90)} disabled={renewSaving}>
                + 90 يوم
              </Button>
              <Button size="sm" onClick={() => handleRenew(150)} disabled={renewSaving}>
                + 150 يوم
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setRenewOpen(false)}>
                إلغاء
              </Button>
            </div>
          </Card>
        )}

        <div className="mb-6 flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-surface-muted p-1">
          {(
            [
              { key: "overview", label: t("clientDetail.tab.overview") },
              { key: "progress", label: t("clientDetail.tab.measurements") },
              { key: "training", label: t("clientDetail.tab.sessions") },
              { key: "payments", label: t("clientDetail.tab.payments") },
            ] as const
          ).map((tabDef) => (
            <button
              key={tabDef.key}
              onClick={() => setTab(tabDef.key)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                tab === tabDef.key ? "bg-brand-500 text-white shadow-sm" : "text-ink-muted hover:text-ink"
              }`}
            >
              {tabDef.label}
            </button>
          ))}
        </div>

        {tab === "overview" && <OverviewTab client={client} onSaved={setClient} />}
        {tab === "training" && <TrainingTab coach={coach} client={client} />}
        {tab === "progress" && <ProgressTab client={client} />}
        {tab === "payments" && <PaymentsTab client={client} coach={coach} />}
      </main>
    </div>
  );
}

function SummaryCard({
  client,
  latestWeight,
  remainingDays,
  adherencePct,
}: {
  client: Client;
  latestWeight: number | null;
  remainingDays: number | null;
  adherencePct: number;
}) {
  const expired = client.status === "EXPIRED" || (remainingDays !== null && remainingDays < 0);
  const urgent = !expired && remainingDays !== null && remainingDays <= 5;

  return (
    <Card className="mb-4 border-r-4 border-r-brand-500">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-ink">{client.full_name}</h2>
            <Badge tone={STATUS_TONE[client.status]}>{STATUS_LABEL[client.status]}</Badge>
          </div>
          <p className="text-sm text-ink-muted">{client.fitness_goal || "لا يوجد هدف محدد"}</p>
        </div>
        <div
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
            expired ? "bg-rose-500/10 text-rose-600" : urgent ? "bg-amber-400/15 text-amber-700" : "bg-brand-50 text-brand-700"
          }`}
        >
          {remainingDays === null
            ? "بلا تاريخ انتهاء"
            : expired
              ? "الاشتراك منتهي"
              : `متبقي ${remainingDays} ${remainingDays === 1 ? "يوم" : "أيام"}`}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-surface-muted p-3 text-center">
          <p className="text-lg font-extrabold text-ink">{latestWeight ? `${latestWeight} كغ` : "—"}</p>
          <p className="mt-0.5 text-[11px] text-ink-faint">الوزن الحالي</p>
        </div>
        <div className="rounded-xl bg-surface-muted p-3 text-center">
          <p className="text-lg font-extrabold text-ink">{client.age ? `${client.age} سنة` : "—"}</p>
          <p className="mt-0.5 text-[11px] text-ink-faint">العمر</p>
        </div>
        <div className="rounded-xl bg-surface-muted p-3 text-center">
          <p className="text-lg font-extrabold text-ink">{STATUS_LABEL[client.status]}</p>
          <p className="mt-0.5 text-[11px] text-ink-faint">حالة الاشتراك</p>
        </div>
        <div className="rounded-xl bg-surface-muted p-3">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-[11px] text-ink-faint">نسبة الالتزام</p>
            <p className="text-xs font-bold text-ink">{adherencePct}%</p>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className={`h-full rounded-full ${
                adherencePct >= 70 ? "bg-brand-500" : adherencePct >= 40 ? "bg-amber-400" : "bg-rose-500"
              }`}
              style={{ width: `${adherencePct}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

function QuickActionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  badge,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-w-[92px] shrink-0 flex-col items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-3 text-center transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Icon className="size-4" />
      </span>
      <span className="text-[11px] font-semibold leading-tight text-ink">{label}</span>
      {badge && <span className="text-[9px] font-bold text-amber-600">{badge}</span>}
    </button>
  );
}

function QuickActions({
  onRecordWeight,
  onRenew,
  onSendLink,
  onGenerateWorkout,
  onViewProgress,
  linkCopied,
}: {
  onRecordWeight: () => void;
  onRenew: () => void;
  onSendLink: () => void;
  onGenerateWorkout: () => void;
  onViewProgress: () => void;
  linkCopied: boolean;
}) {
  return (
    <div className="mb-6 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      <QuickActionButton icon={TrendingUp} label="تسجيل الوزن" onClick={onRecordWeight} />
      <QuickActionButton icon={RefreshCw} label="تجديد الاشتراك" onClick={onRenew} />
      <QuickActionButton icon={Share2} label={linkCopied ? "تم النسخ ✓" : "إرسال رابط للعميل"} onClick={onSendLink} />
      <QuickActionButton icon={Utensils} label="توليد خطة غذائية" badge="قريباً" disabled />
      <QuickActionButton icon={Dumbbell} label="توليد برنامج تدريبي" onClick={onGenerateWorkout} />
      <QuickActionButton icon={Eye} label="عرض التقدم" onClick={onViewProgress} />
    </div>
  );
}

function CollapsibleSection({
  icon: Icon,
  title,
  defaultOpen = false,
  children,
}: {
  icon: LucideIcon;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 py-3.5 text-right"
      >
        <span className="flex items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Icon className="size-4" />
          </span>
          <span className="text-sm font-bold text-ink">{title}</span>
        </span>
        <ChevronDown className={`size-4 text-ink-faint transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="grid grid-cols-1 gap-3 pb-4 sm:grid-cols-2">{children}</div>}
    </div>
  );
}

interface OverviewFormState {
  full_name: string;
  phone_number: string;
  email: string;
  age: string;
  gender: "male" | "female";
  height: string;
  weight: string;
  fitness_goal: string;
  activity_level: string;
  training_program: string;
  medical_conditions: string;
  allergies: string;
  injuries: string;
  status: ClientStatus;
  subscription_started_at: string;
  subscription_expires_at: string;
  tags: string;
  coach_notes: string;
}

function toFormState(client: Client): OverviewFormState {
  return {
    full_name: client.full_name ?? "",
    phone_number: client.phone_number ?? "",
    email: client.email ?? "",
    age: client.age?.toString() ?? "",
    gender: client.gender,
    height: client.height?.toString() ?? "",
    weight: client.weight?.toString() ?? "",
    fitness_goal: client.fitness_goal ?? "",
    activity_level: client.activity_level ?? "moderate",
    training_program: client.training_program ?? "",
    medical_conditions: client.medical_conditions ?? "",
    allergies: client.allergies ?? "",
    injuries: client.injuries ?? "",
    status: client.status,
    subscription_started_at: client.subscription_started_at ?? "",
    subscription_expires_at: client.subscription_expires_at ?? "",
    tags: client.tags?.join(", ") ?? "",
    coach_notes: client.coach_notes ?? "",
  };
}

function OverviewTab({ client, onSaved }: { client: Client; onSaved: (c: Client) => void }) {
  const [form, setForm] = useState<OverviewFormState>(() => toFormState(client));
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setForm(toFormState(client));
  }, [client]);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(toFormState(client)), [form, client]);

  const bmi = form.weight && form.height ? Number(form.weight) / (Number(form.height) / 100) ** 2 : null;

  async function handleSave() {
    setSaving(true);
    const { data, error } = await supabase
      .from("clients")
      .update({
        full_name: form.full_name.trim(),
        phone_number: form.phone_number.trim() || null,
        email: form.email.trim() || null,
        age: form.age ? Number(form.age) : null,
        gender: form.gender,
        height: form.height ? Number(form.height) : null,
        weight: form.weight ? Number(form.weight) : null,
        fitness_goal: form.fitness_goal.trim() || null,
        activity_level: form.activity_level,
        training_program: form.training_program.trim() || null,
        medical_conditions: form.medical_conditions.trim() || null,
        allergies: form.allergies.trim() || null,
        injuries: form.injuries.trim() || null,
        status: form.status,
        subscription_started_at: form.subscription_started_at || null,
        subscription_expires_at: form.subscription_expires_at || null,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        coach_notes: form.coach_notes.trim() || null,
      })
      .eq("id", client.id)
      .select()
      .single();
    setSaving(false);
    if (!error && data) {
      onSaved(data as Client);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    }
  }

  return (
    <div className="pb-24">
      <Card>
        <div className="-mt-2">
          <CollapsibleSection icon={User} title="المعلومات الأساسية" defaultOpen>
            <div>
              <Label htmlFor="o_name">اسم العميل</Label>
              <Input id="o_name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="o_phone">الهاتف</Label>
              <Input
                id="o_phone"
                dir="ltr"
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="o_email">البريد الإلكتروني</Label>
              <Input
                id="o_email"
                dir="ltr"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="o_age">العمر</Label>
              <Input id="o_age" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="o_gender">الجنس</Label>
              <select
                id="o_gender"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value as "male" | "female" })}
                className="h-11 w-full rounded-xl border border-border-strong bg-surface px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400/40"
              >
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>
            <div>
              <Label htmlFor="o_status">حالة العميل</Label>
              <select
                id="o_status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as ClientStatus })}
                className="h-11 w-full rounded-xl border border-border-strong bg-surface px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400/40"
              >
                <option value="ACTIVE">نشط</option>
                <option value="PAUSED">متوقف</option>
                <option value="EXPIRED">منتهي</option>
              </select>
            </div>
          </CollapsibleSection>

          <CollapsibleSection icon={Ruler} title="القياسات والنشاط">
            <div>
              <Label htmlFor="o_height">الطول (سم)</Label>
              <Input id="o_height" type="number" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="o_weight">الوزن (كغ)</Label>
              <Input id="o_weight" type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="o_activity">مستوى النشاط</Label>
              <select
                id="o_activity"
                value={form.activity_level}
                onChange={(e) => setForm({ ...form, activity_level: e.target.value })}
                className="h-11 w-full rounded-xl border border-border-strong bg-surface px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400/40"
              >
                {ACTIVITY_LEVELS.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
            {bmi && (
              <div className="rounded-lg bg-surface-muted px-3 py-2 text-xs text-ink-muted sm:col-span-2">
                مؤشر كتلة الجسم (BMI): <span className="font-bold text-ink">{bmi.toFixed(1)}</span>
              </div>
            )}
          </CollapsibleSection>

          <CollapsibleSection icon={Target} title="الهدف والبرنامج">
            <div>
              <Label htmlFor="o_goal">الهدف</Label>
              <Input id="o_goal" value={form.fitness_goal} onChange={(e) => setForm({ ...form, fitness_goal: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="o_program">البرنامج التدريبي</Label>
              <Input
                id="o_program"
                value={form.training_program}
                onChange={(e) => setForm({ ...form, training_program: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="o_tags">الوسوم (Tags) — افصل بفاصلة</Label>
              <Input id="o_tags" dir="ltr" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </div>
          </CollapsibleSection>

          <CollapsibleSection icon={Calendar} title="الاشتراك">
            <div>
              <Label htmlFor="o_sub_start">تاريخ بدء الاشتراك</Label>
              <Input
                id="o_sub_start"
                type="date"
                value={form.subscription_started_at}
                onChange={(e) => setForm({ ...form, subscription_started_at: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="o_sub_end">تاريخ انتهاء الاشتراك</Label>
              <Input
                id="o_sub_end"
                type="date"
                value={form.subscription_expires_at}
                onChange={(e) => setForm({ ...form, subscription_expires_at: e.target.value })}
              />
            </div>
          </CollapsibleSection>

          <CollapsibleSection icon={Heart} title="الحالة الصحية">
            <div>
              <Label htmlFor="o_medical">الأمراض</Label>
              <Input
                id="o_medical"
                value={form.medical_conditions}
                onChange={(e) => setForm({ ...form, medical_conditions: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="o_allergies">الحساسية</Label>
              <Input id="o_allergies" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="o_injuries">الإصابات</Label>
              <Input id="o_injuries" value={form.injuries} onChange={(e) => setForm({ ...form, injuries: e.target.value })} />
            </div>
          </CollapsibleSection>

          <CollapsibleSection icon={FileText} title="ملاحظات المدرب">
            <div className="flex gap-3 rounded-xl border border-border bg-surface-muted p-3 sm:col-span-2">
              <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                <FileText className="size-3.5" />
              </div>
              <div className="flex-1">
                <p className="mb-1.5 text-xs text-ink-faint">آخر ملاحظة</p>
                <textarea
                  id="o_notes"
                  value={form.coach_notes}
                  onChange={(e) => setForm({ ...form, coach_notes: e.target.value })}
                  rows={3}
                  placeholder="أضف ملاحظة عن هذا العميل..."
                  className="w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400/40"
                />
              </div>
            </div>
          </CollapsibleSection>
        </div>
      </Card>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-4">
        <div className="pointer-events-auto flex w-full max-w-5xl items-center justify-between gap-3 rounded-2xl border border-border bg-surface/95 px-4 py-3 shadow-lg backdrop-blur">
          <p className="text-xs text-ink-faint">
            {savedFlash ? "تم الحفظ ✓" : dirty ? "لديك تعديلات غير محفوظة" : "كل التعديلات محفوظة"}
          </p>
          <Button size="sm" onClick={handleSave} disabled={!dirty || saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            حفظ التعديلات
          </Button>
        </div>
      </div>
    </div>
  );
}

function TrainingTab({ coach, client }: { coach: Coach; client: Client }) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [templates, setTemplates] = useState<TrainingProgram[]>([]);
  const [details, setDetails] = useState<Record<number, DayWithExercises[]>>({});
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [exerciseForm, setExerciseForm] = useState({ name: "", muscle_group: "", is_cardio: false, notes: "" });
  const [exerciseFormOpen, setExerciseFormOpen] = useState(false);

  const [programForm, setProgramForm] = useState({
    name: "",
    split_type: "",
    notes: "",
    is_template: false,
    fromTemplateId: "",
  });
  const [programFormOpen, setProgramFormOpen] = useState(false);

  const [addingDayToProgram, setAddingDayToProgram] = useState<number | null>(null);
  const [newDayName, setNewDayName] = useState("");

  const [addingExerciseToDay, setAddingExerciseToDay] = useState<number | null>(null);
  const [exerciseEntryForm, setExerciseEntryForm] = useState({
    exercise_id: "",
    exercise_name: "",
    sets: "",
    reps: "",
    rest_seconds: "",
    is_cardio: false,
    cardio_duration_minutes: "",
    notes: "",
  });

  async function loadExercises() {
    const { data } = await supabase.from("exercises").select("*").eq("coach_id", coach.id).order("name");
    setExercises((data as Exercise[]) ?? []);
  }
  async function loadPrograms() {
    const { data } = await supabase
      .from("training_programs")
      .select("*")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false });
    setPrograms((data as TrainingProgram[]) ?? []);
  }
  async function loadTemplates() {
    const { data } = await supabase
      .from("training_programs")
      .select("*")
      .eq("coach_id", coach.id)
      .eq("is_template", true)
      .order("created_at", { ascending: false });
    setTemplates((data as TrainingProgram[]) ?? []);
  }

  useEffect(() => {
    void loadExercises();
    void loadPrograms();
    void loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coach.id, client.id]);

  async function loadProgramDetail(programId: number) {
    const { data } = await supabase
      .from("training_days")
      .select("*, training_exercises(*)")
      .eq("program_id", programId)
      .order("order_index");
    const days = ((data as DayWithExercises[]) ?? []).map((d) => ({
      ...d,
      training_exercises: [...d.training_exercises].sort((a, b) => a.order_index - b.order_index),
    }));
    setDetails((prev) => ({ ...prev, [programId]: days }));
  }

  function toggleExpand(programId: number) {
    if (expandedId === programId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(programId);
    void loadProgramDetail(programId);
  }

  async function handleAddExerciseToLibrary() {
    if (!exerciseForm.name.trim()) return;
    await supabase.from("exercises").insert({
      coach_id: coach.id,
      name: exerciseForm.name.trim(),
      muscle_group: exerciseForm.muscle_group.trim() || null,
      is_cardio: exerciseForm.is_cardio,
      notes: exerciseForm.notes.trim() || null,
    });
    setExerciseForm({ name: "", muscle_group: "", is_cardio: false, notes: "" });
    setExerciseFormOpen(false);
    await loadExercises();
  }

  async function handleDeleteExerciseFromLibrary(exerciseId: number) {
    await supabase.from("exercises").delete().eq("id", exerciseId);
    await loadExercises();
  }

  async function handleCreateProgram() {
    if (!programForm.name.trim()) return;
    const { data: created, error } = await supabase
      .from("training_programs")
      .insert({
        coach_id: coach.id,
        client_id: client.id,
        name: programForm.name.trim(),
        split_type: programForm.split_type.trim() || null,
        notes: programForm.notes.trim() || null,
        is_template: programForm.is_template,
      })
      .select()
      .single();

    if (error || !created) return;

    if (programForm.fromTemplateId) {
      const templateId = Number(programForm.fromTemplateId);
      const { data: templateDays } = await supabase
        .from("training_days")
        .select("*, training_exercises(*)")
        .eq("program_id", templateId)
        .order("order_index");
      for (const day of (templateDays as DayWithExercises[]) ?? []) {
        const { data: newDay } = await supabase
          .from("training_days")
          .insert({ program_id: created.id, name: day.name, order_index: day.order_index })
          .select()
          .single();
        if (!newDay) continue;
        const exercisesToInsert = day.training_exercises.map((ex) => ({
          training_day_id: newDay.id,
          exercise_id: ex.exercise_id,
          exercise_name: ex.exercise_name,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.rest_seconds,
          is_cardio: ex.is_cardio,
          cardio_duration_minutes: ex.cardio_duration_minutes,
          notes: ex.notes,
          order_index: ex.order_index,
        }));
        if (exercisesToInsert.length > 0) {
          await supabase.from("training_exercises").insert(exercisesToInsert);
        }
      }
    }

    setProgramForm({ name: "", split_type: "", notes: "", is_template: false, fromTemplateId: "" });
    setProgramFormOpen(false);
    await loadPrograms();
    await loadTemplates();
  }

  async function handleDeleteProgram(programId: number) {
    await supabase.from("training_programs").delete().eq("id", programId);
    if (expandedId === programId) setExpandedId(null);
    await loadPrograms();
    await loadTemplates();
  }

  async function handleAddDay(programId: number) {
    if (!newDayName.trim()) return;
    const currentDays = details[programId] ?? [];
    await supabase.from("training_days").insert({
      program_id: programId,
      name: newDayName.trim(),
      order_index: currentDays.length,
    });
    setNewDayName("");
    setAddingDayToProgram(null);
    await loadProgramDetail(programId);
  }

  async function handleDeleteDay(programId: number, dayId: number) {
    await supabase.from("training_days").delete().eq("id", dayId);
    await loadProgramDetail(programId);
  }

  async function handleAddExerciseToDay(programId: number, dayId: number) {
    if (!exerciseEntryForm.exercise_name.trim()) return;
    const currentDay = (details[programId] ?? []).find((d) => d.id === dayId);
    await supabase.from("training_exercises").insert({
      training_day_id: dayId,
      exercise_id: exerciseEntryForm.exercise_id ? Number(exerciseEntryForm.exercise_id) : null,
      exercise_name: exerciseEntryForm.exercise_name.trim(),
      sets: exerciseEntryForm.sets ? Number(exerciseEntryForm.sets) : null,
      reps: exerciseEntryForm.reps.trim() || null,
      rest_seconds: exerciseEntryForm.rest_seconds ? Number(exerciseEntryForm.rest_seconds) : null,
      is_cardio: exerciseEntryForm.is_cardio,
      cardio_duration_minutes: exerciseEntryForm.cardio_duration_minutes
        ? Number(exerciseEntryForm.cardio_duration_minutes)
        : null,
      notes: exerciseEntryForm.notes.trim() || null,
      order_index: currentDay?.training_exercises.length ?? 0,
    });
    setExerciseEntryForm({
      exercise_id: "",
      exercise_name: "",
      sets: "",
      reps: "",
      rest_seconds: "",
      is_cardio: false,
      cardio_duration_minutes: "",
      notes: "",
    });
    setAddingExerciseToDay(null);
    await loadProgramDetail(programId);
  }

  async function handleDeleteExerciseEntry(programId: number, exerciseEntryId: number) {
    await supabase.from("training_exercises").delete().eq("id", exerciseEntryId);
    await loadProgramDetail(programId);
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>مكتبة التمارين</CardTitle>
            <CardDescription>تمارين خاصة بك يمكنك إعادة استخدامها في أي برنامج.</CardDescription>
          </div>
          <Button size="sm" onClick={() => setExerciseFormOpen((v) => !v)}>
            <Plus className="size-4" />
            تمرين جديد
          </Button>
        </CardHeader>

        {exerciseFormOpen && (
          <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-border bg-surface-muted p-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="ex_name">اسم التمرين</Label>
              <Input
                id="ex_name"
                value={exerciseForm.name}
                onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="ex_muscle">المجموعة العضلية</Label>
              <Input
                id="ex_muscle"
                value={exerciseForm.muscle_group}
                onChange={(e) => setExerciseForm({ ...exerciseForm, muscle_group: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-ink-muted">
              <input
                type="checkbox"
                checked={exerciseForm.is_cardio}
                onChange={(e) => setExerciseForm({ ...exerciseForm, is_cardio: e.target.checked })}
              />
              تمرين كارديو
            </label>
            <div className="sm:col-span-2">
              <Label htmlFor="ex_notes">ملاحظات</Label>
              <Input
                id="ex_notes"
                value={exerciseForm.notes}
                onChange={(e) => setExerciseForm({ ...exerciseForm, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Button size="sm" onClick={handleAddExerciseToLibrary}>
                حفظ التمرين
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setExerciseFormOpen(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        )}

        {exercises.length === 0 ? (
          <p className="py-4 text-center text-sm text-ink-faint">لا توجد تمارين في مكتبتك بعد.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {exercises.map((ex) => (
              <Badge key={ex.id} tone={ex.is_cardio ? "sky" : "neutral"} className="gap-2">
                {ex.name}
                {ex.muscle_group && <span className="text-ink-faint">· {ex.muscle_group}</span>}
                <button onClick={() => handleDeleteExerciseFromLibrary(ex.id)} className="text-ink-faint hover:text-rose-500">
                  <Trash2 className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>البرامج التدريبية</CardTitle>
            <CardDescription>برامج تدريب مخصصة لـ {client.full_name}.</CardDescription>
          </div>
          <Button size="sm" onClick={() => setProgramFormOpen((v) => !v)}>
            <Plus className="size-4" />
            برنامج جديد
          </Button>
        </CardHeader>

        {programFormOpen && (
          <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-border bg-surface-muted p-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="pr_name">اسم البرنامج</Label>
              <Input
                id="pr_name"
                value={programForm.name}
                onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="pr_split">تقسيم التدريب (مثال: Push/Pull/Legs)</Label>
              <Input
                id="pr_split"
                value={programForm.split_type}
                onChange={(e) => setProgramForm({ ...programForm, split_type: e.target.value })}
              />
            </div>
            {templates.length > 0 && (
              <div>
                <Label htmlFor="pr_template">ابدأ من قالب (اختياري)</Label>
                <select
                  id="pr_template"
                  value={programForm.fromTemplateId}
                  onChange={(e) => setProgramForm({ ...programForm, fromTemplateId: e.target.value })}
                  className="h-11 w-full rounded-xl border border-border-strong bg-surface px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400/40"
                >
                  <option value="">بدون قالب</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <label className="flex items-center gap-2 text-sm text-ink-muted">
              <input
                type="checkbox"
                checked={programForm.is_template}
                onChange={(e) => setProgramForm({ ...programForm, is_template: e.target.checked })}
              />
              اجعله قالباً يمكن استخدامه مع عملاء آخرين
            </label>
            <div className="sm:col-span-2">
              <Label htmlFor="pr_notes">ملاحظات</Label>
              <Input
                id="pr_notes"
                value={programForm.notes}
                onChange={(e) => setProgramForm({ ...programForm, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Button size="sm" onClick={handleCreateProgram}>
                إنشاء البرنامج
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setProgramFormOpen(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        )}

        {programs.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-faint">لا توجد برامج تدريبية لهذا العميل بعد.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {programs.map((program) => (
              <div key={program.id} className="rounded-xl border border-border">
                <div className="flex items-center justify-between px-4 py-3">
                  <button onClick={() => toggleExpand(program.id)} className="flex-1 text-right">
                    <p className="font-semibold text-ink">{program.name}</p>
                    <p className="text-xs text-ink-faint">
                      {program.split_type || "بدون تقسيم"} {program.is_template && "· قالب"}
                    </p>
                  </button>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteProgram(program.id)}>
                    <Trash2 className="size-3.5 text-rose-500" />
                  </Button>
                </div>

                {expandedId === program.id && (
                  <div className="border-t border-border p-4">
                    {(details[program.id] ?? []).map((day) => (
                      <div key={day.id} className="mb-4 rounded-lg border border-border-strong p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="font-medium text-ink">{day.name}</p>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteDay(program.id, day.id)}>
                            <Trash2 className="size-3.5 text-rose-500" />
                          </Button>
                        </div>

                        {day.training_exercises.length === 0 ? (
                          <p className="text-xs text-ink-faint">لا توجد تمارين في هذا اليوم بعد.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs">
                              <thead>
                                <tr className="text-ink-faint">
                                  <th className="py-1 font-medium">التمرين</th>
                                  <th className="py-1 font-medium">مجموعات</th>
                                  <th className="py-1 font-medium">تكرارات</th>
                                  <th className="py-1 font-medium">الراحة</th>
                                  <th className="py-1 font-medium">ملاحظات</th>
                                  <th></th>
                                </tr>
                              </thead>
                              <tbody>
                                {day.training_exercises.map((ex) => (
                                  <tr key={ex.id} className="border-t border-border">
                                    <td className="py-1.5 font-medium text-ink">
                                      {ex.exercise_name}
                                      {ex.is_cardio && (
                                        <span className="text-ink-faint">
                                          {" "}
                                          · كارديو {ex.cardio_duration_minutes ? `${ex.cardio_duration_minutes} د` : ""}
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-1.5 text-ink-muted">{ex.sets ?? "—"}</td>
                                    <td className="py-1.5 text-ink-muted">{ex.reps ?? "—"}</td>
                                    <td className="py-1.5 text-ink-muted">{ex.rest_seconds ? `${ex.rest_seconds} ث` : "—"}</td>
                                    <td className="py-1.5 text-ink-muted">{ex.notes ?? "—"}</td>
                                    <td className="py-1.5">
                                      <button
                                        onClick={() => handleDeleteExerciseEntry(program.id, ex.id)}
                                        className="text-ink-faint hover:text-rose-500"
                                      >
                                        <Trash2 className="size-3" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {addingExerciseToDay === day.id ? (
                          <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-surface-muted p-3 sm:grid-cols-4">
                            <select
                              value={exerciseEntryForm.exercise_id}
                              onChange={(e) => {
                                const selected = exercises.find((x) => x.id === Number(e.target.value));
                                setExerciseEntryForm({
                                  ...exerciseEntryForm,
                                  exercise_id: e.target.value,
                                  exercise_name: selected ? selected.name : exerciseEntryForm.exercise_name,
                                  is_cardio: selected ? selected.is_cardio : exerciseEntryForm.is_cardio,
                                });
                              }}
                              className="col-span-2 h-9 rounded-lg border border-border-strong bg-surface px-2 text-xs sm:col-span-1"
                            >
                              <option value="">من المكتبة...</option>
                              {exercises.map((x) => (
                                <option key={x.id} value={x.id}>
                                  {x.name}
                                </option>
                              ))}
                            </select>
                            <Input
                              placeholder="اسم التمرين"
                              value={exerciseEntryForm.exercise_name}
                              onChange={(e) => setExerciseEntryForm({ ...exerciseEntryForm, exercise_name: e.target.value })}
                              className="col-span-2 h-9 text-xs sm:col-span-1"
                            />
                            <Input
                              placeholder="مجموعات"
                              type="number"
                              value={exerciseEntryForm.sets}
                              onChange={(e) => setExerciseEntryForm({ ...exerciseEntryForm, sets: e.target.value })}
                              className="h-9 text-xs"
                            />
                            <Input
                              placeholder="تكرارات (مثال: 8-12)"
                              value={exerciseEntryForm.reps}
                              onChange={(e) => setExerciseEntryForm({ ...exerciseEntryForm, reps: e.target.value })}
                              className="h-9 text-xs"
                            />
                            <Input
                              placeholder="الراحة (ثانية)"
                              type="number"
                              value={exerciseEntryForm.rest_seconds}
                              onChange={(e) => setExerciseEntryForm({ ...exerciseEntryForm, rest_seconds: e.target.value })}
                              className="h-9 text-xs"
                            />
                            <label className="flex items-center gap-1.5 text-xs text-ink-muted">
                              <input
                                type="checkbox"
                                checked={exerciseEntryForm.is_cardio}
                                onChange={(e) => setExerciseEntryForm({ ...exerciseEntryForm, is_cardio: e.target.checked })}
                              />
                              كارديو
                            </label>
                            {exerciseEntryForm.is_cardio && (
                              <Input
                                placeholder="مدة الكارديو (دقيقة)"
                                type="number"
                                value={exerciseEntryForm.cardio_duration_minutes}
                                onChange={(e) =>
                                  setExerciseEntryForm({ ...exerciseEntryForm, cardio_duration_minutes: e.target.value })
                                }
                                className="h-9 text-xs"
                              />
                            )}
                            <Input
                              placeholder="ملاحظات"
                              value={exerciseEntryForm.notes}
                              onChange={(e) => setExerciseEntryForm({ ...exerciseEntryForm, notes: e.target.value })}
                              className="col-span-2 h-9 text-xs"
                            />
                            <div className="col-span-2 flex gap-2 sm:col-span-4">
                              <Button size="sm" onClick={() => handleAddExerciseToDay(program.id, day.id)}>
                                إضافة
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setAddingExerciseToDay(null)}>
                                إلغاء
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button size="sm" variant="ghost" className="mt-2" onClick={() => setAddingExerciseToDay(day.id)}>
                            <Plus className="size-3.5" />
                            إضافة تمرين
                          </Button>
                        )}
                      </div>
                    ))}

                    {addingDayToProgram === program.id ? (
                      <div className="flex gap-2">
                        <Input
                          placeholder="اسم اليوم (مثال: يوم 1 - صدر)"
                          value={newDayName}
                          onChange={(e) => setNewDayName(e.target.value)}
                          className="flex-1"
                        />
                        <Button size="sm" onClick={() => handleAddDay(program.id)}>
                          إضافة
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setAddingDayToProgram(null)}>
                          إلغاء
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => setAddingDayToProgram(program.id)}>
                        <Plus className="size-3.5" />
                        إضافة يوم تدريبي
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function WeightChart({ logs }: { logs: WeightLog[] }) {
  const width = 600;
  const height = 140;
  const padding = 20;
  const values = logs.map((l) => l.weight);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = logs.map((l, i) => {
    const x = padding + (i / (logs.length - 1)) * (width - padding * 2);
    const y = height - padding - ((l.weight - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
      <polyline points={points.join(" ")} fill="none" stroke="#18a869" strokeWidth={2} />
      {logs.map((l, i) => {
        const [x, y] = points[i].split(",").map(Number);
        return <circle key={l.id} cx={x} cy={y} r={3} fill="#18a869" />;
      })}
    </svg>
  );
}

function ProgressTab({ client }: { client: Client }) {
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [measurementLogs, setMeasurementLogs] = useState<MeasurementLog[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);

  const [weightForm, setWeightForm] = useState({ date: new Date().toISOString().slice(0, 10), weight: "" });
  const [measurementForm, setMeasurementForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    body_fat_pct: "",
    chest: "",
    waist: "",
    hips: "",
    arm: "",
    thigh: "",
    notes: "",
  });
  const [uploadingType, setUploadingType] = useState<ProgressPhotoType | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  async function loadAll() {
    const [{ data: w }, { data: m }, { data: p }] = await Promise.all([
      supabase.from("weight_logs").select("*").eq("client_id", client.id).order("date"),
      supabase.from("measurement_logs").select("*").eq("client_id", client.id).order("date"),
      supabase.from("progress_photos").select("*").eq("client_id", client.id).order("taken_at", { ascending: false }),
    ]);
    setWeightLogs((w as WeightLog[]) ?? []);
    setMeasurementLogs((m as MeasurementLog[]) ?? []);
    setPhotos((p as ProgressPhoto[]) ?? []);
  }

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client.id]);

  const latestWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : client.weight;
  const bmi = latestWeight && client.height ? latestWeight / (client.height / 100) ** 2 : null;
  function bmiLabel(value: number) {
    if (value < 18.5) return "نقص وزن";
    if (value < 25) return "طبيعي";
    if (value < 30) return "زيادة وزن";
    return "سمنة";
  }

  async function handleAddWeight() {
    if (!weightForm.weight) return;
    await supabase.from("weight_logs").insert({ client_id: client.id, date: weightForm.date, weight: Number(weightForm.weight) });
    setWeightForm({ date: new Date().toISOString().slice(0, 10), weight: "" });
    await loadAll();
  }

  async function handleAddMeasurement() {
    await supabase.from("measurement_logs").insert({
      client_id: client.id,
      date: measurementForm.date,
      body_fat_pct: measurementForm.body_fat_pct ? Number(measurementForm.body_fat_pct) : null,
      chest: measurementForm.chest ? Number(measurementForm.chest) : null,
      waist: measurementForm.waist ? Number(measurementForm.waist) : null,
      hips: measurementForm.hips ? Number(measurementForm.hips) : null,
      arm: measurementForm.arm ? Number(measurementForm.arm) : null,
      thigh: measurementForm.thigh ? Number(measurementForm.thigh) : null,
      notes: measurementForm.notes.trim() || null,
    });
    setMeasurementForm({
      date: new Date().toISOString().slice(0, 10),
      body_fat_pct: "",
      chest: "",
      waist: "",
      hips: "",
      arm: "",
      thigh: "",
      notes: "",
    });
    await loadAll();
  }

  async function handleUploadPhoto(file: File, type: ProgressPhotoType) {
    setPhotoError(null);
    setUploadingType(type);
    const path = `${client.coach_id}/${client.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("progress-photos").upload(path, file);
    if (uploadError) {
      setPhotoError(uploadError.message);
      setUploadingType(null);
      return;
    }
    const { data } = supabase.storage.from("progress-photos").getPublicUrl(path);
    await supabase.from("progress_photos").insert({
      client_id: client.id,
      photo_url: data.publicUrl,
      photo_type: type,
      taken_at: new Date().toISOString().slice(0, 10),
    });
    setUploadingType(null);
    await loadAll();
  }

  async function handleDeletePhoto(photoId: number) {
    await supabase.from("progress_photos").delete().eq("id", photoId);
    await loadAll();
  }

  const photoGroups: Array<{ type: ProgressPhotoType; label: string }> = [
    { type: "before", label: "قبل" },
    { type: "after", label: "بعد" },
    { type: "progress", label: "تقدم" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="text-center">
          <p className="text-2xl font-extrabold text-ink">{latestWeight ? `${latestWeight}` : "—"}</p>
          <p className="mt-1 text-xs text-ink-faint">آخر وزن مسجل (كغ)</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-extrabold text-ink">{bmi ? bmi.toFixed(1) : "—"}</p>
          <p className="mt-1 text-xs text-ink-faint">{bmi ? bmiLabel(bmi) : "مؤشر كتلة الجسم"}</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-extrabold text-ink">
            {measurementLogs.length > 0 ? `${measurementLogs[measurementLogs.length - 1].body_fat_pct ?? "—"}%` : "—"}
          </p>
          <p className="mt-1 text-xs text-ink-faint">آخر نسبة دهون</p>
        </Card>
      </div>

      <Card>
        <CardTitle className="mb-3 flex items-center gap-2">
          <TrendingUp className="size-4 text-brand-500" />
          تطور الوزن
        </CardTitle>
        {weightLogs.length < 2 ? (
          <p className="py-6 text-center text-sm text-ink-faint">أضف وزنين على الأقل لعرض الرسم البياني.</p>
        ) : (
          <WeightChart logs={weightLogs} />
        )}

        <div className="mt-4 flex flex-wrap items-end gap-2">
          <div>
            <Label htmlFor="w_date">التاريخ</Label>
            <Input id="w_date" type="date" value={weightForm.date} onChange={(e) => setWeightForm({ ...weightForm, date: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="w_weight">الوزن (كغ)</Label>
            <Input
              id="w_weight"
              type="number"
              value={weightForm.weight}
              onChange={(e) => setWeightForm({ ...weightForm, weight: e.target.value })}
            />
          </div>
          <Button size="sm" onClick={handleAddWeight}>
            <Plus className="size-4" />
            تسجيل الوزن
          </Button>
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-3">القياسات الجسدية</CardTitle>
        {measurementLogs.length === 0 ? (
          <p className="py-4 text-center text-sm text-ink-faint">لا توجد قياسات مسجلة بعد.</p>
        ) : (
          <div className="mb-4 overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="text-ink-faint">
                  <th className="py-1 font-medium">التاريخ</th>
                  <th className="py-1 font-medium">دهون %</th>
                  <th className="py-1 font-medium">صدر</th>
                  <th className="py-1 font-medium">خصر</th>
                  <th className="py-1 font-medium">أرداف</th>
                  <th className="py-1 font-medium">ذراع</th>
                  <th className="py-1 font-medium">فخذ</th>
                </tr>
              </thead>
              <tbody>
                {measurementLogs.map((m) => (
                  <tr key={m.id} className="border-t border-border">
                    <td className="py-1.5 text-ink-muted">{new Date(m.date).toLocaleDateString("ar-DZ")}</td>
                    <td className="py-1.5 text-ink-muted">{m.body_fat_pct ?? "—"}</td>
                    <td className="py-1.5 text-ink-muted">{m.chest ?? "—"}</td>
                    <td className="py-1.5 text-ink-muted">{m.waist ?? "—"}</td>
                    <td className="py-1.5 text-ink-muted">{m.hips ?? "—"}</td>
                    <td className="py-1.5 text-ink-muted">{m.arm ?? "—"}</td>
                    <td className="py-1.5 text-ink-muted">{m.thigh ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div>
            <Label htmlFor="m_date">التاريخ</Label>
            <Input
              id="m_date"
              type="date"
              value={measurementForm.date}
              onChange={(e) => setMeasurementForm({ ...measurementForm, date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="m_fat">دهون %</Label>
            <Input
              id="m_fat"
              type="number"
              value={measurementForm.body_fat_pct}
              onChange={(e) => setMeasurementForm({ ...measurementForm, body_fat_pct: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="m_chest">صدر (سم)</Label>
            <Input
              id="m_chest"
              type="number"
              value={measurementForm.chest}
              onChange={(e) => setMeasurementForm({ ...measurementForm, chest: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="m_waist">خصر (سم)</Label>
            <Input
              id="m_waist"
              type="number"
              value={measurementForm.waist}
              onChange={(e) => setMeasurementForm({ ...measurementForm, waist: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="m_hips">أرداف (سم)</Label>
            <Input
              id="m_hips"
              type="number"
              value={measurementForm.hips}
              onChange={(e) => setMeasurementForm({ ...measurementForm, hips: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="m_arm">ذراع (سم)</Label>
            <Input
              id="m_arm"
              type="number"
              value={measurementForm.arm}
              onChange={(e) => setMeasurementForm({ ...measurementForm, arm: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="m_thigh">فخذ (سم)</Label>
            <Input
              id="m_thigh"
              type="number"
              value={measurementForm.thigh}
              onChange={(e) => setMeasurementForm({ ...measurementForm, thigh: e.target.value })}
            />
          </div>
          <div className="col-span-2 sm:col-span-4">
            <Label htmlFor="m_notes">ملاحظات</Label>
            <Input
              id="m_notes"
              value={measurementForm.notes}
              onChange={(e) => setMeasurementForm({ ...measurementForm, notes: e.target.value })}
            />
          </div>
          <Button size="sm" onClick={handleAddMeasurement} className="col-span-2 sm:col-span-4">
            <Plus className="size-4" />
            تسجيل القياسات
          </Button>
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-3 flex items-center gap-2">
          <Camera className="size-4 text-brand-500" />
          صور المتابعة
        </CardTitle>
        {photoError && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{photoError}</p>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {photoGroups.map((group) => (
            <div key={group.type}>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-ink">{group.label}</p>
                <label className="cursor-pointer text-xs font-semibold text-brand-600 hover:underline">
                  {uploadingType === group.type ? <Loader2 className="size-3.5 animate-spin" /> : "رفع صورة"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleUploadPhoto(file, group.type);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {photos
                  .filter((p) => p.photo_type === group.type)
                  .map((p) => (
                    <div key={p.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                      <img src={p.photo_url} alt={group.label} className="size-full object-cover" />
                      <button
                        onClick={() => handleDeletePhoto(p.id)}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Trash2 className="size-4 text-white" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

const PAYMENT_STATUS_LABEL: Record<InvoiceStatus, string> = {
  PENDING: "بانتظار الدفع",
  PAID: "مدفوعة",
  CANCELLED: "ملغاة",
};
const PAYMENT_STATUS_TONE: Record<InvoiceStatus, "amber" | "brand" | "rose"> = {
  PENDING: "amber",
  PAID: "brand",
  CANCELLED: "rose",
};

function PaymentsTab({ client, coach }: { client: Client; coach: Coach }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadInvoices() {
    const { data } = await supabase
      .from("invoices")
      .select("*")
      .eq("client_id", client.id)
      .order("id", { ascending: false });
    setInvoices((data as Invoice[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client.id]);

  async function handleCreate() {
    const value = Number(amount);
    if (!value || value <= 0) return;
    setSaving(true);
    await supabase.from("invoices").insert({
      coach_id: coach.id,
      client_id: client.id,
      amount_dzd: value,
      description: description.trim() || null,
    });
    setSaving(false);
    setAmount("");
    setDescription("");
    setFormOpen(false);
    await loadInvoices();
  }

  async function updateStatus(id: number, status: InvoiceStatus) {
    await supabase
      .from("invoices")
      .update({ status, paid_at: status === "PAID" ? new Date().toISOString() : null })
      .eq("id", id);
    await loadInvoices();
  }

  async function handleDelete(id: number) {
    if (!confirm("حذف هذه الفاتورة؟")) return;
    await supabase.from("invoices").delete().eq("id", id);
    await loadInvoices();
  }

  const totalPending = invoices.filter((i) => i.status === "PENDING").reduce((s, i) => s + i.amount_dzd, 0);
  const totalPaid = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount_dzd, 0);

  if (loading) {
    return <p className="py-8 text-center text-sm text-ink-faint">جارٍ التحميل...</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-extrabold text-amber-600">{totalPending.toLocaleString("ar-DZ")} دج</p>
          <p className="mt-1 text-xs text-ink-faint">بانتظار الدفع</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-extrabold text-brand-600">{totalPaid.toLocaleString("ar-DZ")} دج</p>
          <p className="mt-1 text-xs text-ink-faint">مدفوع</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>فواتير ومدفوعات {client.full_name}</CardTitle>
          <Button size="sm" onClick={() => setFormOpen((v) => !v)}>
            <Plus className="size-4" />
            فاتورة جديدة
          </Button>
        </CardHeader>

        {formOpen && (
          <div className="mb-4 flex flex-wrap items-end gap-2 rounded-xl bg-surface-muted p-3">
            <div>
              <Label htmlFor="p_amount">المبلغ (دج)</Label>
              <Input id="p_amount" type="number" dir="ltr" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="p_desc">الوصف</Label>
              <Input id="p_desc" placeholder="مثال: اشتراك شهري" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <Button size="sm" onClick={handleCreate} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              حفظ
            </Button>
          </div>
        )}

        {invoices.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-faint">لا توجد فواتير لهذا العميل بعد.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-bold text-ink">
                    {inv.amount_dzd.toLocaleString("ar-DZ")} دج
                    <Badge tone={PAYMENT_STATUS_TONE[inv.status]}>{PAYMENT_STATUS_LABEL[inv.status]}</Badge>
                  </p>
                  {inv.description && <p className="mt-0.5 truncate text-xs text-ink-faint">{inv.description}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {inv.status === "PENDING" && (
                    <button
                      type="button"
                      onClick={() => updateStatus(inv.id, "PAID")}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-50"
                    >
                      تحديد كمدفوعة
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(inv.id)}
                    className="flex size-8 items-center justify-center rounded-lg text-ink-faint hover:bg-surface-muted hover:text-rose-500"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
