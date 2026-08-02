import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Loader2, Plus, Receipt, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import type { Client, Invoice, InvoiceStatus } from "@/types/domain";

interface FormState {
  client_id: string;
  amount_dzd: string;
  description: string;
  due_date: string;
}

const EMPTY_FORM: FormState = { client_id: "", amount_dzd: "", description: "", due_date: "" };

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  PENDING: "بانتظار الدفع",
  PAID: "مدفوعة",
  CANCELLED: "ملغاة",
};
const STATUS_TONE: Record<InvoiceStatus, "amber" | "brand" | "rose"> = {
  PENDING: "amber",
  PAID: "brand",
  CANCELLED: "rose",
};

export function InvoicesPage() {
  const { coach } = useAuthStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!coach) return;
    void loadAll();
  }, [coach]);

  async function loadAll() {
    const [{ data: clientRows }, { data: invoiceRows }] = await Promise.all([
      supabase.from("clients").select("*").eq("coach_id", coach!.id).order("full_name"),
      supabase.from("invoices").select("*").eq("coach_id", coach!.id).order("id", { ascending: false }),
    ]);
    setClients((clientRows as Client[]) ?? []);
    setInvoices((invoiceRows as Invoice[]) ?? []);
    setLoading(false);
  }

  function clientName(id: number | null) {
    if (!id) return "بدون عميل محدد";
    return clients.find((c) => c.id === id)?.full_name ?? "عميل محذوف";
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    const amount = Number(form.amount_dzd);
    if (!amount || amount <= 0) return;
    setSaving(true);
    const { error } = await supabase.from("invoices").insert({
      coach_id: coach!.id,
      client_id: form.client_id ? Number(form.client_id) : null,
      amount_dzd: amount,
      description: form.description.trim() || null,
      due_date: form.due_date || null,
    });
    setSaving(false);
    if (!error) {
      setForm(EMPTY_FORM);
      setFormOpen(false);
      await loadAll();
    }
  }

  async function updateStatus(id: number, status: InvoiceStatus) {
    await supabase
      .from("invoices")
      .update({ status, paid_at: status === "PAID" ? new Date().toISOString() : null })
      .eq("id", id);
    await loadAll();
  }

  async function handleDelete(id: number) {
    if (!confirm("حذف هذه الفاتورة؟")) return;
    await supabase.from("invoices").delete().eq("id", id);
    await loadAll();
  }

  const { totalPending, totalPaid } = useMemo(() => {
    let pending = 0;
    let paid = 0;
    for (const inv of invoices) {
      if (inv.status === "PENDING") pending += inv.amount_dzd;
      if (inv.status === "PAID") paid += inv.amount_dzd;
    }
    return { totalPending: pending, totalPaid: paid };
  }, [invoices]);

  if (!coach || loading) {
    return <div className="flex min-h-svh items-center justify-center text-ink-muted">جارٍ التحميل...</div>;
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
              <p className="font-bold text-ink">الفواتير</p>
              <p className="text-xs text-ink-faint">سجل يدوي لمدفوعات عملائك — لا توجد بوابة دفع إلكترونية</p>
            </div>
          </div>
          <Button size="sm" onClick={() => setFormOpen((v) => !v)}>
            <Plus className="size-4" />
            فاتورة جديدة
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6 grid grid-cols-2 gap-4">
          <Card className="text-center">
            <p className="text-2xl font-extrabold text-amber-600">{totalPending.toLocaleString("ar-DZ")} دج</p>
            <p className="mt-1 text-xs text-ink-faint">بانتظار الدفع</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-extrabold text-brand-600">{totalPaid.toLocaleString("ar-DZ")} دج</p>
            <p className="mt-1 text-xs text-ink-faint">مدفوع</p>
          </Card>
        </div>

        {formOpen && (
          <Card className="mb-6">
            <CardTitle className="mb-4">إضافة فاتورة</CardTitle>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="i_client">العميل</Label>
                  <select
                    id="i_client"
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
                  <Label htmlFor="i_amount">المبلغ (دج)</Label>
                  <Input
                    id="i_amount"
                    type="number"
                    required
                    dir="ltr"
                    value={form.amount_dzd}
                    onChange={(e) => setForm((f) => ({ ...f, amount_dzd: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="i_due">تاريخ الاستحقاق</Label>
                  <Input
                    id="i_due"
                    type="date"
                    dir="ltr"
                    value={form.due_date}
                    onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="i_desc">الوصف</Label>
                  <Input
                    id="i_desc"
                    placeholder="مثال: اشتراك شهر أوت"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                  حفظ الفاتورة
                </Button>
                <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
                  إلغاء
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Card>
          <CardTitle className="mb-1 flex items-center gap-2">
            <Receipt className="size-4 text-brand-500" />
            كل الفواتير
          </CardTitle>
          {invoices.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-faint">لا توجد فواتير بعد.</p>
          ) : (
            <div className="mt-3 flex flex-col divide-y divide-border">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-bold text-ink">
                      {inv.amount_dzd.toLocaleString("ar-DZ")} دج
                      <Badge tone={STATUS_TONE[inv.status]}>{STATUS_LABEL[inv.status]}</Badge>
                    </p>
                    <p className="mt-0.5 text-xs text-ink-faint">
                      {clientName(inv.client_id)}
                      {inv.description && ` · ${inv.description}`}
                      {inv.due_date && ` · الاستحقاق: ${new Date(inv.due_date).toLocaleDateString("ar-DZ")}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {inv.status === "PENDING" && (
                      <>
                        <button
                          type="button"
                          title="تحديد كمدفوعة"
                          onClick={() => updateStatus(inv.id, "PAID")}
                          className="flex size-8 items-center justify-center rounded-lg text-ink-faint hover:bg-surface-muted hover:text-brand-600"
                        >
                          <CheckCircle2 className="size-4" />
                        </button>
                        <button
                          type="button"
                          title="إلغاء"
                          onClick={() => updateStatus(inv.id, "CANCELLED")}
                          className="flex size-8 items-center justify-center rounded-lg text-ink-faint hover:bg-surface-muted hover:text-rose-500"
                        >
                          <XCircle className="size-4" />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      title="حذف"
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
      </main>
    </div>
  );
}
