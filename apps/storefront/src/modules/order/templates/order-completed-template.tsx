import { Heading } from "@modules/common/components/ui"
import { cookies as nextCookies } from "next/headers"

import CartTotals from "@modules/common/components/cart-totals"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import PaymentDetails from "@modules/order/components/payment-details"
import { HttpTypes } from "@medusajs/types"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  return (
    <div className="min-h-[calc(100vh-var(--nav-height))] py-4">
      <div className="content-shell mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-center gap-y-5">
        {isOnboarding && <OnboardingCta orderId={order.id} />}
        <div
          className="surface-card w-full max-w-4xl border border-white/40 p-4 small:p-5"
          data-testid="order-complete-container"
        >
          <Heading
            level="h1"
            className="mb-5 flex flex-col gap-y-2 text-2xl font-semibold tracking-tight text-ui-fg-base small:text-3xl"
          >
            <span>Thank you!</span>
            <span>Your order was placed successfully.</span>
          </Heading>
          <OrderDetails order={order} />
          <Heading level="h2" className="mt-4 flex flex-row text-xl-semi">
            Summary
          </Heading>
          <Items order={order} />
          <CartTotals totals={order} />
          <ShippingDetails order={order} />
          <PaymentDetails order={order} />
          <Help />
        </div>
      </div>
    </div>
  )
}
