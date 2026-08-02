import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Dumbbell, Loader2, Save, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

export function SettingsPage() {
  const { coach, refreshCoach } = useAuthStore();
  const [fullName, setFullName] = useState(coach?.full_name ?? "");
  const [phone, setPhone] = useState(coach?.phone_number ?? "");
  const [whatsapp, setWhatsapp] = useState(coach?.whatsapp_number ?? "");
  const [specialty, setSpecialty] = useState(coach?.specialty ?? "");
  const [bio, setBio] = useState(coach?.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!coach) {
    return <div className="flex min-h-svh items-center justify-center text-ink-muted">جارٍ التحميل...</div>;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);

    const { error: updateError } = await supabase
      .from("coaches")
      .update({
        full_name: fullName.trim(),
        phone_number: phone.trim() || null,
        whatsapp_number: whatsapp.trim() || null,
        specialty: specialty.trim() || null,
        bio: bio.trim() || null,
      })
      .eq("id", coach!.id);

    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await refreshCoach();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="min-h-svh bg-canvas">
      <header className="border-b border-border bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Link
            to="/dashboard"
            className="flex size-9 items-center justify-center rounded-xl border border-border-strong text-ink-muted hover:bg-surface-muted"
          >
            <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
          <div>
            <p className="font-bold text-ink">الإعدادات</p>
            <p className="text-xs text-ink-faint">بيانات حسابك كمدرب</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <Card>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-brand-500 text-white">
              <Dumbbell className="size-5" />
            </div>
            <div>
              <CardTitle>الملف الشخصي</CardTitle>
              <CardDescription>هاذي المعلومات تبان لعملائك ولمشرف المنصة.</CardDescription>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="s_username">اسم المستخدم</Label>
              <Input id="s_username" dir="ltr" value={coach.username} disabled className="opacity-60" />
              <p className="mt-1 text-xs text-ink-faint">لا يمكن تغيير اسم المستخدم. تواصل مع المشرف إذا احتجت ذلك.</p>
            </div>
            <div>
              <Label htmlFor="s_email">البريد الإلكتروني</Label>
              <Input id="s_email" dir="ltr" value={coach.email ?? ""} disabled className="opacity-60" />
            </div>
            <div>
              <Label htmlFor="s_name">الاسم الكامل</Label>
              <Input id="s_name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="s_phone">رقم الهاتف</Label>
              <Input id="s_phone" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="s_whatsapp">رقم واتساب (يظهر للعملاء)</Label>
              <Input
                id="s_whatsapp"
                dir="ltr"
                placeholder="213xxxxxxxxx"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="s_specialty">التخصص</Label>
              <Input
                id="s_specialty"
                placeholder="مثال: تدريب القوة، تخسيس، تغذية رياضية"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="s_bio">نبذة عنك</Label>
              <textarea
                id="s_bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="اكتب نبذة قصيرة عن خبرتك وأسلوبك في التدريب..."
                className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400/40"
              />
            </div>

            {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

            <div className="mt-2 flex items-center gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                حفظ التعديلات
              </Button>
              {saved && <span className="text-sm font-medium text-brand-600">تم الحفظ ✓</span>}
            </div>
          </form>
        </Card>

        <Card className="mt-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-surface-muted text-ink-muted">
              <User className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">حالة الاشتراك</p>
              <p className="text-xs text-ink-faint">
                {coach.subscription_status === "ACTIVE"
                  ? "اشتراكك نشط"
                  : coach.subscription_status === "TRIAL"
                    ? "أنت في فترة التجربة المجانية"
                    : "اشتراكك بحاجة لتجديد"}
                {coach.subscription_expires_at &&
                  ` — ينتهي في ${new Date(coach.subscription_expires_at).toLocaleDateString("ar-DZ")}`}
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
