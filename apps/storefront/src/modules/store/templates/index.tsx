import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import CategorySidebar from "@modules/store/components/category-sidebar"
import SortDropdown from "@modules/store/components/sort-dropdown"
import PaginatedProducts from "./paginated-products"
import { Card, Heading, InfoTooltip, Text } from "@modules/common/components/ui"
import MobileFiltersDrawer from "./mobile-filters-drawer"

const StoreTemplate = async ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const t = await getTranslations("store")
  const tt = await getTranslations("tooltips")
  const parsedPageNumber = page ? parseInt(page, 10) : 1
  const pageNumber = Number.isNaN(parsedPageNumber) ? 1 : parsedPageNumber
  const sort = sortBy || "created_at"

  return (
    <div className="content-shell py-8" data-testid="category-container">
      <section className="mb-6 overflow-hidden rounded-2xl border border-[var(--surface-border)] bg-gradient-to-r from-white via-slate-50 to-sky-50/70 px-5 py-6 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900/70 small:px-7">
        <Heading
          level="h1"
          data-testid="store-page-title"
          className="mb-2 inline-flex items-center"
        >
          {t("allProducts")}
          <InfoTooltip tooltip={tt("store.allProducts")} />
        </Heading>
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:sticky lg:top-24 lg:block">
          <CategorySidebar />
        </aside>

        <main className="min-w-0 animate-fade-in">
          <Card>
            <Card.Header className="gap-4 border-b border-[var(--surface-border)]/70 bg-gradient-to-r from-white to-slate-50/50 dark:from-slate-950 dark:to-slate-900/40">
              <div className="flex flex-col gap-3 small:flex-row small:items-center small:justify-between">
                <div>
                  <Heading
                    level="h2"
                    className="text-xl inline-flex items-center"
                  >
                    {t("allProducts")}
                    <InfoTooltip tooltip={tt("store.allProducts")} />
                  </Heading>
                </div>

                <div className="flex items-center gap-3">
                  <MobileFiltersDrawer title={t("categories")}>
                    <CategorySidebar />
                  </MobileFiltersDrawer>
                  <SortDropdown sortBy={sort} />
                </div>
              </div>
            </Card.Header>
            <Card.Content className="pt-6">
              <Suspense fallback={<SkeletonProductGrid />}>
                <PaginatedProducts
                  sortBy={sort}
                  page={pageNumber}
                  countryCode={countryCode}
                />
              </Suspense>
            </Card.Content>
          </Card>
        </main>
      </div>
    </div>
  )
}

export default StoreTemplate
