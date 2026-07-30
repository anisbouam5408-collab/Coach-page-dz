import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Dumbbell, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-canvas px-6">
      <Card className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-brand-500 text-white">
            <Dumbbell className="size-5" />
          </div>
          <h1 className="text-xl font-bold text-ink">استعادة كلمة المرور</h1>
        </div>

        {sent ? (
          <div className="text-center">
            <p className="text-sm text-ink-muted">
              إذا كان {email} مسجّلاً لدينا، أرسلنا رابط إعادة تعيين كلمة المرور إليه. تحقق أيضاً من مجلد الرسائل غير
              المرغوبة (Spam).
            </p>
            <Link to="/login" className="mt-6 block">
              <Button className="w-full">العودة لتسجيل الدخول</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-ink-muted">
              أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
            </p>
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

            <Button type="submit" disabled={loading} className="mt-2">
              {loading && <Loader2 className="size-4 animate-spin" />}
              إرسال رابط الاستعادة
            </Button>
          </form>
        )}

        <div className="mt-6 border-t border-border pt-5 text-center">
          <p className="text-xs text-ink-faint">لا تصلك الرسالة أو لا يمكنك الوصول إلى بريدك؟</p>
          <a
            href="https://wa.me/213553093511?text=مرحبا، أحتاج مساعدة لاستعادة الوصول إلى حسابي في CoachPage DZ."
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline"
          >
            <MessageCircle className="size-3.5" />
            تواصل معنا عبر واتساب
          </a>
        </div>

        <p className="mt-5 text-center text-sm text-ink-muted">
          <Link to="/login" className="font-semibold text-brand-600 hover:underline">
            العودة لتسجيل الدخول
          </Link>
        </p>
      </Card>
    </div>
  );
}
