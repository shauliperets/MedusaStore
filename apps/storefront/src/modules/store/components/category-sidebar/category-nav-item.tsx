"use client"

import { useParams, usePathname } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"

type CategoryNavItemProps = {
  href: string
  label: string
  exact?: boolean
}

const CategoryNavItem = ({ href, label, exact = false }: CategoryNavItemProps) => {
  const route = usePathname()
  const { countryCode } = useParams() as { countryCode: string }
  const pathSuffix = route.split(countryCode)[1]

  const isActive = exact
    ? pathSuffix === href
    : pathSuffix === href || pathSuffix?.startsWith(`${href}/`)

  return (
    <LocalizedClientLink
      href={href}
      className={clx(
        "block w-full rounded-md px-3 py-2 text-sm font-medium",
        "text-[var(--text-muted)] transition-colors duration-200",
        "hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-[var(--brand-primary)]",
        isActive && [
          "border-l-2 border-[var(--brand-primary)]",
          "bg-indigo-50/70 dark:bg-indigo-950/40",
          "text-[var(--brand-primary)] font-semibold",
          "pl-[10px] rounded-l-none",
        ]
      )}
    >
      {label}
    </LocalizedClientLink>
  )
}

export default CategoryNavItem
