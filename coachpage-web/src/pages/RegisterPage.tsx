import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dumbbell, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { savePendingRegistration } from "@/lib/pendingRegistration";

export function RegisterPage() {
  const navigate = useNavigate();
  const refreshCoach = useAuthStore((s) => s.refreshCoach);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function createCoachRow(userId: string) {
    const { error: insertError } = await supabase.from("coaches").insert({
      user_id: userId,
      username,
      full_name: fullName,
      email,
      phone_number: phone,
      subscription_status: "TRIAL",
      password_hash: crypto.randomUUID(),
    });
    return insertError;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Saved up front: if Supabase requires email confirmation, the session
    // (and this form's state) won't exist anymore by the time the coach
    // clicks the confirm link — the auth store finishes the signup then,
    // reading this back.
    savePendingRegistration({ fullName, username, phone, email });

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        // Stored on the auth user itself (not just localStorage) so the
        // confirmed-session handler can rebuild the `coaches` row even if
        // the confirmation link is opened in a different browser/app than
        // the one used to fill out this form (very common on mobile).
        data: { full_name: fullName, username, phone },
      },
    });
    if (signUpError || !data.user) {
      setError(signUpError?.message ?? "تعذّر إنشاء الحساب.");
      setLoading(false);
      return;
    }

    if (!data.session) {
      setConfirmationSent(true);
      setLoading(false);
      return;
    }

    const insertError = await createCoachRow(data.user.id);
    if (insertError) {
      setError(insertError.message.includes("duplicate") ? "اسم المستخدم مستخدم مسبقاً." : insertError.message);
      setLoading(false);
      return;
    }

    await refreshCoach();
    navigate("/dashboard");
  }

  if (confirmationSent) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-canvas px-6">
        <Card className="w-full max-w-md text-center">
          <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-brand-500 text-white">
            <Mail className="size-5" />
          </div>
          <h1 className="text-xl font-bold text-ink">تحقق من بريدك الإلكتروني</h1>
          <p className="mt-2 text-sm text-ink-muted">
            أرسلنا رابط تفعيل إلى <span className="font-semibold text-ink">{email}</span>. افتح الرسالة واضغط على
            الرابط لتفعيل حسابك مباشرة — سيتم فتح لوحة التحكم تلقائياً.
          </p>
          <p className="mt-4 text-xs text-ink-faint">لم تصلك الرسالة؟ تحقق من مجلد الرسائل غير المرغوبة (Spam).</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-canvas px-6 py-12">
      <Card className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-brand-500 text-white">
            <Dumbbell className="size-5" />
          </div>
          <h1 className="text-xl font-bold text-ink">ابدأ 7 أيام مجاناً</h1>
          <p className="mt-1 text-sm text-ink-muted">بدون بطاقة بنكية</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="fullName">الاسم الكامل</Label>
            <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="username">اسم المستخدم (رابط صفحتك)</Label>
            <Input
              id="username"
              required
              dir="ltr"
              pattern="[a-zA-Z0-9_]+"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
            />
          </div>
          <div>
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input id="email" type="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input id="phone" dir="ltr" required value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              dir="ltr"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

          <Button type="submit" disabled={loading} className="mt-2">
            {loading && <Loader2 className="size-4 animate-spin" />}
            إنشاء الحساب
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-muted">
          لديك حساب؟{" "}
          <Link to="/login" className="font-semibold text-brand-600 hover:underline">
            سجّل الدخول
          </Link>
        </p>
      </Card>
    </div>
  );
}
