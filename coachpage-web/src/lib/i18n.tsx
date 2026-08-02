import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "ar" | "fr";

const STORAGE_KEY = "coachpage_lang";

const ar = {
  "nav.guide": "دليل الاستخدام",
  "nav.login": "تسجيل الدخول",
  "nav.start": "ابدأ مجاناً",

  "landing.badge": "منصة المدربين الجزائريين رقم 1",
  "landing.hero.title1": "نظّم أعمالك كمدرب شخصي،",
  "landing.hero.title2": "وركّز على عملائك فقط",
  "landing.hero.subtitle": "إدارة العملاء، البرامج التدريبية، والاشتراكات — كل شيء في مكان واحد، مصمم خصيصاً للمدربين في الجزائر.",
  "landing.hero.cta.start": "ابدأ 7 أيام مجاناً",
  "landing.hero.cta.demo": "شاهد كيف تعمل المنصة",
  "landing.hero.note": "بدون بطاقة بنكية — تجربة مجانية كاملة الصلاحيات",
  "landing.feature.clients.title": "إدارة العملاء",
  "landing.feature.clients.desc": "أضف عملاءك، تابع أوزانهم وأهدافهم وبرامجهم من مكان واحد.",
  "landing.feature.whatsapp.title": "تفعيل سريع عبر واتساب",
  "landing.feature.whatsapp.desc": "اختر خطتك واطلب التفعيل مباشرة، بدون تعقيد.",
  "landing.feature.security.title": "بياناتك محمية",
  "landing.feature.security.desc": "كل مدرب يرى فقط عملاءه — عزل كامل بين الحسابات.",
  "landing.pricing.title": "خطط أسعار واضحة",
  "landing.pricing.subtitle": "اختر الخطة التي تناسب نشاطك — بدون أي رسوم خفية",
  "landing.pricing.best": "الأكثر طلباً",
  "landing.pricing.duration": "لمدة {n} يوماً",
  "landing.pricing.perk.clients": "عملاء بلا حدود",
  "landing.pricing.perk.programs": "برامج تدريبية مخصصة",
  "landing.pricing.perk.support": "دعم عبر واتساب",
  "landing.pricing.perk.dashboard": "لوحة تحكم كاملة",
  "landing.pricing.cta": "ابدأ الآن",
  "landing.footer.tagline": "منصة إدارة أعمال المدربين في الجزائر",
  "landing.footer.terms": "شروط الاستخدام",
  "landing.footer.privacy": "سياسة الخصوصية",

  "auth.login.title": "تسجيل الدخول",
  "auth.login.email": "البريد الإلكتروني",
  "auth.login.password": "كلمة المرور",
  "auth.login.forgot": "نسيت كلمة المرور؟",
  "auth.login.submit": "دخول",
  "auth.login.error": "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  "auth.login.noAccount": "ليس لديك حساب؟",
  "auth.login.startTrial": "ابدأ تجربتك المجانية",

  "auth.register.title": "ابدأ 7 أيام مجاناً",
  "auth.register.subtitle": "بدون بطاقة بنكية",
  "auth.register.fullName": "الاسم الكامل",
  "auth.register.username": "اسم المستخدم (رابط صفحتك)",
  "auth.register.email": "البريد الإلكتروني",
  "auth.register.phone": "رقم الهاتف",
  "auth.register.password": "كلمة المرور",
  "auth.register.submit": "إنشاء الحساب",
  "auth.register.haveAccount": "لديك حساب؟",
  "auth.register.login": "سجّل الدخول",
  "auth.register.confirmTitle": "تحقق من بريدك الإلكتروني",
  "auth.register.confirmBody": "أرسلنا رابط تفعيل إلى {email}. افتح الرسالة واضغط على الرابط لتفعيل حسابك مباشرة — سيتم فتح لوحة التحكم تلقائياً.",
  "auth.register.confirmNote": "لم تصلك الرسالة؟ تحقق من مجلد الرسائل غير المرغوبة (Spam).",

  "auth.forgot.title": "استعادة كلمة المرور",
  "auth.forgot.body": "لاستعادة الوصول إلى حسابك، تواصل معنا مباشرة عبر واتساب — سنتأكد من هويتك ونعطيك بيانات دخول جديدة.",
  "auth.forgot.cta": "تواصل معنا عبر واتساب",
  "auth.forgot.back": "العودة لتسجيل الدخول",

  "dashboard.title": "اللوحة الرئيسية",
  "dashboard.stat.total": "إجمالي العملاء",
  "dashboard.stat.active": "الاشتراكات النشطة",
  "dashboard.stat.expiringSoon": "قرب الانتهاء (٥ أيام)",
  "dashboard.stat.expired": "اشتراكات منتهية",
  "sidebar.dashboard": "لوحة التحكم",
  "sidebar.clients": "العملاء",
  "sidebar.training": "البرامج التدريبية",
  "sidebar.nutrition": "البرامج الغذائية",
  "sidebar.appointments": "المواعيد",
  "sidebar.subscriptions": "الاشتراكات",
  "sidebar.invoices": "الفواتير",
  "sidebar.messages": "الرسائل",
  "sidebar.reports": "التقارير",
  "sidebar.settings": "الإعدادات",
  "sidebar.logout": "تسجيل الخروج",

  "clientDetail.tab.overview": "نظرة عامة",
  "clientDetail.tab.measurements": "المقاسات",
  "clientDetail.tab.sessions": "الحصص",
  "clientDetail.tab.payments": "المدفوعات",
} as const;

type Key = keyof typeof ar;

const fr: Record<Key, string> = {
  "nav.guide": "Guide d'utilisation",
  "nav.login": "Connexion",
  "nav.start": "Commencer gratuitement",

  "landing.badge": "Plateforme n°1 des coachs algériens",
  "landing.hero.title1": "Organisez votre activité de coach,",
  "landing.hero.title2": "concentrez-vous sur vos clients",
  "landing.hero.subtitle": "Gestion des clients, programmes d'entraînement et abonnements — tout en un seul endroit, conçu pour les coachs en Algérie.",
  "landing.hero.cta.start": "7 jours gratuits",
  "landing.hero.cta.demo": "Voir comment ça marche",
  "landing.hero.note": "Sans carte bancaire — essai gratuit avec toutes les fonctionnalités",
  "landing.feature.clients.title": "Gestion des clients",
  "landing.feature.clients.desc": "Ajoutez vos clients, suivez leur poids, leurs objectifs et leurs programmes en un seul endroit.",
  "landing.feature.whatsapp.title": "Activation rapide via WhatsApp",
  "landing.feature.whatsapp.desc": "Choisissez votre forfait et demandez l'activation directement, sans complications.",
  "landing.feature.security.title": "Vos données sont protégées",
  "landing.feature.security.desc": "Chaque coach ne voit que ses propres clients — isolation totale entre les comptes.",
  "landing.pricing.title": "Des tarifs clairs",
  "landing.pricing.subtitle": "Choisissez le forfait adapté à votre activité — sans frais cachés",
  "landing.pricing.best": "Le plus demandé",
  "landing.pricing.duration": "pendant {n} jours",
  "landing.pricing.perk.clients": "Clients illimités",
  "landing.pricing.perk.programs": "Programmes d'entraînement personnalisés",
  "landing.pricing.perk.support": "Support via WhatsApp",
  "landing.pricing.perk.dashboard": "Tableau de bord complet",
  "landing.pricing.cta": "Commencer maintenant",
  "landing.footer.tagline": "Plateforme de gestion pour les coachs en Algérie",
  "landing.footer.terms": "Conditions d'utilisation",
  "landing.footer.privacy": "Politique de confidentialité",

  "auth.login.title": "Connexion",
  "auth.login.email": "Adresse e-mail",
  "auth.login.password": "Mot de passe",
  "auth.login.forgot": "Mot de passe oublié ?",
  "auth.login.submit": "Se connecter",
  "auth.login.error": "E-mail ou mot de passe incorrect.",
  "auth.login.noAccount": "Vous n'avez pas de compte ?",
  "auth.login.startTrial": "Commencez votre essai gratuit",

  "auth.register.title": "7 jours gratuits",
  "auth.register.subtitle": "Sans carte bancaire",
  "auth.register.fullName": "Nom complet",
  "auth.register.username": "Nom d'utilisateur (lien de votre page)",
  "auth.register.email": "Adresse e-mail",
  "auth.register.phone": "Numéro de téléphone",
  "auth.register.password": "Mot de passe",
  "auth.register.submit": "Créer le compte",
  "auth.register.haveAccount": "Vous avez déjà un compte ?",
  "auth.register.login": "Connectez-vous",
  "auth.register.confirmTitle": "Vérifiez votre e-mail",
  "auth.register.confirmBody": "Nous avons envoyé un lien d'activation à {email}. Ouvrez le message et cliquez sur le lien pour activer votre compte directement — le tableau de bord s'ouvrira automatiquement.",
  "auth.register.confirmNote": "Vous n'avez rien reçu ? Vérifiez votre dossier spam.",

  "auth.forgot.title": "Récupération du mot de passe",
  "auth.forgot.body": "Pour récupérer l'accès à votre compte, contactez-nous directement via WhatsApp — nous vérifierons votre identité et vous fournirons de nouveaux identifiants.",
  "auth.forgot.cta": "Contactez-nous via WhatsApp",
  "auth.forgot.back": "Retour à la connexion",

  "dashboard.title": "Tableau de bord",
  "dashboard.stat.total": "Total des clients",
  "dashboard.stat.active": "Abonnements actifs",
  "dashboard.stat.expiringSoon": "Bientôt expirés (5 jours)",
  "dashboard.stat.expired": "Abonnements expirés",
  "sidebar.dashboard": "Tableau de bord",
  "sidebar.clients": "Clients",
  "sidebar.training": "Programmes d'entraînement",
  "sidebar.nutrition": "Programmes alimentaires",
  "sidebar.appointments": "Rendez-vous",
  "sidebar.subscriptions": "Abonnements",
  "sidebar.invoices": "Factures",
  "sidebar.messages": "Messages",
  "sidebar.reports": "Rapports",
  "sidebar.settings": "Paramètres",
  "sidebar.logout": "Déconnexion",

  "clientDetail.tab.overview": "Aperçu",
  "clientDetail.tab.measurements": "Mesures",
  "clientDetail.tab.sessions": "Séances",
  "clientDetail.tab.payments": "Paiements",
};

const DICTS: Record<Lang, Record<Key, string>> = { ar, fr };

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: Key, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "fr" ? "fr" : "ar";
  });

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
  }, []);

  const t = useCallback(
    (key: Key, vars?: Record<string, string | number>) => {
      let text = DICTS[lang][key] ?? DICTS.ar[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.replace(`{${k}}`, String(v));
        }
      }
      return text;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
