import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info">
      <div className="mx-auto flex flex-col gap-y-4 lg:max-w-[500px]">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="inline-flex w-fit rounded-full border border-ui-border-base bg-ui-bg-subtle/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-ui-fg-subtle hover:text-ui-fg-base"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <Heading
          level="h2"
          className="text-2xl font-semibold leading-tight tracking-tight text-ui-fg-base small:text-3xl"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        <Text
          className="whitespace-pre-line text-base-regular text-ui-fg-subtle"
          data-testid="product-description"
        >
          {product.description}
        </Text>
      </div>
    </div>
  )
}

export default ProductInfo
