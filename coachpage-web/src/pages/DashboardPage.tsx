import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  CalendarClock,
  CreditCard,
  Dumbbell,
  FileText,
  Heart,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Menu,
  Pencil,
  Plus,
  Receipt,
  Ruler,
  Search,
  Settings,
  Target,
  Trash2,
  User,
  Users,
  Utensils,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SubscriptionBanner } from "@/components/SubscriptionBanner";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { usePlans } from "@/hooks/usePlans";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { buildRenewWhatsAppLink } from "@/lib/whatsapp";
import { useLanguage } from "@/lib/i18n";
import type { Client, ClientStatus } from "@/types/domain";

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
const STATUS_FILTERS: Array<{ value: ClientStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "كل الحالات" },
  { value: "ACTIVE", label: "نشط" },
  { value: "PAUSED", label: "متوقف" },
  { value: "EXPIRED", label: "منتهي" },
];

interface ClientFormState {
  id: number | null;
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

const EMPTY_FORM: ClientFormState = {
  id: null,
  full_name: "",
  phone_number: "",
  email: "",
  age: "",
  gender: "male",
  height: "",
  weight: "",
  fitness_goal: "",
  activity_level: "moderate",
  training_program: "",
  medical_conditions: "",
  allergies: "",
  injuries: "",
  status: "ACTIVE",
  subscription_started_at: "",
  subscription_expires_at: "",
  tags: "",
  coach_notes: "",
};

const ACTIVITY_LEVELS: Array<{ value: string; label: string }> = [
  { value: "sedentary", label: "خامل" },
  { value: "light", label: "نشاط خفيف" },
  { value: "moderate", label: "نشاط متوسط" },
  { value: "active", label: "نشيط" },
  { value: "very_active", label: "نشيط جداً" },
];

function FormSection({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 border-b border-border pb-2">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Icon className="size-4" />
        </div>
        <h4 className="text-sm font-bold text-ink">{title}</h4>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

interface SidebarItem {
  key: string;
  label: string;
  icon: LucideIcon;
  path?: string;
  onClick?: () => void;
}

function SidebarNav({
  username,
  items,
  onLogout,
  open,
  onClose,
}: {
  username: string;
  items: SidebarItem[];
  onLogout: () => void;
  open: boolean;
  onClose: () => void;
}) {
  const location = useLocation();
  const { t } = useLanguage();
  function isActive(item: SidebarItem) {
    if (!item.path) return false;
    return item.path === "/dashboard" ? location.pathname === "/dashboard" : location.pathname.startsWith(item.path);
  }
  const content = (
    <div className="flex h-full flex-col bg-ink text-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-brand-500 text-white">
          <Dumbbell className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-bold">CoachPage DZ</p>
          <p className="truncate text-xs text-white/50">@{username}</p>
        </div>
        <button type="button" onClick={onClose} className="mr-auto text-white/60 hover:text-white lg:hidden">
          <X className="size-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="flex flex-col gap-1">
          {items.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                onClick={item.onClick}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive(item) ? "bg-brand-500 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="size-5 shrink-0" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="size-5" />
          {t("sidebar.logout")}
        </button>
        <LanguageSwitcher dark className="mt-3" />
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:z-20 lg:flex lg:w-64 lg:flex-col">{content}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <aside className="absolute inset-y-0 right-0 w-64">{content}</aside>
        </div>
      )}
    </>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string | number; tone?: "amber" | "rose" }) {
  return (
    <Card className="text-center">
      <p
        className={`text-3xl font-extrabold ${
          tone === "amber" ? "text-amber-600" : tone === "rose" ? "text-rose-500" : "text-ink"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-ink-faint">{label}</p>
    </Card>
  );
}

function ActivityChart({ data }: { data: Array<{ date: string; count: number }> }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <Card>
      <CardTitle className="mb-1">نشاط العملاء</CardTitle>
      <CardDescription className="mb-4">عدد تسجيلات الوزن يومياً عبر كل عملائك — آخر 14 يوماً.</CardDescription>
      {data.every((d) => d.count === 0) ? (
        <p className="py-8 text-center text-sm text-ink-faint">لا يوجد نشاط مسجل بعد فهاذ الفترة.</p>
      ) : (
        <div className="flex h-32 items-end gap-1.5">
          {data.map((d) => (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className="w-full rounded-t-md bg-brand-400"
                style={{ height: `${Math.max(4, (d.count / max) * 100)}%` }}
                title={`${d.date}: ${d.count}`}
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function RecentClientsCard({ clients, adherence }: { clients: Client[]; adherence: Record<number, number> }) {
  function initials(name: string) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  }
  function avatarTone(id: number) {
    const tones = ["bg-brand-500", "bg-sky-500", "bg-amber-400", "bg-rose-500"];
    return tones[id % tones.length];
  }

  return (
    <Card>
      <CardTitle className="mb-4">أحدث العملاء</CardTitle>
      {clients.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-faint">لا يوجد عملاء بعد.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {clients.map((c) => {
            const pct = adherence[c.id] ?? 0;
            return (
              <Link key={c.id} to={`/dashboard/clients/${c.id}`} className="flex items-center gap-3 hover:opacity-80">
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarTone(c.id)}`}
                >
                  {initials(c.full_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{c.full_name}</p>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className="shrink-0 text-xs font-bold text-ink-faint">{pct}%</span>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { coach, signOut, refreshCoach } = useAuthStore();
  const { t } = useLanguage();
  const { plans } = usePlans();
  const platformSettings = usePlatformSettings();
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [form, setForm] = useState<ClientFormState>(EMPTY_FORM);
  const [formOpen, setFormOpen] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "ALL">("ALL");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentActivity, setRecentActivity] = useState<Array<{ date: string; count: number }>>([]);
  const [adherenceByClient, setAdherenceByClient] = useState<Record<number, number>>({});
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

  useEffect(() => {
    if (clients.length === 0) return;
    const clientIds = clients.map((c) => c.id);
    const since = new Date();
    since.setDate(since.getDate() - 27);
    supabase
      .from("weight_logs")
      .select("client_id, date")
      .in("client_id", clientIds)
      .gte("date", since.toISOString().slice(0, 10))
      .then(({ data }) => {
        const logs = (data as Array<{ client_id: number; date: string }>) ?? [];

        const counts: Record<number, number> = {};
        for (const l of logs) counts[l.client_id] = (counts[l.client_id] ?? 0) + 1;
        const adherence: Record<number, number> = {};
        for (const c of clients) adherence[c.id] = Math.min(100, Math.round(((counts[c.id] ?? 0) / 4) * 100));
        setAdherenceByClient(adherence);

        const days: Array<{ date: string; count: number }> = [];
        for (let i = 13; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          days.push({ date: key, count: logs.filter((l) => l.date === key).length });
        }
        setRecentActivity(days);
      });
  }, [clients]);

  const stats = useMemo(() => {
    const now = Date.now();
    const total = clients.length;
    const active = clients.filter((c) => c.status === "ACTIVE").length;
    const expiringSoon = clients.filter((c) => {
      if (!c.subscription_expires_at) return false;
      const days = Math.ceil((new Date(c.subscription_expires_at).getTime() - now) / (1000 * 60 * 60 * 24));
      return days >= 0 && days <= 5;
    }).length;
    const expired = clients.filter((c) => c.status === "EXPIRED").length;
    return { total, active, expiringSoon, expired };
  }, [clients]);

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();
    return clients.filter((c) => {
      if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
      if (!term) return true;
      return (
        c.full_name?.toLowerCase().includes(term) ||
        c.phone_number?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.tags?.some((t) => t.toLowerCase().includes(term))
      );
    });
  }, [clients, search, statusFilter]);

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
    setClientError(null);
    const payload = {
      coach_id: coach!.id,
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
    };

    const { error } = form.id
      ? await supabase.from("clients").update(payload).eq("id", form.id)
      : await supabase.from("clients").insert(payload);

    if (error) {
      setClientError(error.message);
      return;
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
      phone_number: client.phone_number ?? "",
      email: client.email ?? "",
      age: client.age?.toString() ?? "",
      gender: client.gender,
      height: client.height?.toString() ?? "",
      weight: client.weight?.toString() ?? "",
      fitness_goal: client.fitness_goal ?? "",
      activity_level: client.activity_level || "moderate",
      training_program: client.training_program ?? "",
      medical_conditions: client.medical_conditions ?? "",
      allergies: client.allergies ?? "",
      injuries: client.injuries ?? "",
      status: client.status,
      subscription_started_at: client.subscription_started_at ?? "",
      subscription_expires_at: client.subscription_expires_at ?? "",
      tags: (client.tags ?? []).join(", "),
      coach_notes: client.coach_notes ?? "",
    });
    setFormOpen(true);
  }

  async function handleLogout() {
    await signOut();
    navigate("/");
  }

  const sidebarItems: SidebarItem[] = [
    { key: "dashboard", label: t("sidebar.dashboard"), icon: LayoutDashboard, path: "/dashboard", onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
    { key: "clients", label: t("sidebar.clients"), icon: Users, onClick: () => document.getElementById("clients-section")?.scrollIntoView({ behavior: "smooth" }) },
    { key: "training", label: t("sidebar.training"), icon: Dumbbell, onClick: () => document.getElementById("clients-section")?.scrollIntoView({ behavior: "smooth" }) },
    { key: "nutrition", label: t("sidebar.nutrition"), icon: Utensils, path: "/dashboard/nutrition", onClick: () => navigate("/dashboard/nutrition") },
    { key: "appointments", label: t("sidebar.appointments"), icon: CalendarClock, path: "/dashboard/appointments", onClick: () => navigate("/dashboard/appointments") },
    { key: "subscriptions", label: t("sidebar.subscriptions"), icon: CreditCard, onClick: () => plansRef.current?.scrollIntoView({ behavior: "smooth" }) },
    { key: "invoices", label: t("sidebar.invoices"), icon: Receipt, path: "/dashboard/invoices", onClick: () => navigate("/dashboard/invoices") },
    { key: "messages", label: t("sidebar.messages"), icon: MessageSquare, path: "/dashboard/messages", onClick: () => navigate("/dashboard/messages") },
    { key: "reports", label: t("sidebar.reports"), icon: BarChart3, path: "/dashboard/reports", onClick: () => navigate("/dashboard/reports") },
    { key: "settings", label: t("sidebar.settings"), icon: Settings, path: "/dashboard/settings", onClick: () => navigate("/dashboard/settings") },
  ];

  return (
    <div className="min-h-svh bg-canvas lg:mr-64">
      <SidebarNav
        username={coach.username}
        items={sidebarItems}
        onLogout={handleLogout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <SubscriptionBanner coach={coach} onUpgradeClick={() => plansRef.current?.scrollIntoView({ behavior: "smooth" })} />

      <header className="border-b border-border bg-surface px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex size-9 items-center justify-center rounded-xl border border-border-strong text-ink-muted lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <div>
              <p className="font-bold text-ink">{coach.full_name || coach.username}</p>
              <p className="text-xs text-ink-faint">@{coach.username}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="lg:hidden">
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      <main className="px-6 py-8">
        <h1 className="mb-5 text-xl font-bold text-ink">{t("dashboard.title")}</h1>

        <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label={t("dashboard.stat.total")} value={stats.total} />
          <StatCard label={t("dashboard.stat.active")} value={stats.active} />
          <StatCard label={t("dashboard.stat.expiringSoon")} value={stats.expiringSoon} tone="amber" />
          <StatCard label={t("dashboard.stat.expired")} value={stats.expired} tone="rose" />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
          <ActivityChart data={recentActivity} />
          <RecentClientsCard clients={clients.slice(0, 4)} adherence={adherenceByClient} />
        </div>

        <Card id="clients-section">
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5 text-brand-500" />
                عملاؤك ({clients.length})
              </CardTitle>
              <CardDescription>أضف عملاءك وتابع ملفهم الصحي وأوزانهم وأهدافهم وبرامجهم.</CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setClientError(null);
                if (formOpen) {
                  setFormOpen(false);
                } else {
                  setForm(EMPTY_FORM);
                  setFormOpen(true);
                }
              }}
            >
              <Plus className="size-4" />
              عميل جديد
            </Button>
          </CardHeader>

          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
              <Input
                placeholder="ابحث بالاسم، الهاتف، البريد أو الوسم"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pe-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ClientStatus | "ALL")}
              className="h-11 rounded-xl border border-border-strong bg-surface px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400/40"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {formOpen && (
            <div className="mb-6 flex flex-col gap-6 rounded-2xl border border-border bg-surface-muted p-4 sm:p-5">
              <FormSection icon={User} title="المعلومات الأساسية">
                <div>
                  <Label htmlFor="c_name">اسم العميل</Label>
                  <Input id="c_name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="c_phone">الهاتف</Label>
                  <Input
                    id="c_phone"
                    dir="ltr"
                    value={form.phone_number}
                    onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="c_email">البريد الإلكتروني</Label>
                  <Input
                    id="c_email"
                    type="email"
                    dir="ltr"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="c_age">العمر</Label>
                  <Input id="c_age" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="c_gender">الجنس</Label>
                  <select
                    id="c_gender"
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value as "male" | "female" })}
                    className="h-11 w-full rounded-xl border border-border-strong bg-surface px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400/40"
                  >
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="c_status">حالة العميل</Label>
                  <select
                    id="c_status"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as ClientStatus })}
                    className="h-11 w-full rounded-xl border border-border-strong bg-surface px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400/40"
                  >
                    <option value="ACTIVE">نشط</option>
                    <option value="PAUSED">متوقف</option>
                    <option value="EXPIRED">منتهي</option>
                  </select>
                </div>
              </FormSection>

              <FormSection icon={Ruler} title="القياسات والنشاط">
                <div>
                  <Label htmlFor="c_height">الطول (سم)</Label>
                  <Input
                    id="c_height"
                    type="number"
                    value={form.height}
                    onChange={(e) => setForm({ ...form, height: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="c_weight">الوزن (كغ)</Label>
                  <Input id="c_weight" type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="c_activity">مستوى النشاط</Label>
                  <select
                    id="c_activity"
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
              </FormSection>

              <FormSection icon={Target} title="الهدف والبرنامج">
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
                <div className="sm:col-span-2">
                  <Label htmlFor="c_tags">الوسوم (Tags) — افصل بفاصلة</Label>
                  <Input id="c_tags" dir="ltr" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
                </div>
              </FormSection>

              <FormSection icon={Calendar} title="الاشتراك">
                <div>
                  <Label htmlFor="c_sub_start">تاريخ بدء الاشتراك</Label>
                  <Input
                    id="c_sub_start"
                    type="date"
                    value={form.subscription_started_at}
                    onChange={(e) => setForm({ ...form, subscription_started_at: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="c_sub_end">تاريخ انتهاء الاشتراك</Label>
                  <Input
                    id="c_sub_end"
                    type="date"
                    value={form.subscription_expires_at}
                    onChange={(e) => setForm({ ...form, subscription_expires_at: e.target.value })}
                  />
                </div>
              </FormSection>

              <FormSection icon={Heart} title="الحالة الصحية">
                <div>
                  <Label htmlFor="c_medical">الأمراض</Label>
                  <Input
                    id="c_medical"
                    value={form.medical_conditions}
                    onChange={(e) => setForm({ ...form, medical_conditions: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="c_allergies">الحساسية</Label>
                  <Input
                    id="c_allergies"
                    value={form.allergies}
                    onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="c_injuries">الإصابات</Label>
                  <Input
                    id="c_injuries"
                    value={form.injuries}
                    onChange={(e) => setForm({ ...form, injuries: e.target.value })}
                  />
                </div>
              </FormSection>

              <FormSection icon={FileText} title="ملاحظات المدرب">
                <div className="sm:col-span-2">
                  <textarea
                    id="c_notes"
                    value={form.coach_notes}
                    onChange={(e) => setForm({ ...form, coach_notes: e.target.value })}
                    rows={3}
                    placeholder="أي ملاحظات إضافية عن هذا العميل..."
                    className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400/40"
                  />
                </div>
              </FormSection>

              {clientError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{clientError}</p>}

              <div className="flex items-center gap-2">
                <Button onClick={handleSaveClient}>{form.id ? "حفظ التعديلات" : "إضافة العميل"}</Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setClientError(null);
                    setFormOpen(false);
                  }}
                >
                  إلغاء
                </Button>
              </div>
            </div>
          )}

          {loadingClients ? (
            <p className="py-8 text-center text-sm text-ink-faint">جارٍ التحميل...</p>
          ) : filteredClients.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-faint">
              {clients.length === 0 ? "لا يوجد عملاء بعد — أضف أول عميل لك." : "لا توجد نتائج مطابقة."}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredClients.map((c) => (
                <Card
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/dashboard/clients/${c.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/dashboard/clients/${c.id}`);
                    }
                  }}
                  className="cursor-pointer p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-ink">{c.full_name}</p>
                        <Badge tone={STATUS_TONE[c.status]}>{STATUS_LABEL[c.status]}</Badge>
                      </div>
                      {c.tags?.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {c.tags.map((t) => (
                            <Badge key={t} tone="neutral" className="text-[10px]">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
                        <span dir="ltr">{c.phone_number || "—"}</span>
                        <span>{c.fitness_goal || "بلا هدف محدد"}</span>
                        <span>
                          ينتهي: {c.subscription_expires_at ? new Date(c.subscription_expires_at).toLocaleDateString("ar-DZ") : "—"}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(c);
                        }}
                        className="flex size-8 items-center justify-center rounded-lg text-ink-faint hover:bg-surface-muted hover:text-ink"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClient(c.id);
                        }}
                        className="flex size-8 items-center justify-center rounded-lg text-ink-faint hover:bg-rose-50 hover:text-rose-500"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  <Link
                    to={`/dashboard/clients/${c.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-600"
                  >
                    فتح ملف العميل
                    <ArrowLeft className="size-4 rtl:rotate-180" />
                  </Link>
                  <p className="mt-2 text-center text-[11px] leading-relaxed text-ink-faint">
                    افتح ملف العميل لإدارة القياسات، البرامج، الحالة الصحية، الاشتراك، التقدم والملاحظات.
                  </p>
                </Card>
              ))}
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
                    ownerWhatsapp: platformSettings?.owner_whatsapp || "213553093511",
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
