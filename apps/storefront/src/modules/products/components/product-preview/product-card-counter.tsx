"use client"

import {
  addToCart,
  deleteLineItem,
  retrieveCart,
  updateLineItem,
} from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState, useTransition } from "react"

type ProductCardCounterProps = {
  variant: HttpTypes.StoreProductVariant | null
}

export default function ProductCardCounter({
  variant,
}: ProductCardCounterProps) {
  const [counter, setCounter] = useState(0)
  const [isHover, setIsHover] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isPlusError, setIsPlusError] = useState(false)
  const [isMinusError, setIsMinusError] = useState(false)
  const [lineItemId, setLineItemId] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  const countryCode = useParams().countryCode as string
  const variantId = variant?.id ?? null
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const routeKey = `${pathname}?${searchParams.toString()}`

  const counterRef = useRef(counter)
  counterRef.current = counter

  const lineItemIdRef = useRef(lineItemId)
  lineItemIdRef.current = lineItemId

  // Sync counter on mount and when variant changes
  const syncInProgressRef = useRef(false)
  useEffect(() => {
    if (!variantId) {
      setCounter(0)
      setLineItemId(null)
      setInitialized(true)
      return
    }

    if (syncInProgressRef.current) return
    syncInProgressRef.current = true

    const syncCart = async () => {
      try {
        const cart = await retrieveCart()
        if (!cart?.items) {
          setCounter(0)
          setLineItemId(null)
          return
        }

        const matchingItem = cart.items.find(
          (item) => item.variant_id === variantId
        )

        if (matchingItem) {
          setCounter(matchingItem.quantity)
          setLineItemId(matchingItem.id)
        } else {
          setCounter(0)
          setLineItemId(null)
        }
      } catch (err) {
        console.error("Failed to sync cart counter:", err)
      } finally {
        setInitialized(true)
        syncInProgressRef.current = false
      }
    }

    syncCart()
  }, [variantId])

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

  // Re-sync function exposed for hover/visibility triggers
  const syncCart = useCallback(async () => {
    if (!variantId) return
    try {
      const cart = await retrieveCart()
      if (!cart?.items) {
        setCounter(0)
        setLineItemId(null)
        return
      }

      const matchingItem = cart.items.find(
        (item) => item.variant_id === variantId
      )

      if (matchingItem) {
        setCounter(matchingItem.quantity)
        setLineItemId(matchingItem.id)
      } else {
        setCounter(0)
        setLineItemId(null)
      }
    } catch (err) {
      console.error("Failed to sync cart counter:", err)
    }
  }, [variantId])

  const syncingRef = useRef(false)
  // Lock: set to true while a +/− transition is in flight to prevent
  // stale retrieveCart from resetting the optimistic counter.
  const transitionLockRef = useRef(false)

  const handleSyncOnHover = useCallback(async () => {
    if (syncingRef.current) return
    if (transitionLockRef.current) return
    syncingRef.current = true
    await syncCart()
    syncingRef.current = false
  }, [syncCart])

  // Re-sync when the page becomes visible again (after tab switch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && variantId) {
        handleSyncOnHover()
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [handleSyncOnHover, variantId])

  // Re-sync when the route changes (e.g. navigating back from cart page)
  useEffect(() => {
    if (variantId && initialized) {
      handleSyncOnHover()
    }
  }, [routeKey])

  // Determine max quantity based on inventory
  const maxQuantity = useCallback(() => {
    if (!variant) return Infinity
    // If inventory is not managed, unlimited
    if (!variant.manage_inventory) return Infinity
    // If backorders are allowed, unlimited
    if (variant.allow_backorder) return Infinity
    // If no inventory item is linked yet (null quantity), allow purchases
    // — the admin hasn't set up stock levels but manage_inventory is on.
    if (variant.inventory_quantity == null) return Infinity
    // Otherwise, limited to inventory_quantity
    return variant.inventory_quantity
  }, [variant])

  const isPlusDisabled =
    isPending || !variantId || (initialized && counter >= maxQuantity())

  const handlePlus = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!variantId) return
    if (isPlusDisabled) return

    const previousCount = counter
    setCounter((c) => c + 1)
    transitionLockRef.current = true

    startTransition(async () => {
      try {
        await addToCart({ variantId, quantity: 1, countryCode })
        // After successful add, re-sync to get the actual line item ID
        const cart = await retrieveCart()
        if (cart?.items) {
          const matchingItem = cart.items.find(
            (item) => item.variant_id === variantId
          )
          if (matchingItem) {
            setLineItemId(matchingItem.id)
            setCounter(matchingItem.quantity)
          } else {
            // Item wasn't found in cart after successful add — sync fresh
            setCounter(0)
            setLineItemId(null)
          }
        }
      } catch (err) {
        console.error("Failed to add to cart:", err)
        // Don't revert the optimistic counter blindly; re-sync from the
        // server on error too in case the cart state changed server-side.
        try {
          const cart = await retrieveCart()
          if (cart?.items) {
            const matchingItem = cart.items.find(
              (item) => item.variant_id === variantId
            )
            if (matchingItem) {
              setCounter(matchingItem.quantity)
              setLineItemId(matchingItem.id)
            } else {
              setCounter(previousCount)
            }
          } else {
            setCounter(previousCount)
          }
        } catch {
          setCounter(previousCount)
        }
        setIsPlusError(true)
      } finally {
        transitionLockRef.current = false
      }
    })
  }

  const handleMinus = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const currentCounter = counterRef.current
    const currentLineItemId = lineItemIdRef.current

    if (currentCounter <= 0 || !variantId) return

    const newCount = currentCounter - 1

    // Optimistic update
    setCounter(newCount)

    if (newCount === 0) {
      setLineItemId(null)
    }

    transitionLockRef.current = true

    startTransition(async () => {
      try {
        if (newCount === 0) {
          // Remove from cart entirely
          if (currentLineItemId) {
            await deleteLineItem(currentLineItemId)
          }
        } else {
          // Update quantity
          await updateLineItem({
            lineId: currentLineItemId!,
            quantity: newCount,
          })
        }
      } catch (err) {
        console.error("Failed to update cart:", err)
        setCounter(currentCounter) // Revert to previous count (before optimistic update)
        setLineItemId(currentLineItemId)
        setIsMinusError(true)
      } finally {
        transitionLockRef.current = false
      }
    })
  }

  const showButtons = isHover || counter > 0
  const showMinus = showButtons && counter > 0
  // Only show the counter number if > 0 AND buttons are visible, or if initialized and > 0
  const showCount = showButtons && counter > 0

  return (
    <div
      className="absolute inset-0 flex items-end justify-center pb-3 z-10"
      onMouseEnter={() => {
        setIsHover(true)
        handleSyncOnHover()
      }}
      onMouseLeave={() => setIsHover(false)}
    >
      <div className="flex items-center gap-x-3">
        {/* Plus button */}
        <button
          onClick={handlePlus}
          disabled={isPlusDisabled}
          aria-label="Add to cart"
          title={
            isPlusDisabled && counter >= maxQuantity()
              ? "Maximum quantity reached"
              : "Add to cart"
          }
          className={[
            "w-10 h-10 rounded-full border-none cursor-pointer relative flex items-center justify-center",
            "shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-all duration-300",
            isPlusError
              ? "bg-red-500/80 hover:bg-red-500"
              : isPlusDisabled && counter >= maxQuantity()
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
            {counter}
          </span>
        )}

        {/* Minus button */}
        <button
          onClick={handleMinus}
          disabled={isPending}
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
