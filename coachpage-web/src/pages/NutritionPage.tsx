import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, Loader2, Plus, Trash2, Utensils } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import type { Client, NutritionMeal, NutritionProgram } from "@/types/domain";

interface ProgramFormState {
  client_id: string;
  name: string;
  daily_calories: string;
  notes: string;
}

const EMPTY_FORM: ProgramFormState = { client_id: "", name: "", daily_calories: "", notes: "" };

interface MealFormState {
  name: string;
  time_of_day: string;
  items: string;
  calories: string;
}

const EMPTY_MEAL: MealFormState = { name: "", time_of_day: "", items: "", calories: "" };

export function NutritionPage() {
  const { coach } = useAuthStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [programs, setPrograms] = useState<NutritionProgram[]>([]);
  const [mealsByProgram, setMealsByProgram] = useState<Record<number, NutritionMeal[]>>({});
  const [openProgram, setOpenProgram] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ProgramFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [mealForm, setMealForm] = useState<MealFormState>(EMPTY_MEAL);

  useEffect(() => {
    if (!coach) return;
    void loadAll();
  }, [coach]);

  async function loadAll() {
    const [{ data: clientRows }, { data: programRows }] = await Promise.all([
      supabase.from("clients").select("*").eq("coach_id", coach!.id).order("full_name"),
      supabase.from("nutrition_programs").select("*").eq("coach_id", coach!.id).order("id", { ascending: false }),
    ]);
    setClients((clientRows as Client[]) ?? []);
    setPrograms((programRows as NutritionProgram[]) ?? []);
    setLoading(false);
  }

  async function loadMeals(programId: number) {
    const { data } = await supabase
      .from("nutrition_meals")
      .select("*")
      .eq("program_id", programId)
      .order("order_index");
    setMealsByProgram((prev) => ({ ...prev, [programId]: (data as NutritionMeal[]) ?? [] }));
  }

  function toggleProgram(id: number) {
    if (openProgram === id) {
      setOpenProgram(null);
      return;
    }
    setOpenProgram(id);
    if (!mealsByProgram[id]) void loadMeals(id);
  }

  function clientName(id: number | null) {
    if (!id) return "برنامج عام (بدون عميل محدد)";
    return clients.find((c) => c.id === id)?.full_name ?? "عميل محذوف";
  }

  async function handleCreateProgram(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("nutrition_programs").insert({
      coach_id: coach!.id,
      client_id: form.client_id ? Number(form.client_id) : null,
      name: form.name.trim(),
      daily_calories: form.daily_calories ? Number(form.daily_calories) : null,
      notes: form.notes.trim() || null,
    });
    setSaving(false);
    if (!error) {
      setForm(EMPTY_FORM);
      setFormOpen(false);
      await loadAll();
    }
  }

  async function handleDeleteProgram(id: number) {
    if (!confirm("حذف البرنامج الغذائي وكل وجباته؟")) return;
    await supabase.from("nutrition_programs").delete().eq("id", id);
    await loadAll();
  }

  async function handleAddMeal(e: FormEvent, programId: number) {
    e.preventDefault();
    if (!mealForm.name.trim()) return;
    const orderIndex = (mealsByProgram[programId]?.length ?? 0) + 1;
    await supabase.from("nutrition_meals").insert({
      program_id: programId,
      name: mealForm.name.trim(),
      time_of_day: mealForm.time_of_day.trim() || null,
      items: mealForm.items.trim() || null,
      calories: mealForm.calories ? Number(mealForm.calories) : null,
      order_index: orderIndex,
    });
    setMealForm(EMPTY_MEAL);
    await loadMeals(programId);
  }

  async function handleDeleteMeal(programId: number, mealId: number) {
    await supabase.from("nutrition_meals").delete().eq("id", mealId);
    await loadMeals(programId);
  }

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
              <p className="font-bold text-ink">البرامج الغذائية</p>
              <p className="text-xs text-ink-faint">أنشئ خطط تغذية لعملائك وتابع وجباتهم</p>
            </div>
          </div>
          <Button size="sm" onClick={() => setFormOpen((v) => !v)}>
            <Plus className="size-4" />
            برنامج جديد
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        {formOpen && (
          <Card className="mb-6">
            <CardTitle className="mb-4">إنشاء برنامج غذائي</CardTitle>
            <form onSubmit={handleCreateProgram} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="n_client">العميل</Label>
                  <select
                    id="n_client"
                    value={form.client_id}
                    onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-border-strong bg-surface px-4 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400/40"
                  >
                    <option value="">بدون عميل محدد (قالب عام)</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="n_name">اسم البرنامج</Label>
                  <Input
                    id="n_name"
                    required
                    placeholder="مثال: نظام تنشيف - 1800 سعرة"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="n_cal">السعرات اليومية المستهدفة</Label>
                  <Input
                    id="n_cal"
                    type="number"
                    dir="ltr"
                    value={form.daily_calories}
                    onChange={(e) => setForm((f) => ({ ...f, daily_calories: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="n_notes">ملاحظات</Label>
                <textarea
                  id="n_notes"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400/40"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                  إنشاء البرنامج
                </Button>
                <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
                  إلغاء
                </Button>
              </div>
            </form>
          </Card>
        )}

        {programs.length === 0 ? (
          <Card className="text-center">
            <p className="py-6 text-sm text-ink-faint">لا توجد برامج غذائية بعد. أنشئ أول برنامج لعملائك.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {programs.map((program) => {
              const open = openProgram === program.id;
              const meals = mealsByProgram[program.id] ?? [];
              return (
                <Card key={program.id}>
                  <button
                    type="button"
                    onClick={() => toggleProgram(program.id)}
                    className="flex w-full items-center justify-between gap-3 text-right"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                        <Utensils className="size-4.5" />
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-ink">{program.name}</span>
                        <span className="mt-0.5 flex items-center gap-2 text-xs text-ink-faint">
                          {clientName(program.client_id)}
                          {program.daily_calories && <Badge tone="brand">{program.daily_calories} سعرة/يوم</Badge>}
                        </span>
                      </span>
                    </span>
                    <ChevronDown className={`size-4 shrink-0 text-ink-faint transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>

                  {open && (
                    <div className="mt-4 border-t border-border pt-4">
                      {program.notes && <p className="mb-3 text-sm text-ink-muted">{program.notes}</p>}

                      {meals.length > 0 && (
                        <div className="mb-4 flex flex-col divide-y divide-border">
                          {meals.map((meal) => (
                            <div key={meal.id} className="flex items-center justify-between gap-3 py-2.5">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-ink">
                                  {meal.name}
                                  {meal.time_of_day && <span className="text-ink-faint"> · {meal.time_of_day}</span>}
                                </p>
                                {meal.items && <p className="truncate text-xs text-ink-faint">{meal.items}</p>}
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                {meal.calories && <span className="text-xs font-bold text-ink-faint">{meal.calories} سعرة</span>}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMeal(program.id, meal.id)}
                                  className="text-ink-faint hover:text-rose-500"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <form
                        onSubmit={(e) => handleAddMeal(e, program.id)}
                        className="grid grid-cols-2 gap-2 rounded-xl bg-surface-muted p-3 sm:grid-cols-5"
                      >
                        <Input
                          placeholder="اسم الوجبة"
                          value={mealForm.name}
                          onChange={(e) => setMealForm((f) => ({ ...f, name: e.target.value }))}
                          className="col-span-2 h-9 sm:col-span-1"
                        />
                        <Input
                          placeholder="التوقيت"
                          value={mealForm.time_of_day}
                          onChange={(e) => setMealForm((f) => ({ ...f, time_of_day: e.target.value }))}
                          className="h-9"
                        />
                        <Input
                          placeholder="المكونات"
                          value={mealForm.items}
                          onChange={(e) => setMealForm((f) => ({ ...f, items: e.target.value }))}
                          className="col-span-2 h-9 sm:col-span-1"
                        />
                        <Input
                          type="number"
                          dir="ltr"
                          placeholder="سعرات"
                          value={mealForm.calories}
                          onChange={(e) => setMealForm((f) => ({ ...f, calories: e.target.value }))}
                          className="h-9"
                        />
                        <Button type="submit" size="sm" className="h-9">
                          <Plus className="size-3.5" />
                          إضافة
                        </Button>
                      </form>

                      <div className="mt-4 flex justify-end">
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteProgram(program.id)}>
                          <Trash2 className="size-3.5" />
                          حذف البرنامج
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
