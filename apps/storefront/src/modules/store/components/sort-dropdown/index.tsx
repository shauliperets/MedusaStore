"use client"

import { useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { InfoTooltip } from "@modules/common/components/ui"

type SortDropdownProps = {
  sortBy: SortOptions
}

const SortDropdown = ({ sortBy }: SortDropdownProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations("store")
  const tt = useTranslations("tooltips")

  const sortOptions = [
    { value: "created_at", label: t("latestArrivals") },
    { value: "price_asc", label: t("priceLowHigh") },
    { value: "price_desc", label: t("priceHighLow") },
  ]

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("sortBy", e.target.value)
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="flex items-center gap-x-2 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-3 py-2">
      <label className="text-small-semi text-[var(--text-muted)] whitespace-nowrap inline-flex items-center">
        {t("sortBy")}:
        <InfoTooltip tooltip={tt("store.sortBy")} />
      </label>
      <select
        value={sortBy}
        onChange={handleChange}
        className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-2 py-1 text-small-regular text-[var(--text-base)] focus:outline-none focus:ring-2 focus:ring-sky-500/40 cursor-pointer"
        data-testid="sort-by-select"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SortDropdown
