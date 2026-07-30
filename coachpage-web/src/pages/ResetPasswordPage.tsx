import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Dumbbell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";

export function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase parses the recovery link's tokens from the URL hash and
    // establishes a session automatically; give it a moment before
    // deciding the link was invalid/expired.
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session));
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasSession(Boolean(session));
        setReady(true);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.");
      return;
    }
    if (password !== confirm) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-canvas px-6">
      <Card className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-brand-500 text-white">
            <Dumbbell className="size-5" />
          </div>
          <h1 className="text-xl font-bold text-ink">تعيين كلمة مرور جديدة</h1>
        </div>

        {!ready ? (
          <p className="text-center text-sm text-ink-faint">جارٍ التحقق من الرابط...</p>
        ) : done ? (
          <div className="text-center">
            <p className="text-sm text-ink-muted">تم تغيير كلمة المرور بنجاح.</p>
            <Link to="/login" className="mt-6 block">
              <Button className="w-full">تسجيل الدخول الآن</Button>
            </Link>
          </div>
        ) : !hasSession ? (
          <div className="text-center">
            <p className="text-sm text-ink-muted">
              هذا الرابط غير صالح أو منتهي الصلاحية. اطلب رابطاً جديداً لإعادة تعيين كلمة المرور.
            </p>
            <Link to="/forgot-password" className="mt-6 block">
              <Button className="w-full">طلب رابط جديد</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="password">كلمة المرور الجديدة</Label>
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
            <div>
              <Label htmlFor="confirm">تأكيد كلمة المرور</Label>
              <Input
                id="confirm"
                type="password"
                dir="ltr"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

            <Button type="submit" disabled={loading} className="mt-2">
              {loading && <Loader2 className="size-4 animate-spin" />}
              حفظ كلمة المرور
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
