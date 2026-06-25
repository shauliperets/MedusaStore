"use client"

import { Button } from "@modules/common/components/ui"
import { useTranslations } from "next-intl"

import OrderCard from "../order-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

const OrderOverview = ({ orders }: { orders: HttpTypes.StoreOrder[] }) => {
  const t = useTranslations("account")

  if (orders?.length) {
    return (
      <div className="flex flex-col gap-y-8 w-full">
        {orders.map((o) => (
          <div
            key={o.id}
            className="border-b border-ui-border-base pb-6 last:border-none last:pb-0"
          >
            <OrderCard order={o} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      className="surface-card w-full flex flex-col items-center gap-y-4 border border-white/40 p-6"
      data-testid="no-orders-container"
    >
      <h2 className="text-large-semi">{t("nothingToSee")}</h2>
      <p className="text-base-regular text-ui-fg-subtle">{t("noOrdersYet")}</p>
      <div className="mt-4">
        <LocalizedClientLink href="/" passHref>
          <Button data-testid="continue-shopping-button">
            {t("continueShopping")}
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default OrderOverview
