import { InfoTooltip, Text } from "@modules/common/components/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getTranslations } from "next-intl/server"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import ProductCardCounter from "./product-card-counter"

export default async function ProductPreview({
  product,
  isFeatured,
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const tt = await getTranslations("tooltips")

  const { cheapestPrice } = getProductPrice({
    product,
  })

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group">
      <div
        data-testid="product-wrapper"
        className="rounded-xl overflow-hidden bg-white border border-ui-border-base transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
      >
        <div className="overflow-hidden relative">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
            className="transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <ProductCardCounter
            variant={
              product.variants?.length === 1
                ? product.variants[0] ?? null
                : null
            }
          />
        </div>
        <div className="flex txt-compact-medium mt-0 px-3 py-3 justify-between items-center">
          <Text
            className="text-ui-fg-base font-medium truncate"
            data-testid="product-title"
          >
            {product.title}
          </Text>
          <div className="flex items-center gap-x-2 shrink-0 ms-2">
            {cheapestPrice && (
              <span
                title={tt("product.price")}
                className="inline-flex items-center"
              >
                <PreviewPrice price={cheapestPrice} />
              </span>
            )}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
