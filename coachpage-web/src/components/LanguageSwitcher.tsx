import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className, dark }: { className?: string; dark?: boolean }) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full border p-1",
        dark ? "border-white/15 bg-white/5" : "border-border-strong bg-surface",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setLang("ar")}
        title="العربية"
        aria-label="العربية"
        className={cn(
          "flex size-7 items-center justify-center rounded-full text-sm transition-opacity",
          lang === "ar" ? "bg-brand-500/15 opacity-100 ring-1 ring-brand-500/40" : "opacity-40 hover:opacity-70",
        )}
      >
        🇩🇿
      </button>
      <button
        type="button"
        onClick={() => setLang("fr")}
        title="Français"
        aria-label="Français"
        className={cn(
          "flex size-7 items-center justify-center rounded-full text-sm transition-opacity",
          lang === "fr" ? "bg-brand-500/15 opacity-100 ring-1 ring-brand-500/40" : "opacity-40 hover:opacity-70",
        )}
      >
        🇫🇷
      </button>
    </div>
  );
}
