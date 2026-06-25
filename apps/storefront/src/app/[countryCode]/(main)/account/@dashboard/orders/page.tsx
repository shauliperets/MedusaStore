import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import OrderOverview from "@modules/account/components/order-overview"
import { notFound } from "next/navigation"
import { listOrders } from "@lib/data/orders"
import Divider from "@modules/common/components/divider"
import TransferRequestForm from "@modules/account/components/transfer-request-form"

export const metadata: Metadata = {
  title: "Orders",
  description: "Overview of your previous orders.",
}

export default async function Orders() {
  const orders = await listOrders(10, 0)
  const t = await getTranslations("account")

  if (!orders) {
    notFound()
  }

  return (
    <div className="w-full surface-card border border-white/40 p-5 small:p-6" data-testid="orders-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">{t("orders")}</h1>
        <p className="text-base-regular">{t("ordersDescription")}</p>
      </div>
      <div>
        <OrderOverview orders={orders} />
        <Divider className="mb-8 mt-8" />
        <TransferRequestForm />
      </div>
    </div>
  )
}
