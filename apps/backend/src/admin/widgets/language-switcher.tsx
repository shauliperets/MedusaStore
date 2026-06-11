/** @format */

import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { useTranslation } from "react-i18next";

const LanguageSwitcherWidget = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith("he") ? "he" : "en";

  const switchTo = (lang: "en" | "he") => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className={`fixed top-3 z-50 ${currentLang === "he" ? "left-14" : "right-14"}`}>
      <div className="inline-flex items-center gap-1 rounded-lg border border-ui-border-base bg-ui-bg-base p-0.5 shadow-md">
        <button
          onClick={() => switchTo("en")}
          className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition-all ${
            currentLang === "en"
              ? "bg-ui-tag-blue-bg text-ui-tag-blue-text shadow-sm"
              : "text-ui-fg-muted hover:text-ui-fg-base"
          }`}
        >
          {currentLang === "en" && "✓ "}🇬🇧 {t("languageSwitcher.english")}
        </button>
        <button
          onClick={() => switchTo("he")}
          className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition-all ${
            currentLang === "he"
              ? "bg-ui-tag-blue-bg text-ui-tag-blue-text shadow-sm"
              : "text-ui-fg-muted hover:text-ui-fg-base"
          }`}
        >
          {currentLang === "he" && "✓ "}🇮🇱 {t("languageSwitcher.hebrew")}
        </button>
      </div>
    </div>
  );
};

export const config = defineWidgetConfig({
  zone: [
    "product.list.before",
    "customer.list.before",
    "order.list.before",
    "region.list.before",
    "product.details.before",
    "customer.details.before",
    "order.details.before",
    "region.details.before",
  ],
});

export default LanguageSwitcherWidget;
