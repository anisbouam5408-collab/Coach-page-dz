import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className, dark }: { className?: string; dark?: boolean }) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border p-0.5 text-[11px] font-extrabold",
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
          "rounded-full px-2 py-1 transition-colors",
          lang === "ar"
            ? "bg-brand-500 text-white"
            : dark
              ? "text-white/50 hover:text-white/80"
              : "text-ink-faint hover:text-ink-muted",
        )}
      >
        AR
      </button>
      <button
        type="button"
        onClick={() => setLang("fr")}
        title="Français"
        aria-label="Français"
        className={cn(
          "rounded-full px-2 py-1 transition-colors",
          lang === "fr"
            ? "bg-brand-500 text-white"
            : dark
              ? "text-white/50 hover:text-white/80"
              : "text-ink-faint hover:text-ink-muted",
        )}
      >
        FR
      </button>
    </div>
  );
}
