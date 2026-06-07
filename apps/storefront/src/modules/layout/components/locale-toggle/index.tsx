"use client"

import { updateLocale } from "@lib/data/locale-actions"
import { Locale } from "@lib/data/locales"

type LocaleToggleProps = {
  locales: Locale[]
  currentLocale: string | null
}

const LOCALE_LABELS: Record<string, string> = {
  en: "EN",
  he: "HE",
}

export default function LocaleToggle({
  locales,
  currentLocale,
}: LocaleToggleProps) {
  const current = currentLocale ?? "en"

  const handleSwitch = async (locale: string) => {
    await updateLocale(locale)
  }

  return (
    <div className="flex items-center gap-x-1 text-xs font-medium">
      {locales.map((locale, i) => (
        <span key={locale.code} className="flex items-center gap-x-1">
          {i > 0 && <span className="text-ui-fg-muted">|</span>}
          <button
            onClick={() => handleSwitch(locale.code)}
            className={`transition-colors px-0.5 ${
              current === locale.code
                ? "text-ui-fg-base font-semibold"
                : "text-ui-fg-subtle hover:text-ui-fg-base"
            }`}
          >
            {LOCALE_LABELS[locale.code] ?? locale.code.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  )
}
