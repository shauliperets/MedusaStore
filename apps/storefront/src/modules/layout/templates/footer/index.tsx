import { Text } from "@modules/common/components/ui"
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

  return (
    <footer className="border-t border-[var(--surface-border)] w-full">
      <div className="content-shell flex flex-col w-full">
        <div className="flex flex-col gap-y-6 xsmall:flex-row items-start justify-between py-20">
          <div>
            <LocalizedClientLink href="/" className="text-xl-semi uppercase">
              Medusa Store
            </LocalizedClientLink>
          </div>
          <div className="text-sm gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-3">
            {product_categories && product_categories?.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="font-semibold">Categories</span>
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
                <span className="font-semibold">Collections</span>
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
            <div className="flex flex-col gap-y-2">
              <span className="font-semibold">Medusa</span>
              <ul className="grid grid-cols-1 gap-y-2 text-[var(--text-muted)]">
                <li>
                  <a
                    href="https://github.com/medusajs"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[var(--text-base)]"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs.medusajs.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[var(--text-base)]"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/medusajs/nextjs-starter-medusa"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[var(--text-base)]"
                  >
                    Source Code
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex w-full mb-16 justify-between text-[var(--text-muted)]">
          <Text className="text-sm">
            © {new Date().getFullYear()} Medusa Store. All rights reserved.
          </Text>
          <MedusaCTA />
        </div>
      </div>
    </footer>
  )
}
