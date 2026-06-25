import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

const CATEGORY_FIELDS = [
  "id",
  "name",
  "handle",
  "description",
  "rank",
  "is_active",
  "is_internal",
  "parent_category_id",
  "*parent_category",
  "*parent_category.parent_category",
  "*category_children",
  "*products",
]

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const {
    sales_channel_id,
    handle,
    parent_category_id,
    limit = "100",
    offset = "0",
  } = req.query as Record<string, string>

  const filters: Record<string, unknown> = {}
  if (handle) filters.handle = handle
  if (parent_category_id) filters.parent_category_id = parent_category_id

  if (sales_channel_id) {
    // Resolve which categories have at least one product in this sales channel
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "categories.id"],
      filters: { sales_channels: { id: sales_channel_id } } as any,
    })

    const categoryIds = [
      ...new Set(
        (products as any[]).flatMap((p) =>
          ((p.categories as { id: string }[] | null) ?? []).map((c) => c.id)
        )
      ),
    ]

    if (categoryIds.length === 0) {
      return res.json({
        product_categories: [],
        count: 0,
        offset: Number(offset),
        limit: Number(limit),
      })
    }

    ;(filters as any).id = categoryIds
  }

  const { data: product_categories, metadata } = await query.graph({
    entity: "product_category",
    fields: CATEGORY_FIELDS,
    filters,
    pagination: { take: Number(limit), skip: Number(offset) },
  })

  return res.json({
    product_categories,
    count: metadata?.count ?? product_categories.length,
    offset: Number(offset),
    limit: Number(limit),
  })
}
