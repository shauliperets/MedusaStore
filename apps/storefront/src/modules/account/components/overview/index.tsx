import { Container } from "@modules/common/components/ui"
import { getTranslations } from "next-intl/server"

import ChevronDown from "@modules/common/icons/chevron-down"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
}

const Overview = async ({ customer, orders }: OverviewProps) => {
  const t = await getTranslations("account")

  return (
    <div className="hidden small:block" data-testid="overview-page-wrapper">
      <div className="surface-card border border-white/40 p-5 small:p-6">
        <div className="mb-5 flex items-center justify-between">
          <span data-testid="welcome-message" data-value={customer?.first_name}>
            {t("welcome", { name: customer?.first_name || "" })}
          </span>
          <span className="text-small-regular text-ui-fg-subtle">
            {t("signedInAs")}{" "}
            <span
              className="font-semibold"
              data-testid="customer-email"
              data-value={customer?.email}
            >
              {customer?.email}
            </span>
          </span>
        </div>
        <div className="flex flex-col border-t border-ui-border-base pt-6">
          <div className="flex flex-col gap-y-4 h-full col-span-1 row-span-2 flex-1">
            <div className="flex items-start gap-x-16 mb-6">
              <div className="flex flex-col gap-y-4 rounded-xl border border-ui-border-base bg-ui-bg-subtle/50 p-4">
                <h3 className="text-large-semi">{t("profile")}</h3>
                <div className="flex items-end gap-x-2">
                  <span
                    className="text-3xl-semi leading-none"
                    data-testid="customer-profile-completion"
                    data-value={getProfileCompletion(customer)}
                  >
                    {getProfileCompletion(customer)}%
                  </span>
                  <span className="uppercase text-base-regular text-ui-fg-subtle">
                    {t("completed")}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-y-4 rounded-xl border border-ui-border-base bg-ui-bg-subtle/50 p-4">
                <h3 className="text-large-semi">{t("addresses")}</h3>
                <div className="flex items-end gap-x-2">
                  <span
                    className="text-3xl-semi leading-none"
                    data-testid="addresses-count"
                    data-value={customer?.addresses?.length || 0}
                  >
                    {customer?.addresses?.length || 0}
                  </span>
                  <span className="uppercase text-base-regular text-ui-fg-subtle">
                    {t("saved")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-y-4">
              <div className="flex items-center gap-x-2">
                <h3 className="text-large-semi">{t("recentOrders")}</h3>
              </div>
              <ul
                className="flex flex-col gap-y-3"
                data-testid="orders-wrapper"
              >
                {orders && orders.length > 0 ? (
                  orders.slice(0, 5).map((order) => {
                    return (
                      <li
                        key={order.id}
                        data-testid="order-wrapper"
                        data-value={order.id}
                      >
                        <LocalizedClientLink
                          href={`/account/orders/details/${order.id}`}
                        >
                          <Container className="surface-card-hover flex items-center justify-between border border-ui-border-base bg-ui-bg-subtle/60 p-4">
                            <div className="grid grid-cols-3 grid-rows-2 text-small-regular gap-x-4 flex-1">
                              <span className="font-semibold">
                                {t("datePlaced")}
                              </span>
                              <span className="font-semibold">
                                {t("orderNumber")}
                              </span>
                              <span className="font-semibold">
                                {t("totalAmount")}
                              </span>
                              <span data-testid="order-created-date">
                                {new Date(order.created_at).toDateString()}
                              </span>
                              <span
                                data-testid="order-id"
                                data-value={order.display_id}
                              >
                                #{order.display_id}
                              </span>
                              <span data-testid="order-amount">
                                {convertToLocale({
                                  amount: order.total,
                                  currency_code: order.currency_code,
                                })}
                              </span>
                            </div>
                            <button
                              className="flex items-center justify-between"
                              data-testid="open-order-button"
                            >
                              <span className="sr-only">
                                Go to order #{order.display_id}
                              </span>
                              <ChevronDown className="-rotate-90" />
                            </button>
                          </Container>
                        </LocalizedClientLink>
                      </li>
                    )
                  })
                ) : (
                  <span
                    className="text-ui-fg-subtle"
                    data-testid="no-orders-message"
                  >
                    {t("noRecentOrders")}
                  </span>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const getProfileCompletion = (customer: HttpTypes.StoreCustomer | null) => {
  let count = 0

  if (!customer) {
    return 0
  }

  if (customer.email) {
    count++
  }

  if (customer.first_name && customer.last_name) {
    count++
  }

  if (customer.phone) {
    count++
  }

  const billingAddress = customer.addresses?.find(
    (addr) => addr.is_default_billing
  )

  if (billingAddress) {
    count++
  }

  return (count / 4) * 100
}

export default Overview
