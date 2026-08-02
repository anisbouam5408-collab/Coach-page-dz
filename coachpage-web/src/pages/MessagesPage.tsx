import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MessageSquare, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import type { Client } from "@/types/domain";

interface Template {
  key: string;
  label: string;
  build: (clientName: string, coachName: string) => string;
}

const TEMPLATES: Template[] = [
  {
    key: "welcome",
    label: "ترحيب بعميل جديد",
    build: (clientName, coachName) =>
      `مرحباً ${clientName} 👋\nأنا ${coachName}، مدربك في CoachPage DZ.\nأهلاً بيك معنا! جاهز نبداو رحلتك نحو أهدافك.`,
  },
  {
    key: "renewal",
    label: "تذكير بتجديد الاشتراك",
    build: (clientName) =>
      `مرحباً ${clientName}،\nنذكرك أن اشتراكك مع قرب من الانتهاء. تواصل معايا باش نجددو ونكملو رحلتك بدون توقف 💪`,
  },
  {
    key: "checkin",
    label: "متابعة (لم يسجل وزنه)",
    build: (clientName) =>
      `مرحباً ${clientName}،\nلاحظت ما سجلتش وزنك هاذ الأسبوع. خبرني كيفاش راك ماشي مع البرنامج ونعاونك إذا كاين مشكل.`,
  },
  {
    key: "motivation",
    label: "رسالة تحفيزية",
    build: (clientName) =>
      `${clientName}، تذكر: الاستمرارية هي السر 🔥\nكل يوم تخدم فيه على روحك هو خطوة نحو الهدف. كمل هكا، أنا هنا نعاونك.`,
  },
  {
    key: "custom",
    label: "رسالة مخصصة",
    build: () => "",
  },
];

function digitsOnly(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

export function MessagesPage() {
  const { coach } = useAuthStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [templateKey, setTemplateKey] = useState(TEMPLATES[0].key);
  const [customText, setCustomText] = useState("");

  useEffect(() => {
    if (!coach) return;
    supabase
      .from("clients")
      .select("*")
      .eq("coach_id", coach.id)
      .order("full_name")
      .then(({ data }) => {
        setClients((data as Client[]) ?? []);
        setLoading(false);
      });
  }, [coach]);

  const filtered = useMemo(
    () => clients.filter((c) => c.full_name.toLowerCase().includes(search.trim().toLowerCase())),
    [clients, search],
  );

  const template = TEMPLATES.find((t) => t.key === templateKey)!;

  function messageFor(client: Client) {
    if (template.key === "custom") return customText;
    return template.build(client.full_name, coach?.full_name ?? "مدربك");
  }

  function waLink(client: Client) {
    if (!client.phone_number) return null;
    const text = messageFor(client);
    return `https://wa.me/${digitsOnly(client.phone_number)}?text=${encodeURIComponent(text)}`;
  }

  if (!coach || loading) {
    return <div className="flex min-h-svh items-center justify-center text-ink-muted">جارٍ التحميل...</div>;
  }

  return (
    <div className="min-h-svh bg-canvas">
      <header className="border-b border-border bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Link
            to="/dashboard"
            className="flex size-9 items-center justify-center rounded-xl border border-border-strong text-ink-muted hover:bg-surface-muted"
          >
            <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
          <div>
            <p className="font-bold text-ink">الرسائل</p>
            <p className="text-xs text-ink-faint">راسل عملاءك مباشرة عبر واتساب بقوالب جاهزة</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <Card className="mb-6">
          <CardTitle className="mb-1 flex items-center gap-2">
            <MessageSquare className="size-4 text-brand-500" />
            اختر القالب
          </CardTitle>
          <CardDescription className="mb-4">
            اختر رسالة جاهزة، أو اكتب رسالة مخصصة، ثم اضغط "إرسال" بجانب أي عميل لفتحها مباشرة في واتساب.
          </CardDescription>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTemplateKey(t.key)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  templateKey === t.key
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-border-strong text-ink-muted hover:bg-surface-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {template.key === "custom" && (
            <div className="mt-4">
              <Label htmlFor="custom_text">نص الرسالة</Label>
              <textarea
                id="custom_text"
                rows={3}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400/40"
              />
            </div>
          )}
        </Card>

        <Card>
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
            <Input
              placeholder="ابحث عن عميل..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-faint">لا يوجد عملاء.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {filtered.map((client) => {
                const link = waLink(client);
                return (
                  <div key={client.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{client.full_name}</p>
                      <p className="truncate text-xs text-ink-faint" dir="ltr">
                        {client.phone_number ?? "لا يوجد رقم هاتف"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={link ? "primary" : "secondary"}
                      disabled={!link || (template.key === "custom" && !customText.trim())}
                      onClick={() => link && window.open(link, "_blank", "noopener,noreferrer")}
                    >
                      <Send className="size-3.5" />
                      إرسال
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
