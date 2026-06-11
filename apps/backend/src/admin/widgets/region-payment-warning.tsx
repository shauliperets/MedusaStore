/** @format */

import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { HttpTypes } from "@medusajs/types";
import { useTranslation } from "react-i18next";

type RegionDetailsProps = {
  data: HttpTypes.AdminRegion;
};

const InfoIcon = ({ tooltip }: { tooltip: string }) => (
  <span
    title={tooltip}
    className="ml-1.5 inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-amber-300 bg-amber-50 text-[11px] font-bold text-amber-700 transition-colors hover:bg-amber-100 hover:border-amber-400"
    aria-label={tooltip}
  >
    ?
  </span>
);

const LanguageSwitcherInline = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith("he") ? "he" : "en";

  const switchTo = (lang: "en" | "he") => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="inline-flex items-center gap-1.5 rounded-xl border border-ui-border-base bg-ui-bg-subtle p-1">
      <button
        onClick={() => switchTo("en")}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
          currentLang === "en"
            ? "bg-white text-ui-fg-base shadow-sm dark:bg-slate-800"
            : "text-ui-fg-muted hover:text-ui-fg-base"
        }`}
      >
        {currentLang === "en" && "✓ "}🇬🇧 {t("languageSwitcher.english")}
      </button>
      <button
        onClick={() => switchTo("he")}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
          currentLang === "he"
            ? "bg-white text-ui-fg-base shadow-sm dark:bg-slate-800"
            : "text-ui-fg-muted hover:text-ui-fg-base"
        }`}
      >
        {currentLang === "he" && "✓ "}🇮🇱 {t("languageSwitcher.hebrew")}
      </button>
    </div>
  );
};

const RegionPaymentWarningWidget = ({ data }: RegionDetailsProps) => {
  const { t } = useTranslation();
  const hasNoProviders = !data.payment_providers || data.payment_providers.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-semibold text-ui-fg-muted uppercase tracking-wider">Language</span>
        <LanguageSwitcherInline />
      </div>
      {hasNoProviders && (
        <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 shadow-sm">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-base font-bold text-amber-600">
            !
          </div>
          <div>
            <p className="font-semibold mb-1 inline-flex items-center">
              {t("regionPayment.title")}
              <InfoIcon tooltip={t("regionPayment.tooltip")} />
            </p>
            <p className="text-amber-800">{t("regionPayment.description")}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export const config = defineWidgetConfig({
  zone: "region.details.before",
});

export default RegionPaymentWarningWidget;
