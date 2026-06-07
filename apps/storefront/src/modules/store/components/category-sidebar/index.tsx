import { getTranslations } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { listCategories } from "@lib/data/categories"
import { Card } from "@modules/common/components/ui"

const CategorySidebar = async () => {
  const [categories, t] = await Promise.all([
    listCategories(),
    getTranslations("store"),
  ])

  const rootCategories = categories.filter((c) => !c.parent_category_id)

  return (
    <Card>
      <Card.Header>
        <Card.Title>{t("categories")}</Card.Title>
      </Card.Header>
      <Card.Content>
        <ul className="flex flex-col gap-2">
          <li>
            <LocalizedClientLink
              href="/store"
              className="w-full px-3 py-2 rounded-md text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[var(--text-base)]"
            >
              {t("allProducts")}
            </LocalizedClientLink>
          </li>
          {rootCategories.map((cat) => (
            <li key={cat.id}>
              <LocalizedClientLink
                href={`/categories/${cat.handle}`}
                className="w-full px-3 py-2 rounded-md text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[var(--text-base)]"
              >
                {cat.name}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </Card.Content>
    </Card>
  )
}

export default CategorySidebar
