import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Camera, Loader2, Plus, Trash2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import type {
  Client,
  Coach,
  Exercise,
  MeasurementLog,
  ProgressPhoto,
  ProgressPhotoType,
  TrainingDay,
  TrainingExercise,
  TrainingProgram,
  WeightLog,
} from "@/types/domain";

type DayWithExercises = TrainingDay & { training_exercises: TrainingExercise[] };

export function ClientDetailPage() {
  const { id } = useParams();
  const { coach } = useAuthStore();
  const clientId = Number(id);

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "training" | "progress">("overview");

  useEffect(() => {
    if (!coach || !clientId) return;
    supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .maybeSingle()
      .then(({ data }) => {
        setClient(data as Client | null);
        setLoading(false);
      });
  }, [coach, clientId]);

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
        <div className="mx-auto flex max-w-5xl items-center gap-3">
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
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex gap-2 border-b border-border">
          {(
            [
              { key: "overview", label: "نظرة عامة" },
              { key: "training", label: "التدريب" },
              { key: "progress", label: "متابعة التقدم" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                tab === t.key ? "border-brand-500 text-brand-600" : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && <OverviewTab client={client} />}
        {tab === "training" && <TrainingTab coach={coach} client={client} />}
        {tab === "progress" && <ProgressTab client={client} />}
      </main>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="font-medium text-ink">{value}</p>
    </div>
  );
}

function OverviewTab({ client }: { client: Client }) {
  const bmi = client.weight && client.height ? client.weight / (client.height / 100) ** 2 : null;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card>
        <CardTitle>المعلومات الشخصية</CardTitle>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <Field label="العمر" value={client.age ? `${client.age} سنة` : "—"} />
          <Field label="الجنس" value={client.gender === "male" ? "ذكر" : "أنثى"} />
          <Field label="الطول" value={client.height ? `${client.height} سم` : "—"} />
          <Field label="الوزن" value={client.weight ? `${client.weight} كغ` : "—"} />
          <Field label="مؤشر كتلة الجسم" value={bmi ? bmi.toFixed(1) : "—"} />
          <Field label="مستوى النشاط" value={client.activity_level || "—"} />
        </div>
      </Card>
      <Card>
        <CardTitle>الحالة الصحية والهدف</CardTitle>
        <div className="mt-3 flex flex-col gap-2 text-sm">
          <Field label="الهدف" value={client.fitness_goal || "—"} />
          <Field label="الأمراض" value={client.medical_conditions || "—"} />
          <Field label="الحساسية" value={client.allergies || "—"} />
          <Field label="الإصابات" value={client.injuries || "—"} />
        </div>
      </Card>
      {client.coach_notes && (
        <Card className="sm:col-span-2">
          <CardTitle>ملاحظات المدرب</CardTitle>
          <p className="mt-2 text-sm text-ink-muted">{client.coach_notes}</p>
        </Card>
      )}
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
