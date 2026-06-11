import { InfoTooltip, Text } from "@modules/common/components/ui"
import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MedusaCTA from "@modules/layout/components/medusa-cta"
import { getTranslations } from "next-intl/server"
import { HttpTypes } from "@medusajs/types"

export default async function Footer() {
  const { collections } = await listCollections()
  const product_categories = await listCategories()
  const t = await getTranslations("footer")
  const tt = await getTranslations("tooltips")

  return (
    <footer className="border-t border-[var(--surface-border)] w-full">
      <div className="content-shell flex flex-col w-full">
        <div className="flex flex-col gap-y-6 xsmall:flex-row items-start justify-between py-20">
          <div className="text-sm gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-3">
            {product_categories && product_categories?.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="font-semibold inline-flex items-center">
                  {t("categories")}
                  <InfoTooltip tooltip={tt("footer.categories")} />
                </span>
                <ul className="grid grid-cols-1 gap-2">
                  {product_categories
                    ?.slice(0, 6)
                    .map((c: HttpTypes.StoreProductCategory) => {
                      if (c.parent_category) {
                        return null
                      }

                      const children =
                        c.category_children?.map((child) => ({
                          name: child.name,
                          handle: child.handle,
                          id: child.id,
                        })) || null

                      return (
                        <li
                          className="flex flex-col gap-2 text-[var(--text-muted)]"
                          key={c.id}
                        >
                          <LocalizedClientLink
                            className="hover:text-[var(--text-base)]"
                            href={`/categories/${c.handle}`}
                          >
                            {c.name}
                          </LocalizedClientLink>
                          {children && (
                            <ul className="grid grid-cols-1 ml-3 gap-2">
                              {children.map((child) => (
                                <li key={child.id}>
                                  <LocalizedClientLink
                                    className="hover:text-[var(--text-base)]"
                                    href={`/categories/${child.handle}`}
                                  >
                                    {child.name}
                                  </LocalizedClientLink>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      )
                    })}
                </ul>
              </div>
            )}
            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="font-semibold inline-flex items-center">
                  {t("collections")}
                  <InfoTooltip tooltip={tt("footer.collections")} />
                </span>
                <ul className="grid grid-cols-1 gap-2 text-[var(--text-muted)]">
                  {collections
                    ?.slice(0, 6)
                    .map((c: HttpTypes.StoreCollection) => (
                      <li key={c.id}>
                        <LocalizedClientLink
                          className="hover:text-[var(--text-base)]"
                          href={`/collections/${c.handle}`}
                        >
                          {c.title}
                        </LocalizedClientLink>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
