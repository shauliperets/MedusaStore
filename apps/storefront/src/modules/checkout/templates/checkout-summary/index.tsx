import { Heading } from "@modules/common/components/ui"

import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"
import { getTranslations } from "next-intl/server"

const CheckoutSummary = async ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const t = await getTranslations("checkout")

  return (
    <aside className="sticky top-20 flex flex-col-reverse gap-5 small:flex-col">
      <div className="surface-card glass-panel border-white/40 p-5 small:p-6">
        <Divider className="my-4 small:hidden" />
        <Heading
          level="h2"
          className="flex flex-row items-baseline text-xl-semi"
        >
          {t("inYourCart")}
        </Heading>
        <Divider className="my-4" />
        <CartTotals totals={cart} />
        <ItemsPreviewTemplate cart={cart} />
        <div className="mt-4">
          <DiscountCode cart={cart} />
        </div>
      </div>
    </aside>
  )
}

export default CheckoutSummary
