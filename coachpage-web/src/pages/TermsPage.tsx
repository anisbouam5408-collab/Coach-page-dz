import { Link } from "react-router-dom";
import { ArrowRight, Dumbbell } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function TermsPage() {
  return (
    <div className="min-h-svh bg-canvas px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
          <ArrowRight className="size-4 rtl:rotate-180" />
          العودة للرئيسية
        </Link>

        <div className="mb-6 flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-brand-500 text-white">
            <Dumbbell className="size-5" />
          </div>
          <span className="text-lg font-extrabold text-ink">CoachPage DZ</span>
        </div>

        <h1 className="text-3xl font-extrabold text-ink">شروط الاستخدام</h1>
        <p className="mt-2 text-sm text-ink-faint">آخر تحديث: 2026</p>

        <Card className="mt-8 flex flex-col gap-6 text-right">
          <section>
            <h2 className="mb-2 font-bold text-ink">١. طبيعة الخدمة</h2>
            <p className="text-sm leading-relaxed text-ink-muted">
              CoachPage DZ منصة إلكترونية تساعد المدربين الشخصيين في الجزائر على إدارة عملائهم وبرامجهم التدريبية.
              باستخدامك للمنصة فإنك توافق على هذه الشروط بالكامل.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-bold text-ink">٢. التسجيل والحساب</h2>
            <p className="text-sm leading-relaxed text-ink-muted">
              يجب تقديم معلومات صحيحة عند التسجيل (الاسم، البريد الإلكتروني، رقم الهاتف). أنت مسؤول عن الحفاظ على سرية
              كلمة مرورك وعن كل نشاط يحدث من حسابك.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-bold text-ink">٣. التجربة المجانية والاشتراكات</h2>
            <p className="text-sm leading-relaxed text-ink-muted">
              يحصل كل مدرب جديد على تجربة مجانية مدتها 7 أيام دون الحاجة لبطاقة بنكية. بعد انتهاء التجربة، يتطلب
              الاستمرار في استخدام المنصة اختيار إحدى الخطط المدفوعة (شهرية، ربع سنوية، أو خمسة أشهر) بالأسعار المعروضة
              في الموقع وقت الاشتراك.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-bold text-ink">٤. الدفع والتفعيل</h2>
            <p className="text-sm leading-relaxed text-ink-muted">
              يتم الدفع حالياً يدوياً عبر تحويل بنكي/بريدي (CCP) ثم إرسال إثبات الدفع عبر واتساب. يقوم فريق الإدارة
              بتفعيل الاشتراك بعد التحقق من الدفع، وقد يستغرق ذلك بعض الوقت. المنصة غير مسؤولة عن التأخير الناتج عن
              تأخر التحويل البنكي نفسه.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-bold text-ink">٥. بيانات العملاء</h2>
            <p className="text-sm leading-relaxed text-ink-muted">
              أنت (المدرب) المسؤول الوحيد عن دقة البيانات التي تُدخلها عن عملائك (الاسم، الوزن، الأهداف، البرامج
              التدريبية)، وعن الحصول على موافقة عملائك على حفظ بياناتهم لديك عبر المنصة عند الحاجة.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-bold text-ink">٦. إيقاف الخدمة أو الحساب</h2>
            <p className="text-sm leading-relaxed text-ink-muted">
              يحق للإدارة تجميد أو حذف أي حساب يخالف هذه الشروط أو يُستخدم بشكل مسيء. يمكنك أيضاً طلب حذف حسابك في أي
              وقت بالتواصل معنا عبر واتساب.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-bold text-ink">٧. حدود المسؤولية</h2>
            <p className="text-sm leading-relaxed text-ink-muted">
              تُقدَّم المنصة "كما هي" دون ضمانات إضافية. لا تتحمل CoachPage DZ مسؤولية أي قرارات تدريبية أو غذائية
              يتخذها المدرب أو عملاؤه بناءً على المعلومات المُدخلة في المنصة.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-bold text-ink">٨. تعديل الشروط</h2>
            <p className="text-sm leading-relaxed text-ink-muted">
              قد تُحدَّث هذه الشروط من وقت لآخر. الاستمرار في استخدام المنصة بعد أي تحديث يُعتبر موافقة على الشروط
              الجديدة.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-bold text-ink">٩. القانون المُطبَّق</h2>
            <p className="text-sm leading-relaxed text-ink-muted">تخضع هذه الشروط للقوانين المعمول بها في الجزائر.</p>
          </section>

          <section>
            <h2 className="mb-2 font-bold text-ink">١٠. التواصل</h2>
            <p className="text-sm leading-relaxed text-ink-muted">
              لأي استفسار حول هذه الشروط، تواصل معنا عبر واتساب على الرقم 0553093511.
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
}
