import { Link } from "react-router-dom";
import { Check, Dumbbell, MessageCircle, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { usePlans } from "@/hooks/usePlans";

export function LandingPage() {
  const { plans } = usePlans();
  const bestValueCode = "QUARTERLY";

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
            دليل الاستخدام
          </Link>
          <Link to="/login">
            <Button variant="ghost" size="sm">
              تسجيل الدخول
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm">ابدأ مجاناً</Button>
          </Link>
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
            منصة المدربين الجزائريين رقم 1
          </Badge>
          <h1 className="mx-auto max-w-3xl text-4xl leading-[1.15] font-extrabold text-ink sm:text-6xl">
            نظّم أعمالك كمدرب شخصي،
            <br />
            <span className="text-gradient-brand">وركّز على عملائك فقط</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
            إدارة العملاء، البرامج التدريبية، والاشتراكات — كل شيء في مكان واحد، مصمم خصيصاً للمدربين في الجزائر.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/register">
              <Button size="lg">ابدأ 7 أيام مجاناً</Button>
            </Link>
            <Link to="/guide">
              <Button size="lg" variant="secondary">
                شاهد كيف تعمل المنصة
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-ink-faint">بدون بطاقة بنكية — تجربة مجانية كاملة الصلاحيات</p>
        </section>

        <section className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-6 pb-20 sm:grid-cols-3">
          {[
            { icon: Users, title: "إدارة العملاء", desc: "أضف عملاءك، تابع أوزانهم وأهدافهم وبرامجهم من مكان واحد." },
            { icon: MessageCircle, title: "تفعيل سريع عبر واتساب", desc: "اختر خطتك واطلب التفعيل مباشرة، بدون تعقيد." },
            { icon: ShieldCheck, title: "بياناتك محمية", desc: "كل مدرب يرى فقط عملاءه — عزل كامل بين الحسابات." },
          ].map((f) => (
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
            <h2 className="text-3xl font-extrabold text-ink">خطط أسعار واضحة</h2>
            <p className="mt-2 text-ink-muted">اختر الخطة التي تناسب نشاطك — بدون أي رسوم خفية</p>
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
                      <Badge tone="brand">الأكثر طلباً</Badge>
                    </div>
                  )}
                  <p className="text-sm font-semibold text-ink-muted">{plan.label}</p>
                  <p className="mt-2 text-4xl font-extrabold text-ink">
                    {plan.price_dzd.toLocaleString("ar-DZ")}
                    <span className="text-base font-medium text-ink-faint"> دج</span>
                  </p>
                  <p className="mt-1 text-xs text-ink-faint">لمدة {plan.duration_days} يوماً</p>
                  <ul className="mt-6 flex flex-col gap-2.5 text-right text-sm text-ink-muted">
                    {["عملاء بلا حدود", "برامج تدريبية مخصصة", "دعم عبر واتساب", "لوحة تحكم كاملة"].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <Check className="size-4 shrink-0 text-brand-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register" className="mt-6 block">
                    <Button className="w-full" variant={isBest ? "primary" : "secondary"}>
                      ابدأ الآن
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-8 text-center text-sm text-ink-faint">
        © {new Date().getFullYear()} CoachPage DZ — منصة إدارة أعمال المدربين في الجزائر
      </footer>
    </div>
  );
}
