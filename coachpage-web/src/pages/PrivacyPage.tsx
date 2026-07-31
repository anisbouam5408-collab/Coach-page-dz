import { Link } from "react-router-dom";
import { ArrowRight, Dumbbell } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function PrivacyPage() {
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

        <h1 className="text-3xl font-extrabold text-ink">سياسة الخصوصية</h1>
        <p className="mt-2 text-sm text-ink-faint">آخر تحديث: 2026</p>

        <Card className="mt-8 flex flex-col gap-6 text-right">
          <section>
            <h2 className="mb-2 font-bold text-ink">١. البيانات التي نجمعها</h2>
            <p className="text-sm leading-relaxed text-ink-muted">
              عند تسجيلك كمدرب: الاسم الكامل، اسم المستخدم، البريد الإلكتروني، رقم الهاتف. عند إضافتك لعملائك: أسماؤهم
              وأوزانهم وأهدافهم وبرامجهم التدريبية، وهي بيانات يُدخلها المدرب بنفسه ولا نطلبها مباشرة من العميل.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-bold text-ink">٢. كيف نستخدم بياناتك</h2>
            <p className="text-sm leading-relaxed text-ink-muted">
              نستخدم بياناتك فقط من أجل: تشغيل حسابك ولوحة تحكمك، التواصل معك بخصوص اشتراكك (عبر واتساب)، وتحسين
              المنصة. لا نستخدم بياناتك لأي غرض إعلاني ولا نبيعها لأي طرف ثالث.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-bold text-ink">٣. أين تُخزَّن بياناتك</h2>
            <p className="text-sm leading-relaxed text-ink-muted">
              تُخزَّن جميع البيانات على خوادم Supabase (مزوّد قواعد بيانات سحابي) مع تفعيل صلاحيات وصول صارمة (Row Level
              Security) تضمن أن كل مدرب لا يرى سوى بياناته وبيانات عملائه فقط، ولا يمكن لأي مدرب آخر الوصول إليها.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-bold text-ink">٤. من يمكنه الوصول إلى بياناتك</h2>
            <p className="text-sm leading-relaxed text-ink-muted">
              أنت (المدرب) فقط، وفريق إدارة المنصة عند الحاجة للدعم الفني أو مراجعة الاشتراكات. لا نشارك بياناتك مع أي
              شركة إعلانات أو طرف خارجي.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-bold text-ink">٥. ملفات تعريف الارتباط والتخزين المحلي</h2>
            <p className="text-sm leading-relaxed text-ink-muted">
              يستخدم الموقع التخزين المحلي في متصفحك (localStorage) بشكل تقني بحت لإتمام عملية التسجيل بعد تأكيد
              البريد الإلكتروني، ولحفظ جلسة الدخول. لا نستخدم أي أدوات تتبع إعلاني.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-bold text-ink">٦. حقوقك</h2>
            <p className="text-sm leading-relaxed text-ink-muted">
              يمكنك في أي وقت طلب الاطلاع على بياناتك، تصحيحها، أو حذف حسابك بالكامل مع جميع بيانات عملائك، بالتواصل
              معنا عبر واتساب على الرقم 0553093511.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-bold text-ink">٧. أمان البيانات</h2>
            <p className="text-sm leading-relaxed text-ink-muted">
              تُنقل جميع البيانات عبر اتصال مشفّر (HTTPS)، وتُحمى كلمات المرور بتشفير لا رجعة فيه، ولا يمكن لأي شخص —
              بما في ذلك فريقنا — الاطلاع على كلمة مرورك.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-bold text-ink">٨. تعديل هذه السياسة</h2>
            <p className="text-sm leading-relaxed text-ink-muted">
              قد تُحدَّث هذه السياسة من وقت لآخر لتعكس تطور الخدمة. سيُنشر أي تحديث جوهري على هذه الصفحة.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-bold text-ink">٩. التواصل</h2>
            <p className="text-sm leading-relaxed text-ink-muted">
              لأي استفسار حول خصوصية بياناتك، تواصل معنا عبر واتساب على الرقم 0553093511.
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
}
