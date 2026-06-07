import { notFound } from "next/navigation"
import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CategorySidebar from "@modules/store/components/category-sidebar"
import SortDropdown from "@modules/store/components/sort-dropdown"
import MobileFiltersDrawer from "@modules/store/templates/mobile-filters-drawer"
import { Card, Heading, Text } from "@modules/common/components/ui"
import { HttpTypes } from "@medusajs/types"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) {
  const parsedPageNumber = page ? parseInt(page, 10) : 1
  const pageNumber = Number.isNaN(parsedPageNumber) ? 1 : parsedPageNumber
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }

  getParents(category)

  return (
    <div className="content-shell py-8" data-testid="category-container">
      <section className="mb-6 overflow-hidden rounded-2xl border border-[var(--surface-border)] bg-gradient-to-r from-white via-slate-50 to-sky-50/60 px-5 py-6 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900/70 small:px-7">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-[var(--text-muted)]">
          {parents
            .slice()
            .reverse()
            .map((parent) => (
              <LocalizedClientLink
                key={parent.id}
                className="transition-colors hover:text-[var(--text-base)]"
                href={`/categories/${parent.handle}`}
              >
                {parent.name}
              </LocalizedClientLink>
            ))}
          {!!parents.length && <span>/</span>}
          <span className="text-[var(--text-base)]">{category.name}</span>
        </div>
        <Heading level="h1" data-testid="category-page-title" className="mb-2">
          {category.name}
        </Heading>
        {category.description && (
          <Text className="max-w-2xl text-sm text-[var(--text-muted)]">
            {category.description}
          </Text>
        )}
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
                  <Heading level="h2" className="text-xl">
                    {category.name}
                  </Heading>
                  <Text className="text-sm text-[var(--text-muted)]">
                    Browse this category and refine results with sorting.
                  </Text>
                </div>

                <div className="flex items-center gap-3">
                  <MobileFiltersDrawer title="Categories">
                    <CategorySidebar />
                  </MobileFiltersDrawer>
                  <SortDropdown sortBy={sort} />
                </div>
              </div>
            </Card.Header>
            <Card.Content className="pt-6">
              {category.category_children &&
                category.category_children.length > 0 && (
                  <div className="mb-6">
                    <Text className="mb-2 text-sm font-semibold text-[var(--text-base)]">
                      Subcategories
                    </Text>
                    <ul className="grid grid-cols-1 gap-2 small:grid-cols-2">
                      {category.category_children.map((c) => (
                        <li key={c.id}>
                          <LocalizedClientLink
                            href={`/categories/${c.handle}`}
                            className="block rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] transition-colors hover:bg-slate-100 hover:text-[var(--text-base)] dark:hover:bg-slate-900"
                          >
                            {c.name}
                          </LocalizedClientLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              <Suspense
                fallback={
                  <SkeletonProductGrid
                    numberOfProducts={category.products?.length ?? 8}
                  />
                }
              >
                <PaginatedProducts
                  sortBy={sort}
                  page={pageNumber}
                  categoryId={category.id}
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
