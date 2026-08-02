import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Dumbbell, TrendingUp } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
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
const STATUS_BAR_COLOR: Record<ClientStatus, string> = {
  ACTIVE: "bg-brand-500",
  PAUSED: "bg-amber-400",
  EXPIRED: "bg-rose-500",
};

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function ReportsPage() {
  const { coach } = useAuthStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [programCount, setProgramCount] = useState(0);
  const [exerciseCount, setExerciseCount] = useState(0);
  const [checkInCount30d, setCheckInCount30d] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!coach) return;
    async function load() {
      const since = new Date();
      since.setDate(since.getDate() - 29);

      const [{ data: clientRows }, { count: programs }, { count: exercises }] = await Promise.all([
        supabase.from("clients").select("*").eq("coach_id", coach!.id),
        supabase.from("training_programs").select("id", { count: "exact", head: true }).eq("coach_id", coach!.id),
        supabase.from("exercises").select("id", { count: "exact", head: true }).eq("coach_id", coach!.id),
      ]);

      const rows = (clientRows as Client[]) ?? [];
      setClients(rows);
      setProgramCount(programs ?? 0);
      setExerciseCount(exercises ?? 0);

      const clientIds = rows.map((c) => c.id);
      if (clientIds.length > 0) {
        const { count } = await supabase
          .from("weight_logs")
          .select("id", { count: "exact", head: true })
          .in("client_id", clientIds)
          .gte("date", since.toISOString().slice(0, 10));
        setCheckInCount30d(count ?? 0);
      }
      setLoading(false);
    }
    void load();
  }, [coach]);

  const statusCounts = useMemo(() => {
    const counts: Record<ClientStatus, number> = { ACTIVE: 0, PAUSED: 0, EXPIRED: 0 };
    for (const c of clients) counts[c.status]++;
    return counts;
  }, [clients]);

  const avgTenureDays = useMemo(() => {
    const withStart = clients.filter((c) => c.subscription_started_at);
    if (withStart.length === 0) return null;
    const total = withStart.reduce(
      (sum, c) => sum + Math.max(0, Math.floor((Date.now() - new Date(c.subscription_started_at!).getTime()) / (1000 * 60 * 60 * 24))),
      0,
    );
    return Math.round(total / withStart.length);
  }, [clients]);

  const expiringSoon = useMemo(() => {
    return clients
      .map((c) => ({ client: c, days: daysUntil(c.subscription_expires_at) }))
      .filter((x): x is { client: Client; days: number } => x.days !== null && x.days >= 0 && x.days <= 30)
      .sort((a, b) => a.days - b.days)
      .slice(0, 8);
  }, [clients]);

  const total = clients.length;

  if (!coach || loading) {
    return <div className="flex min-h-svh items-center justify-center text-ink-muted">جارٍ التحميل...</div>;
  }

  return (
    <div className="min-h-svh bg-canvas">
      <header className="border-b border-border bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <Link
            to="/dashboard"
            className="flex size-9 items-center justify-center rounded-xl border border-border-strong text-ink-muted hover:bg-surface-muted"
          >
            <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
          <div>
            <p className="font-bold text-ink">التقارير</p>
            <p className="text-xs text-ink-faint">نظرة شاملة على نشاط عملائك</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="text-center">
            <p className="text-2xl font-extrabold text-ink">{total}</p>
            <p className="mt-1 text-xs text-ink-faint">إجمالي العملاء</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-extrabold text-ink">{programCount}</p>
            <p className="mt-1 text-xs text-ink-faint">برامج تدريبية</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-extrabold text-ink">{exerciseCount}</p>
            <p className="mt-1 text-xs text-ink-faint">تمارين في مكتبتك</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-extrabold text-ink">{checkInCount30d}</p>
            <p className="mt-1 text-xs text-ink-faint">تسجيل وزن (٣٠ يوم)</p>
          </Card>
        </div>

        <Card className="mb-4">
          <CardTitle className="mb-1 flex items-center gap-2">
            <BarChart3 className="size-4 text-brand-500" />
            توزيع حالة العملاء
          </CardTitle>
          <CardDescription className="mb-4">من إجمالي {total} عميل.</CardDescription>
          {total === 0 ? (
            <p className="py-6 text-center text-sm text-ink-faint">أضف عملاء لعرض التوزيع.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {(Object.keys(statusCounts) as ClientStatus[]).map((status) => {
                const count = statusCounts[status];
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={status}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-semibold text-ink">
                        <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
                      </span>
                      <span className="text-ink-faint">
                        {count} · {pct}٪
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                      <div className={`h-full rounded-full ${STATUS_BAR_COLOR[status]}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {avgTenureDays !== null && (
            <p className="mt-4 border-t border-border pt-4 text-sm text-ink-muted">
              متوسط مدة بقاء العميل مع اشتراكه الحالي: <b className="text-ink">{avgTenureDays} يوماً</b>
            </p>
          )}
        </Card>

        <Card>
          <CardTitle className="mb-1 flex items-center gap-2">
            <TrendingUp className="size-4 text-brand-500" />
            اشتراكات قريبة من الانتهاء (٣٠ يوماً)
          </CardTitle>
          <CardDescription className="mb-4">رتّبها حسب الأقرب للانتهاء — تواصل معهم للتجديد.</CardDescription>
          {expiringSoon.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-faint">لا توجد اشتراكات قريبة من الانتهاء حالياً.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {expiringSoon.map(({ client, days }) => (
                <Link
                  key={client.id}
                  to={`/dashboard/clients/${client.id}`}
                  className="flex items-center justify-between gap-3 py-3 hover:opacity-80"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Dumbbell className="size-3.5 text-ink-faint" />
                    {client.full_name}
                  </span>
                  <span
                    className={`text-xs font-bold ${days <= 5 ? "text-rose-500" : days <= 14 ? "text-amber-600" : "text-ink-faint"}`}
                  >
                    {days === 0 ? "ينتهي اليوم" : `متبقي ${days} ${days === 1 ? "يوم" : "أيام"}`}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
