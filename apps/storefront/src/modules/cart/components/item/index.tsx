"use client"

import { Table, Text, clx } from "@modules/common/components/ui"
import { deleteLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import {
  useCartStore,
  getAvailableInventory,
} from "@lib/context/cart-store-context"
import { useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [error, setError] = useState<string | null>(null)
  const { state, dispatch } = useCartStore()

  const variantId = item.variant_id
  const maxQuantity = getAvailableInventory(item.variant ?? null)

  // Read live quantity from the cart store — falls back to the server-prop
  // quantity for items not yet initialised in the store.
  const liveQuantity = variantId
    ? state.items[variantId]?.quantity ?? item.quantity
    : item.quantity

  const handleQuantityChange = (quantity: number) => {
    if (!variantId) return
    setError(null)
    dispatch({ type: "SET_QUANTITY", variantId, quantity, max: maxQuantity })
  }

  const handleDelete = async () => {
    if (!variantId) return
    setError(null)

    try {
      await deleteLineItem(item.id)
      // Notify the cart store context to re-fetch (no cart-store source tag)
      window.dispatchEvent(new CustomEvent("cart-updated"))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handlePlus = () => {
    if (!variantId) return
    handleQuantityChange(liveQuantity + 1)
  }

  const handleMinus = () => {
    if (!variantId) return
    if (liveQuantity <= 1) {
      handleDelete()
    } else {
      handleQuantityChange(liveQuantity - 1)
    }
  }

  return (
    <Table.Row className="w-full" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className={clx("flex", {
            "w-16": type === "preview",
            "small:w-24 w-12": type === "full",
          })}
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="text-left">
        <Text
          className="txt-medium-plus text-ui-fg-base"
          data-testid="product-title"
        >
          {item.product_title}
        </Text>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
      </Table.Cell>

      {type === "full" && (
        <Table.Cell>
          <div className="flex gap-2 items-center">
            <DeleteButton id={item.id} data-testid="product-delete-button" />
            <div className="flex items-center gap-x-2">
              {/* Plus button */}
              <button
                onClick={handlePlus}
                disabled={liveQuantity >= maxQuantity}
                aria-label="Increase quantity"
                title={
                  liveQuantity >= maxQuantity
                    ? "Maximum quantity reached"
                    : "Increase quantity"
                }
                className={[
                  "w-8 h-8 rounded-full border border-grey-20 cursor-pointer relative flex items-center justify-center",
                  "transition-all duration-200",
                  "hover:bg-grey-10 hover:border-grey-40",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                ].join(" ")}
              >
                <span className="absolute block w-3 h-[2px] bg-grey-60 rounded-full" />
                <span className="absolute block w-[2px] h-3 bg-grey-60 rounded-full" />
              </button>

              {/* Live quantity from cart store */}
              <span className="text-sm font-medium min-w-[1.5ch] text-center tabular-nums">
                {liveQuantity}
              </span>

              {/* Minus button */}
              <button
                onClick={handleMinus}
                aria-label="Decrease quantity"
                className={[
                  "w-8 h-8 rounded-full border border-grey-20 cursor-pointer flex items-center justify-center",
                  "transition-all duration-200",
                  "hover:bg-grey-10 hover:border-grey-40",
                ].join(" ")}
              >
                <span className="block w-3 h-[2px] bg-grey-60 rounded-full" />
              </button>
            </div>
          </div>
          <ErrorMessage error={error} data-testid="product-error-message" />
        </Table.Cell>
      )}

      {type === "full" && (
        <Table.Cell className="hidden small:table-cell">
          <LineItemUnitPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </Table.Cell>
      )}

      <Table.Cell className="!pr-0">
        <span
          className={clx("!pr-0", {
            "flex flex-col items-end h-full justify-center": type === "preview",
          })}
        >
          {type === "preview" && (
            <span className="flex gap-x-1 ">
              <Text className="text-ui-fg-muted">{liveQuantity}x </Text>
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </span>
          )}
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
