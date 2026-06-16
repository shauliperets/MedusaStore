import { getTenant } from "@lib/context/tenant-context"
import { getTranslations } from "next-intl/server"

export default async function TenantHeroBanner() {
  const [tenant, t] = await Promise.all([getTenant(), getTranslations("hero")])

  const headline = tenant?.headline ?? t("defaultHeadline")
  const tagline = tenant?.tagline ?? t("defaultTagline")

  return (
    <section className="w-full py-4 sm:py-6 md:py-10">
      <div className="surface-card content-shell relative overflow-hidden rounded-2xl md:rounded-3xl border p-6 sm:p-8 md:p-12 lg:p-16">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "var(--hero-gradient)" }}
        />
        <div className="relative mx-auto max-w-4xl text-center animate-fade-in">
          <div className="mb-4 inline-flex rounded-full border border-indigo-200 bg-white/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-700 shadow-sm dark:border-indigo-800 dark:bg-slate-900/90 dark:text-indigo-300">
            Commerce OS 2026
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight tracking-tight text-[var(--text-base)] inline-flex items-center justify-center w-full gap-2">
            {headline}
          </h1>
          {tagline && (
            <p className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-[var(--text-muted)] leading-relaxed inline-flex items-center justify-center gap-2">
              {tagline}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
