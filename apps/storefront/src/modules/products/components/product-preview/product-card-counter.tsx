"use client"

import {
  useCartStore,
  getAvailableInventory,
} from "@lib/context/cart-store-context"
import { HttpTypes } from "@medusajs/types"
import { useEffect, useState } from "react"

type ProductCardCounterProps = {
  variant: HttpTypes.StoreProductVariant | null
}

export default function ProductCardCounter({
  variant,
}: ProductCardCounterProps) {
  const { state, dispatch } = useCartStore()
  const [isHover, setIsHover] = useState(false)
  const [isPlusError, setIsPlusError] = useState(false)
  const [isMinusError, setIsMinusError] = useState(false)

  const variantId = variant?.id ?? null
  const quantity = variantId ? state.items[variantId]?.quantity ?? 0 : 0
  const maxQuantity = variantId ? getAvailableInventory(variant) : Infinity

  const isPlusDisabled = !variantId || quantity >= maxQuantity

  // Watch for sync errors on this variant
  const error = variantId ? state.errors[variantId] : null

  // Clear error states after 1.5s
  useEffect(() => {
    if (!isPlusError) return
    const timer = setTimeout(() => setIsPlusError(false), 1500)
    return () => clearTimeout(timer)
  }, [isPlusError])

  useEffect(() => {
    if (!isMinusError) return
    const timer = setTimeout(() => setIsMinusError(false), 1500)
    return () => clearTimeout(timer)
  }, [isMinusError])

  // Show errors when sync fails
  useEffect(() => {
    if (error) {
      // Determine if it was a plus or minus that failed
      const lastSynced = variantId
        ? state.items[variantId]?.lastSyncedQuantity ?? 0
        : 0
      if (quantity > lastSynced) {
        setIsPlusError(true)
      } else {
        setIsMinusError(true)
      }
      // Clear the error from state after showing
      if (variantId) {
        dispatch({ type: "CLEAR_ERROR", variantId })
      }
    }
  }, [error, variantId, quantity, dispatch, state.items])

  const handlePlus = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!variantId || isPlusDisabled) return
    dispatch({ type: "INCREMENT", variantId, max: maxQuantity })
  }

  const handleMinus = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!variantId || quantity <= 0) return
    dispatch({ type: "DECREMENT", variantId })
  }

  const showButtons = isHover || quantity > 0
  const showMinus = showButtons && quantity > 0
  const showCount = showButtons && quantity > 0

  return (
    <div
      className="absolute inset-0 flex items-end justify-center pb-3 z-10"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div className="flex items-center gap-x-3">
        {/* Plus button */}
        <button
          onClick={handlePlus}
          disabled={isPlusDisabled}
          aria-label="Add to cart"
          title={
            isPlusDisabled && quantity >= maxQuantity
              ? "Maximum quantity reached"
              : "Add to cart"
          }
          className={[
            "w-10 h-10 rounded-full border-none cursor-pointer relative flex items-center justify-center",
            "shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-all duration-300",
            isPlusError
              ? "bg-red-500/80 hover:bg-red-500"
              : isPlusDisabled && quantity >= maxQuantity
              ? "bg-gray-500/60 cursor-not-allowed"
              : "bg-black/60 hover:bg-black/80",
            "hover:scale-110 disabled:cursor-not-allowed",
            showButtons
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-75 pointer-events-none",
          ].join(" ")}
        >
          {/* Plus symbol */}
          <span className="absolute block w-[18px] h-[2px] bg-white rounded-full" />
          <span className="absolute block w-[2px] h-[18px] bg-white rounded-full" />
        </button>

        {/* Counter */}
        {showCount && (
          <span className="text-white font-semibold text-base min-w-[1.5ch] text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {quantity}
          </span>
        )}

        {/* Minus button */}
        <button
          onClick={handleMinus}
          disabled={!variantId || quantity <= 0}
          aria-label="Remove from cart"
          className={[
            "w-10 h-10 rounded-full border-none cursor-pointer flex items-center justify-center",
            "shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-all duration-300",
            isMinusError
              ? "bg-red-500/80 hover:bg-red-500"
              : "bg-black/60 hover:bg-black/80",
            "hover:scale-110 disabled:cursor-not-allowed",
            showMinus
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-75 pointer-events-none",
          ].join(" ")}
        >
          {/* Minus symbol */}
          <span className="block w-[18px] h-[2px] bg-white rounded-full" />
        </button>
      </div>
    </div>
  )
}
