"use client"

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import {
  useCartStore,
  getAvailableInventory,
} from "@lib/context/cart-store-context"
import { useTranslations } from "next-intl"
import { Fragment, useCallback, useState } from "react"

const CartDropdown = ({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  const t = useTranslations("cart")
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)

  const toggle = () => setCartDropdownOpen((prev) => !prev)
  const close = () => setCartDropdownOpen(false)

  const { state, dispatch } = useCartStore()

  // Use the context cart for live quantities; fall back to server prop for
  // items that haven't been initialised in the store yet.
  const displayCart = state.cart ?? cartState

  // Derive live quantities from the store for each item
  const items = displayCart?.items?.map((item) => {
    const variantId = item.variant_id
    if (variantId && state.items[variantId]) {
      return {
        ...item,
        quantity: state.items[variantId].quantity,
      }
    }
    return item
  })

  const totalItems =
    items?.reduce((acc, item) => {
      return acc + item.quantity
    }, 0) || 0

  const subtotal = displayCart?.subtotal ?? 0

  const handleQuantityChange = useCallback(
    (variantId: string, newQuantity: number) => {
      if (!variantId) return
      // Find the variant to compute max inventory
      const cartItem = displayCart?.items?.find(
        (item) => item.variant_id === variantId
      )
      const max = getAvailableInventory(cartItem?.variant ?? null)
      dispatch({
        type: "SET_QUANTITY",
        variantId,
        quantity: newQuantity,
        max,
      })
    },
    [displayCart?.items, dispatch]
  )

  return (
    <div className="h-full z-50">
      <Popover className="relative h-full">
        <PopoverButton className="h-full" onClick={toggle}>
          <span className="hover:text-ui-fg-base cursor-pointer">
            {t("title")} ({totalItems})
          </span>
        </PopoverButton>
        <Transition
          show={cartDropdownOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <PopoverPanel
            static
            className="surface-card hidden small:block absolute right-0 top-[calc(100%+8px)] w-[420px] border border-white/40 text-ui-fg-base"
            data-testid="nav-cart-dropdown"
          >
            <div className="p-4 flex items-center justify-center">
              <h3 className="text-large-semi">{t("title")}</h3>
            </div>
            {displayCart && items && items.length ? (
              <>
                <div className="overflow-y-scroll max-h-[402px] px-4 grid grid-cols-1 gap-y-8 no-scrollbar p-px">
                  {items
                    .sort((a, b) => {
                      return (a.created_at ?? "") > (b.created_at ?? "")
                        ? -1
                        : 1
                    })
                    .map((item) => (
                      <div
                        className="grid grid-cols-[122px_1fr] gap-x-4"
                        key={item.id}
                        data-testid="cart-item"
                      >
                        <LocalizedClientLink
                          href={`/products/${item.product_handle}`}
                          className="w-24"
                          onClick={close}
                        >
                          <Thumbnail
                            thumbnail={item.thumbnail}
                            images={item.variant?.product?.images}
                            size="square"
                          />
                        </LocalizedClientLink>
                        <div className="flex flex-col justify-between flex-1">
                          <div className="flex flex-col flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex flex-col overflow-ellipsis whitespace-nowrap mr-4 w-[180px]">
                                <h3 className="text-base-regular overflow-hidden text-ellipsis">
                                  <LocalizedClientLink
                                    href={`/products/${item.product_handle}`}
                                    data-testid="product-link"
                                    onClick={close}
                                  >
                                    {item.title}
                                  </LocalizedClientLink>
                                </h3>
                                <LineItemOptions
                                  variant={item.variant}
                                  data-testid="cart-item-variant"
                                  data-value={item.variant}
                                />
                              </div>
                              <div className="flex justify-end">
                                <LineItemPrice
                                  item={item}
                                  style="tight"
                                  currencyCode={displayCart.currency_code}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-x-2">
                              {/* Plus button */}
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.variant_id!,
                                    item.quantity + 1
                                  )
                                }
                                aria-label="Increase quantity"
                                className={[
                                  "w-7 h-7 rounded-full border border-grey-20 cursor-pointer relative flex items-center justify-center",
                                  "transition-all duration-200",
                                  "hover:bg-grey-10 hover:border-grey-40",
                                ].join(" ")}
                              >
                                <span className="absolute block w-2.5 h-[2px] bg-grey-60 rounded-full" />
                                <span className="absolute block w-[2px] h-2.5 bg-grey-60 rounded-full" />
                              </button>

                              {/* Quantity */}
                              <span className="text-sm font-medium min-w-[1.5ch] text-center tabular-nums">
                                {item.quantity}
                              </span>

                              {/* Minus button */}
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.variant_id!,
                                    item.quantity - 1
                                  )
                                }
                                aria-label="Decrease quantity"
                                className={[
                                  "w-7 h-7 rounded-full border border-grey-20 cursor-pointer flex items-center justify-center",
                                  "transition-all duration-200",
                                  "hover:bg-grey-10 hover:border-grey-40",
                                ].join(" ")}
                              >
                                <span className="block w-2.5 h-[2px] bg-grey-60 rounded-full" />
                              </button>
                            </div>
                            <DeleteButton
                              id={item.id}
                              data-testid="cart-item-remove-button"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="p-4 flex flex-col gap-y-4 text-small-regular">
                  <div className="flex items-center justify-between">
                    <span className="text-ui-fg-base font-semibold">
                      {t("subtotal")}{" "}
                      <span className="font-normal">{t("exclTaxes")}</span>
                    </span>
                    <span
                      className="text-large-semi"
                      data-testid="cart-subtotal"
                      data-value={subtotal}
                    >
                      {convertToLocale({
                        amount: subtotal,
                        currency_code: displayCart.currency_code,
                      })}
                    </span>
                  </div>
                  <LocalizedClientLink href="/cart" passHref onClick={close}>
                    <Button
                      className="w-full"
                      size={"large" as any}
                      data-testid="go-to-cart-button"
                    >
                      {t("goToCart")}
                    </Button>
                  </LocalizedClientLink>
                </div>
              </>
            ) : (
              <div>
                <div className="flex py-16 flex-col gap-y-4 items-center justify-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-primary)] text-small-regular text-white">
                    <span>0</span>
                  </div>
                  <span className="text-ui-fg-subtle">{t("empty")}</span>
                  <div>
                    <LocalizedClientLink href="/store">
                      <>
                        <span className="sr-only">{t("explore")}</span>
                        <Button onClick={close}>{t("explore")}</Button>
                      </>
                    </LocalizedClientLink>
                  </div>
                </div>
              </div>
            )}
          </PopoverPanel>
        </Transition>
      </Popover>
    </div>
  )
}

export default CartDropdown
