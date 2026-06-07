import { Suspense } from "react"
import { listLocales } from "@lib/data/locales"
import { listRegions } from "@lib/data/regions"
import { getTenantStoreName } from "@lib/context/tenant-context"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import ThemeToggle from "@modules/layout/components/theme-toggle"
import { Button } from "@modules/common/components/ui"
import { Home, LayoutGrid, User } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { getLocale } from "next-intl/server"

export default async function Nav() {
  const [storeName, regions, locales, currentLocale, t] = await Promise.all([
    getTenantStoreName(),
    listRegions(),
    listLocales(),
    getLocale(),
    getTranslations("nav"),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b duration-200 bg-[var(--surface-glass)] border-[var(--surface-border)]">
        <nav className="content-shell flex items-center justify-between w-full h-full text-small-regular">
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full md:hidden">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
              />
            </div>
            <div className="hidden h-full md:flex items-center gap-x-6">
              <LocalizedClientLink
                href="/store"
                className="hover:text-[var(--brand-primary)] transition-colors"
                data-testid="nav-store-link"
              >
                <Home aria-hidden="true" className="h-6 w-6" />
              </LocalizedClientLink>
            </div>
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="text-xl-semi uppercase"
              data-testid="nav-store-link"
            >
              {storeName}
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <div className="hidden small:flex items-center gap-x-6">
              <ThemeToggle />
              <LocalizedClientLink
                className="hover:text-[var(--brand-primary)] transition-colors"
                href="/account"
                data-testid="nav-account-link"
              >
                {t("account")}
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-[var(--brand-primary)] transition-colors flex gap-2"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  {t("cart")} (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
