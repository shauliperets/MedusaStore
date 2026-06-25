import { getTranslations } from "next-intl/server"
import { listCategories } from "@lib/data/categories"
import { Card } from "@modules/common/components/ui"
import CategoryNavItem from "./category-nav-item"

const CategorySidebar = async () => {
  const [categories, t] = await Promise.all([
    listCategories(),
    getTranslations("store"),
  ])

  const rootCategories = categories.filter((c) => !c.parent_category_id)

  return (
    <Card>
      <Card.Header className="border-b border-[var(--surface-border)]/70 bg-gradient-to-r from-white via-slate-50 to-indigo-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/40">
        <Card.Title className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full bg-[var(--brand-primary)] opacity-80"
            aria-hidden="true"
          />
          {t("categories")}
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <ul className="flex flex-col gap-1">
          <li>
            <CategoryNavItem href="/store" label={t("allProducts")} exact />
          </li>
          {rootCategories.map((cat) => (
            <li key={cat.id}>
              <CategoryNavItem
                href={`/categories/${cat.handle}`}
                label={cat.name}
              />
            </li>
          ))}
        </ul>
      </Card.Content>
    </Card>
  )
}

export default CategorySidebar
