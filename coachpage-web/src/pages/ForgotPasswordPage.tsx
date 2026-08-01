import { Link } from "react-router-dom";
import { Dumbbell, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function ForgotPasswordPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-canvas px-6">
      <Card className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-brand-500 text-white">
            <Dumbbell className="size-5" />
          </div>
          <h1 className="text-xl font-bold text-ink">استعادة كلمة المرور</h1>
        </div>

        <div className="text-center">
          <p className="text-sm text-ink-muted">
            لاستعادة الوصول إلى حسابك، تواصل معنا مباشرة عبر واتساب — سنتأكد من هويتك ونعطيك بيانات دخول جديدة.
          </p>
          <a
            href="https://wa.me/213553093511?text=مرحبا، أحتاج مساعدة لاستعادة الوصول إلى حسابي في CoachPage DZ."
            target="_blank"
            rel="noreferrer"
            className="mt-6 block"
          >
            <Button className="w-full">
              <MessageCircle className="size-4" />
              تواصل معنا عبر واتساب
            </Button>
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
