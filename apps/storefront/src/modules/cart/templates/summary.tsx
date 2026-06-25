"use client"

import { Button, Card } from "@modules/common/components/ui"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { useTranslations } from "next-intl"

type SummaryProps = {
  cart: HttpTypes.StoreCart
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const t = useTranslations("cart")
  const step = getCheckoutStep(cart)

  return (
    <Card>
      <Card.Header>
        <Card.Title>{t("orderSummary")}</Card.Title>
      </Card.Header>
      <Card.Content className="space-y-4">
        <DiscountCode cart={cart} />
        <Divider />
        <CartTotals totals={cart} />
        <LocalizedClientLink
          href={"/checkout?step=" + step}
          data-testid="checkout-button"
        >
          <Button className="w-full" size="lg">
            {t("goToCheckout")}
          </Button>
        </LocalizedClientLink>
      </Card.Content>
    </Card>
  )
}

export default Summary
