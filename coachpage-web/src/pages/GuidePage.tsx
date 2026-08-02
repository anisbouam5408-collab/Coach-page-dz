import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  CreditCard,
  Dumbbell,
  Globe,
  KeyRound,
  Mail,
  MessageCircle,
  MessageSquare,
  Receipt,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
  Utensils,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { FacebookIcon, InstagramIcon } from "@/components/icons/SocialIcons";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { usePlans } from "@/hooks/usePlans";

function buildSteps(whatsapp: string) {
  return [
    {
      icon: UserPlus,
      title: "1. أنشئ حسابك",
      desc: "اضغط على «ابدأ 7 أيام مجاناً» وأدخل اسمك واسم المستخدم وبريدك الإلكتروني — بدون بطاقة بنكية.",
    },
    {
      icon: Mail,
      title: "2. فعّل حسابك من بريدك الإلكتروني",
      desc: "نرسل لك رابط تأكيد مباشرة على بريدك الإلكتروني. افتح الرسالة واضغط الرابط — سيتم فتح لوحة التحكم تلقائياً.",
    },
    {
      icon: Users,
      title: "3. أضف عملاءك",
      desc: "من لوحة التحكم، اضغط «عميل جديد» وأدخل بياناته ووزنه وهدفه. من ملفه تقدر تدير برنامجه التدريبي والغذائي، مواعيده، ومدفوعاته.",
    },
    {
      icon: Zap,
      title: "4. استكشف كل وحدات المنصة",
      desc: "من القائمة الجانبية عندك: العملاء، البرامج التدريبية والغذائية، المواعيد، الاشتراكات، الفواتير، الرسائل، التقارير، والإعدادات — كل شيء في مكان واحد.",
    },
    {
      icon: MessageCircle,
      title: "5. فعّل اشتراكك عبر واتساب",
      desc: `عند انتهاء التجربة المجانية، اختر الخطة المناسبة واضغط «تفعيل عبر واتساب» — سيتم فتح محادثة جاهزة مع فريقنا على الرقم ${whatsapp} تحتوي على بياناتك والخطة المختارة.`,
    },
  ];
}

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const FEATURES: Feature[] = [
  {
    icon: Users,
    title: "العملاء",
    desc: "ملف شامل لكل عميل بأربعة تبويبات: نظرة عامة (بياناته وحالته)، المقاسات (الوزن، القياسات الجسدية، صور المتابعة)، الحصص (برنامجه التدريبي)، والمدفوعات (فواتيره).",
  },
  {
    icon: Dumbbell,
    title: "البرامج التدريبية",
    desc: "أنشئ برامج تدريب مخصصة أو قوالب جاهزة، أضف أياماً وتمارين مع المجموعات والتكرارات وأوقات الراحة.",
  },
  {
    icon: Utensils,
    title: "البرامج الغذائية",
    desc: "خطط تغذية لكل عميل مع وجبات مفصّلة (التوقيت، المكونات، السعرات) وهدف السعرات اليومي.",
  },
  {
    icon: CalendarClock,
    title: "المواعيد",
    desc: "جدولة حصص وجلسات مع عملائك، وتحديدها كمنجزة أو ملغاة، مع قائمة للمواعيد القادمة وسجل كامل للسابقة.",
  },
  {
    icon: CreditCard,
    title: "الاشتراكات",
    desc: "خطط أسعار مرنة (شهري، ربع سنوي، خماسي)، مع تجديد فوري وتفعيل عبر واتساب بدون تعقيد.",
  },
  {
    icon: Receipt,
    title: "الفواتير",
    desc: "سجل يدوي لمدفوعات عملائك — أنشئ فاتورة، حدّدها كمدفوعة، وتابع المجموع المستحق والمحصّل.",
  },
  {
    icon: MessageSquare,
    title: "الرسائل",
    desc: "قوالب رسائل جاهزة (ترحيب، تذكير بالتجديد، متابعة، تحفيز) تُفتح مباشرة في واتساب مع كل عميل.",
  },
  {
    icon: BarChart3,
    title: "التقارير",
    desc: "نظرة شاملة على توزيع حالة عملائك، متوسط مدة بقائهم، وقائمة بالاشتراكات القريبة من الانتهاء.",
  },
  {
    icon: Settings,
    title: "الإعدادات",
    desc: "عدّل بياناتك الشخصية ورقم واتساب الظاهر لعملائك وتخصصك ونبذتك التعريفية.",
  },
];

interface InfoItem {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const INFO_ITEMS: InfoItem[] = [
  {
    icon: ShieldCheck,
    title: "قفل تلقائي عند انتهاء الاشتراك",
    desc: "مثل نتفليكس تماماً: عند انتهاء التجربة المجانية أو الاشتراك المدفوع، يُقفل الوصول للوحة التحكم تلقائياً حتى تعيد التفعيل عبر واتساب بعد الدفع.",
  },
  {
    icon: KeyRound,
    title: "استعادة كلمة المرور عبر واتساب",
    desc: "لأسباب أمنية، استعادة الوصول لحسابك تتم فقط بالتواصل المباشر مع المشرف على واتساب للتحقق من هويتك.",
  },
  {
    icon: Globe,
    title: "المنصة بالعربية والفرنسية",
    desc: "تقدر تبدّل لغة الواجهة بين العربية والفرنسية من زر AR/FR الموجود في أعلى الصفحات.",
  },
];

export function GuidePage() {
  const settings = usePlatformSettings();
  const { plans } = usePlans();
  const whatsapp = settings?.owner_whatsapp || "213553093511";
  const STEPS = buildSteps(whatsapp);

  return (
    <div className="min-h-svh bg-canvas px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
          <ArrowRight className="size-4 rtl:rotate-180" />
          العودة للرئيسية
        </Link>

        <h1 className="text-3xl font-extrabold text-ink">دليل الاستخدام</h1>
        <p className="mt-2 text-ink-muted">كل ما تحتاج معرفته للبدء في إدارة عملائك باحترافية على CoachPage DZ.</p>

        <h2 className="mt-10 mb-4 text-xl font-bold text-ink">البداية السريعة</h2>
        <div className="flex flex-col gap-4">
          {STEPS.map((step) => (
            <Card key={step.title} className="flex items-start gap-4 text-right">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <step.icon className="size-5" />
              </div>
              <div>
                <h3 className="font-bold text-ink">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{step.desc}</p>
              </div>
            </Card>
          ))}
        </div>

        <h2 className="mt-12 mb-4 text-xl font-bold text-ink">ميزات المنصة</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <Card key={f.title} className="text-right">
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <f.icon className="size-5" />
              </div>
              <h3 className="mb-1 font-bold text-ink">{f.title}</h3>
              <p className="text-sm leading-relaxed text-ink-muted">{f.desc}</p>
            </Card>
          ))}
        </div>

        {plans.length > 0 && (
          <>
            <h2 className="mt-12 mb-4 text-xl font-bold text-ink">خطط الأسعار</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {plans.map((plan) => (
                <Card key={plan.code} className="text-center">
                  <p className="text-sm font-semibold text-ink-muted">{plan.label}</p>
                  <p className="mt-1 text-2xl font-extrabold text-ink">
                    {plan.price_dzd.toLocaleString("ar-DZ")}
                    <span className="text-sm font-medium text-ink-faint"> دج</span>
                  </p>
                  <p className="mt-1 text-xs text-ink-faint">لمدة {plan.duration_days} يوماً</p>
                </Card>
              ))}
            </div>
          </>
        )}

        <h2 className="mt-12 mb-4 text-xl font-bold text-ink">معلومات مهمة</h2>
        <div className="flex flex-col gap-4">
          {INFO_ITEMS.map((item) => (
            <Card key={item.title} className="flex items-start gap-4 text-right">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <item.icon className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription>{item.desc}</CardDescription>
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
          <div className="mt-4 flex items-center justify-center gap-3">
            <a
              href="https://www.instagram.com/coachpage_dz?igsh=MTR3eXVsNzRycHNoMg=="
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex size-9 items-center justify-center rounded-full border border-border-strong text-ink-muted transition-colors hover:border-brand-500 hover:text-brand-600"
            >
              <InstagramIcon className="size-4.5" />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61576424587886"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="flex size-9 items-center justify-center rounded-full border border-border-strong text-ink-muted transition-colors hover:border-brand-500 hover:text-brand-600"
            >
              <FacebookIcon className="size-4.5" />
            </a>
          </div>
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
