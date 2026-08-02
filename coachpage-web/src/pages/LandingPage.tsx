import { Link } from "react-router-dom";
import { Check, Dumbbell, MessageCircle, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { usePlans } from "@/hooks/usePlans";
import { useLanguage } from "@/lib/i18n";

export function LandingPage() {
  const { plans } = usePlans();
  const { t, lang } = useLanguage();
  const bestValueCode = "QUARTERLY";
  const locale = lang === "fr" ? "fr-DZ" : "ar-DZ";

  const features = [
    { icon: Users, title: t("landing.feature.clients.title"), desc: t("landing.feature.clients.desc") },
    { icon: MessageCircle, title: t("landing.feature.whatsapp.title"), desc: t("landing.feature.whatsapp.desc") },
    { icon: ShieldCheck, title: t("landing.feature.security.title"), desc: t("landing.feature.security.desc") },
  ];

  const perks = [
    t("landing.pricing.perk.clients"),
    t("landing.pricing.perk.programs"),
    t("landing.pricing.perk.support"),
    t("landing.pricing.perk.dashboard"),
  ];

  return (
    <div className="min-h-svh bg-canvas">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-brand-500 text-white">
            <Dumbbell className="size-5" />
          </div>
          <span className="text-lg font-extrabold text-ink">CoachPage DZ</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link to="/guide" className="hidden text-sm font-medium text-ink-muted hover:text-ink sm:block">
            {t("nav.guide")}
          </Link>
          <Link to="/login">
            <Button variant="ghost" size="sm">
              {t("nav.login")}
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm">{t("nav.start")}</Button>
          </Link>
          <LanguageSwitcher />
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden px-6 pt-14 pb-20 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-brand-50 to-transparent"
          />
          <Badge tone="brand" className="mx-auto mb-6 w-fit">
            <Sparkles className="size-3.5" />
            {t("landing.badge")}
          </Badge>
          <h1 className="mx-auto max-w-3xl text-4xl leading-[1.15] font-extrabold text-ink sm:text-6xl">
            {t("landing.hero.title1")}
            <br />
            <span className="text-gradient-brand">{t("landing.hero.title2")}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">{t("landing.hero.subtitle")}</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/register">
              <Button size="lg">{t("landing.hero.cta.start")}</Button>
            </Link>
            <Link to="/guide">
              <Button size="lg" variant="secondary">
                {t("landing.hero.cta.demo")}
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-ink-faint">{t("landing.hero.note")}</p>
        </section>

        <section className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-6 pb-20 sm:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="text-right">
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <f.icon className="size-5" />
              </div>
              <h3 className="mb-1 font-bold text-ink">{f.title}</h3>
              <p className="text-sm leading-relaxed text-ink-muted">{f.desc}</p>
            </Card>
          ))}
        </section>

        <section className="px-6 pb-24">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-extrabold text-ink">{t("landing.pricing.title")}</h2>
            <p className="mt-2 text-ink-muted">{t("landing.pricing.subtitle")}</p>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
            {plans.map((plan) => {
              const isBest = plan.code === bestValueCode;
              return (
                <Card
                  key={plan.code}
                  className={isBest ? "relative border-2 border-brand-500 sm:-translate-y-2" : "relative"}
                >
                  {isBest && (
                    <div className="absolute -top-3 inset-x-0 flex justify-center">
                      <Badge tone="brand">{t("landing.pricing.best")}</Badge>
                    </div>
                  )}
                  <p className="text-sm font-semibold text-ink-muted">{plan.label}</p>
                  <p className="mt-2 text-4xl font-extrabold text-ink">
                    {plan.price_dzd.toLocaleString(locale)}
                    <span className="text-base font-medium text-ink-faint"> دج</span>
                  </p>
                  <p className="mt-1 text-xs text-ink-faint">{t("landing.pricing.duration", { n: plan.duration_days })}</p>
                  <ul className="mt-6 flex flex-col gap-2.5 text-right text-sm text-ink-muted">
                    {perks.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <Check className="size-4 shrink-0 text-brand-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register" className="mt-6 block">
                    <Button className="w-full" variant={isBest ? "primary" : "secondary"}>
                      {t("landing.pricing.cta")}
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-8 text-center text-sm text-ink-faint">
        <p>
          © {new Date().getFullYear()} CoachPage DZ — {t("landing.footer.tagline")}
        </p>
        <div className="mt-2 flex items-center justify-center gap-4">
          <Link to="/terms" className="hover:text-ink hover:underline">
            {t("landing.footer.terms")}
          </Link>
          <Link to="/privacy" className="hover:text-ink hover:underline">
            {t("landing.footer.privacy")}
          </Link>
        </div>
      </footer>
    </div>
  );
}
