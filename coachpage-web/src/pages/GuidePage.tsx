import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle, UserPlus, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

function buildSteps(whatsapp: string) {
  return [
    {
      icon: UserPlus,
      title: "1. أنشئ حسابك",
      desc: "اضغط على «ابدأ 7 أيام مجاناً»، أدخل اسمك واسم المستخدم وبريدك الإلكتروني — تحصل فوراً على تجربة مجانية كاملة الصلاحيات، بدون بطاقة بنكية.",
    },
    {
      icon: Users,
      title: "2. أضف عملاءك",
      desc: "من لوحة التحكم، اضغط «عميل جديد» وأدخل اسمه ووزنه وهدفه وبرنامجه التدريبي. يمكنك تعديل أو حذف أي عميل في أي وقت.",
    },
    {
      icon: MessageCircle,
      title: "3. فعّل اشتراكك عبر واتساب",
      desc: `عند انتهاء التجربة المجانية، اختر الخطة المناسبة واضغط «تفعيل عبر واتساب» — سيتم فتح محادثة جاهزة مع فريقنا على الرقم ${whatsapp} تحتوي على بياناتك والخطة المختارة.`,
    },
    {
      icon: Zap,
      title: "4. استمتع بلوحة تحكم كاملة",
      desc: "بعد المراجعة والتفعيل من طرف الإدارة، يصبح حسابك نشطاً ويمكنك متابعة كل عملائك من مكان واحد.",
    },
  ];
}

export function GuidePage() {
  const settings = usePlatformSettings();
  const whatsapp = settings?.owner_whatsapp || "213553093511";
  const STEPS = buildSteps(whatsapp);

  return (
    <div className="min-h-svh bg-canvas px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
          <ArrowRight className="size-4 rtl:rotate-180" />
          العودة للرئيسية
        </Link>

        <h1 className="text-3xl font-extrabold text-ink">دليل الاستخدام</h1>
        <p className="mt-2 text-ink-muted">أربع خطوات بسيطة لتبدأ في إدارة عملائك باحترافية.</p>

        <div className="mt-10 flex flex-col gap-5">
          {STEPS.map((step) => (
            <Card key={step.title} className="flex items-start gap-4 text-right">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <step.icon className="size-5" />
              </div>
              <div>
                <h2 className="font-bold text-ink">{step.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{step.desc}</p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-8 text-center">
          <p className="text-sm text-ink-muted">هل تحتاج مساعدة؟ تواصل معنا مباشرة عبر واتساب</p>
          <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="mt-3 block">
            <Button variant="secondary" className="w-full">
              <MessageCircle className="size-4" />
              {whatsapp}
            </Button>
          </a>
        </Card>

        <Link to="/register" className="mt-8 block">
          <Button className="w-full" size="lg">
            ابدأ الآن مجاناً
          </Button>
        </Link>
      </div>
    </div>
  );
}
