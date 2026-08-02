import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dumbbell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useLanguage } from "@/lib/i18n";

export function LoginPage() {
  const navigate = useNavigate();
  const refreshCoach = useAuthStore((s) => s.refreshCoach);
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !data.session) {
      setError(t("auth.login.error"));
      setLoading(false);
      return;
    }

    await refreshCoach();

    const { data: isSuperAdmin } = await supabase.rpc("am_i_super_admin");
    navigate(isSuperAdmin ? "/admin" : "/dashboard");
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-canvas px-6">
      <Card className="w-full max-w-md">
        <div className="mb-4 flex justify-end">
          <LanguageSwitcher />
        </div>
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-brand-500 text-white">
            <Dumbbell className="size-5" />
          </div>
          <h1 className="text-xl font-bold text-ink">{t("auth.login.title")}</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="email">{t("auth.login.email")}</Label>
            <Input id="email" type="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label htmlFor="password" className="mb-0">
                {t("auth.login.password")}
              </Label>
              <Link to="/forgot-password" className="text-xs font-medium text-brand-600 hover:underline">
                {t("auth.login.forgot")}
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              dir="ltr"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

          <Button type="submit" disabled={loading} className="mt-2">
            {loading && <Loader2 className="size-4 animate-spin" />}
            {t("auth.login.submit")}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-muted">
          {t("auth.login.noAccount")}{" "}
          <Link to="/register" className="font-semibold text-brand-600 hover:underline">
            {t("auth.login.startTrial")}
          </Link>
        </p>
      </Card>
    </div>
  );
}
