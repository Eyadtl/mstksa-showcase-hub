import { useLanguage } from "@/contexts/LanguageContext";

/**
 * SkipNavigation Component
 * Provides skip links for keyboard users to bypass repetitive navigation
 * Meets WCAG 2.1 AA requirement for bypass blocks
 */
const SkipNavigation = () => {
  const { t } = useLanguage();

  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="fixed top-4 left-4 rtl:left-auto rtl:right-4 z-[100] bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
      >
        {t("common:accessibility.skipToMain")}
      </a>
      <a
        href="#navigation"
        className="fixed top-4 left-32 rtl:left-auto rtl:right-32 z-[100] bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
      >
        {t("common:accessibility.skipToNav")}
      </a>
    </div>
  );
};

export default SkipNavigation;
