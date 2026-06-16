"use client"

import {
  addToCart,
  deleteLineItem,
  retrieveCart,
  updateLineItem,
} from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { useParams } from "next/navigation"
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CartItemEntry = {
  variantId: string
  lineItemId: string | null // null until confirmed by server
  quantity: number
  lastSyncedQuantity: number
}

type CartStoreState = {
  items: Record<string, CartItemEntry> // keyed by variantId
  cart: HttpTypes.StoreCart | null
  errors: Record<string, string> // variantId -> error message
}

type CartStoreAction =
  | { type: "INIT_CART"; cart: HttpTypes.StoreCart }
  | { type: "INCREMENT"; variantId: string; max: number }
  | { type: "DECREMENT"; variantId: string }
  | { type: "SET_QUANTITY"; variantId: string; quantity: number; max: number }
  | {
      type: "CONFIRM_SYNC"
      variantId: string
      lineItemId: string | null
      serverQuantity: number
    }
  | { type: "CLEAR_ERROR"; variantId: string }
  | { type: "SET_ERROR"; variantId: string; error: string }
  | { type: "UPDATE_CART"; cart: HttpTypes.StoreCart }

// ---------------------------------------------------------------------------
// Inventory helper
// ---------------------------------------------------------------------------

export function getAvailableInventory(
  variant: HttpTypes.StoreProductVariant | null
): number {
  if (!variant) return Infinity
  if (!variant.manage_inventory) return Infinity
  if (variant.allow_backorder) return Infinity
  return variant.inventory_quantity ?? Infinity
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function cartStoreReducer(
  state: CartStoreState,
  action: CartStoreAction
): CartStoreState {
  switch (action.type) {
    case "INIT_CART": {
      const items: Record<string, CartItemEntry> = {}
      for (const item of action.cart.items ?? []) {
        if (item.variant_id) {
          items[item.variant_id] = {
            variantId: item.variant_id,
            lineItemId: item.id,
            quantity: item.quantity,
            lastSyncedQuantity: item.quantity,
          }
        }
      }
      return { ...state, items, cart: action.cart }
    }

    case "INCREMENT": {
      const entry = state.items[action.variantId]
      const currentQty = entry?.quantity ?? 0
      if (currentQty >= action.max) return state
      return {
        ...state,
        items: {
          ...state.items,
          [action.variantId]: {
            variantId: action.variantId,
            lineItemId: entry?.lineItemId ?? null,
            quantity: currentQty + 1,
            lastSyncedQuantity: entry?.lastSyncedQuantity ?? 0,
          },
        },
      }
    }

    case "DECREMENT": {
      const entry = state.items[action.variantId]
      if (!entry || entry.quantity <= 0) return state
      const newQty = entry.quantity - 1
      if (newQty <= 0) {
        // Remove from local state — flush will handle deleteLineItem
        const { [action.variantId]: _, ...rest } = state.items
        return { ...state, items: rest }
      }
      return {
        ...state,
        items: {
          ...state.items,
          [action.variantId]: { ...entry, quantity: newQty },
        },
      }
    }

    case "SET_QUANTITY": {
      const entry = state.items[action.variantId]
      const clampedQty = Math.max(0, Math.min(action.quantity, action.max))
      if (clampedQty <= 0) {
        const { [action.variantId]: _, ...rest } = state.items
        return { ...state, items: rest }
      }
      return {
        ...state,
        items: {
          ...state.items,
          [action.variantId]: {
            variantId: action.variantId,
            lineItemId: entry?.lineItemId ?? null,
            quantity: clampedQty,
            lastSyncedQuantity: entry?.lastSyncedQuantity ?? 0,
          },
        },
      }
    }

    case "CONFIRM_SYNC": {
      const entry = state.items[action.variantId]
      // If server says 0 and we already removed locally, nothing to restore
      if (!entry && action.serverQuantity <= 0) return state
      // If server says 0, remove
      if (action.serverQuantity <= 0) {
        const { [action.variantId]: _, ...rest } = state.items
        return { ...state, items: rest }
      }
      return {
        ...state,
        items: {
          ...state.items,
          [action.variantId]: {
            variantId: action.variantId,
            lineItemId: action.lineItemId,
            // Preserve the user's current local quantity — they may have clicked
            // more while the server request was in flight. Only advance
            // lastSyncedQuantity so the dirty check can trigger a follow-up flush.
            quantity: entry?.quantity ?? action.serverQuantity,
            lastSyncedQuantity: action.serverQuantity,
          },
        },
      }
    }

    case "CLEAR_ERROR": {
      const { [action.variantId]: _, ...rest } = state.errors
      return { ...state, errors: rest }
    }

    case "SET_ERROR": {
      return {
        ...state,
        errors: { ...state.errors, [action.variantId]: action.error },
      }
    }

    case "UPDATE_CART": {
      return { ...state, cart: action.cart }
    }

    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface CartStoreContextValue {
  state: CartStoreState
  dispatch: React.Dispatch<CartStoreAction>
  getQuantity: (variantId: string) => number
  getLineItemId: (variantId: string) => string | null
  getError: (variantId: string) => string | null
}

const CartStoreContext = createContext<CartStoreContextValue | null>(null)

export function useCartStore() {
  const ctx = useContext(CartStoreContext)
  if (!ctx) {
    throw new Error("useCartStore must be used within a <CartStoreProvider>")
  }
  return ctx
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

const DEBOUNCE_MS = 300

export function CartStoreProvider({
  children,
  initialCart,
}: {
  children: React.ReactNode
  initialCart: HttpTypes.StoreCart | null
}) {
  const [state, dispatch] = useReducer(cartStoreReducer, {
    items: {},
    cart: initialCart,
    errors: {},
  })

  const countryCode = useParams().countryCode as string

  // Refs to avoid stale closures in debounce/timeout callbacks
  const stateRef = useRef(state)
  stateRef.current = state

  const dispatchRef = useRef(dispatch)
  dispatchRef.current = dispatch

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const flushInProgressRef = useRef(false)
  const pendingVariantIdsRef = useRef<Set<string>>(new Set())
  // Track deletions: variantId → lineItemId (captured at the moment quantity hit 0)
  const pendingDeletionsRef = useRef<Map<string, string>>(new Map())

  // Initialise from server cart on first mount
  const initializedRef = useRef(false)
  useEffect(() => {
    if (initialCart && !initializedRef.current) {
      dispatch({ type: "INIT_CART", cart: initialCart })
      initializedRef.current = true
    }
  }, [initialCart])

  // -----------------------------------------------------------------------
  // Flush pending changes to the server
  // -----------------------------------------------------------------------
  const flushToServer = useCallback(async () => {
    if (flushInProgressRef.current) return

    const variantIds = Array.from(pendingVariantIdsRef.current)
    const deletionEntries = Array.from(pendingDeletionsRef.current.entries())

    if (variantIds.length === 0 && deletionEntries.length === 0) return

    flushInProgressRef.current = true
    pendingVariantIdsRef.current.clear()
    pendingDeletionsRef.current.clear()

    // 1. Handle deletions first
    for (const [variantId, lineItemId] of deletionEntries) {
      try {
        await deleteLineItem(lineItemId)
        dispatchRef.current({
          type: "CONFIRM_SYNC",
          variantId,
          lineItemId: null,
          serverQuantity: 0,
        })
      } catch (err) {
        console.error("Cart delete error:", err)
        dispatchRef.current({
          type: "SET_ERROR",
          variantId,
          error: "Failed to remove item",
        })
      }
    }

    // 2. Handle updates / additions
    for (const variantId of variantIds) {
      // Re-read current state in case it changed between scheduling and flush
      const entry = stateRef.current.items[variantId]

      if (!entry) {
        // Item was already removed — skip
        continue
      }

      if (entry.quantity === entry.lastSyncedQuantity) continue

      try {
        if (entry.lineItemId) {
          // Existing line item — update quantity
          await updateLineItem({
            lineId: entry.lineItemId,
            quantity: entry.quantity,
          })
          dispatchRef.current({
            type: "CONFIRM_SYNC",
            variantId,
            lineItemId: entry.lineItemId,
            serverQuantity: entry.quantity,
          })
        } else {
          // New item — add to cart
          await addToCart({
            variantId,
            quantity: entry.quantity,
            countryCode,
          })
          // Fetch cart to get the lineItemId back
          const cart = await retrieveCart()
          if (cart?.items) {
            const matchingItem = cart.items.find(
              (item) => item.variant_id === variantId
            )
            if (matchingItem) {
              dispatchRef.current({
                type: "CONFIRM_SYNC",
                variantId,
                lineItemId: matchingItem.id,
                serverQuantity: matchingItem.quantity,
              })
              // Also update the full cart snapshot
              dispatchRef.current({ type: "UPDATE_CART", cart })
            }
          }
        }
      } catch (err) {
        console.error("Cart sync error:", err)
        dispatchRef.current({
          type: "SET_ERROR",
          variantId,
          error: "Failed to sync quantity",
        })
        // Revert to last known server state
        dispatchRef.current({
          type: "CONFIRM_SYNC",
          variantId,
          lineItemId: entry.lineItemId,
          serverQuantity: entry.lastSyncedQuantity,
        })
      }
    }

    flushInProgressRef.current = false

    // Notify other components (e.g. cart page, free-shipping nudge) that the
    // cart changed. Tag the event so the context's own listener doesn't
    // respond to it and trigger a redundant server re-fetch.
    window.dispatchEvent(
      new CustomEvent("cart-updated", { detail: { source: "cart-store" } })
    )
  }, [countryCode])

  // -----------------------------------------------------------------------
  // Schedule a flush after DEBOUNCE_MS of inactivity
  // -----------------------------------------------------------------------
  const scheduleFlush = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      flushToServer()
    }, DEBOUNCE_MS)
  }, [flushToServer])

  // -----------------------------------------------------------------------
  // Track dirty items and trigger debounced flush
  // -----------------------------------------------------------------------
  const dirtyVariantIds = useMemo(() => {
    return Object.values(state.items)
      .filter((entry) => entry.quantity !== entry.lastSyncedQuantity)
      .map((e) => e.variantId)
  }, [state.items])

  useEffect(() => {
    for (const vid of dirtyVariantIds) {
      pendingVariantIdsRef.current.add(vid)
    }
    if (dirtyVariantIds.length > 0 || pendingDeletionsRef.current.size > 0) {
      scheduleFlush()
    }
  }, [dirtyVariantIds, scheduleFlush])

  // -----------------------------------------------------------------------
  // Wrap dispatch to intercept deletions (capture lineItemId before removal)
  // -----------------------------------------------------------------------
  const wrappedDispatch: React.Dispatch<CartStoreAction> = useCallback(
    (action: CartStoreAction) => {
      // Before a DECREMENT that would result in 0, capture the lineItemId
      if (action.type === "DECREMENT") {
        const entry = stateRef.current.items[action.variantId]
        if (entry && entry.quantity <= 1 && entry.lineItemId) {
          pendingDeletionsRef.current.set(action.variantId, entry.lineItemId)
        }
      }

      // If SET_QUANTITY with 0 on an existing item, also capture for deletion
      if (action.type === "SET_QUANTITY" && action.quantity <= 0) {
        const entry = stateRef.current.items[action.variantId]
        if (entry?.lineItemId) {
          pendingDeletionsRef.current.set(action.variantId, entry.lineItemId)
        }
      }

      dispatch(action)
    },
    [dispatch]
  )

  // -----------------------------------------------------------------------
  // Cleanup timer on unmount
  // -----------------------------------------------------------------------
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  // Re-sync full cart when page becomes visible again (tab switch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        retrieveCart().then((cart) => {
          if (cart) {
            dispatchRef.current({ type: "INIT_CART", cart })
          }
        })
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [])

  // Listen for external cart-updated events (e.g. from checkout, cart page,
  // or DeleteButton). Ignore events fired by the context itself (tagged with
  // source: "cart-store") to avoid a redundant re-fetch that would overwrite
  // pending local quantities.
  useEffect(() => {
    const handleCartUpdated = (e: Event) => {
      const detail = (e as CustomEvent<{ source?: string }>).detail
      // Ignore our own events — we already have the correct state
      if (detail?.source === "cart-store") return
      // Don't re-fetch while a flush is in progress (avoid race)
      if (flushInProgressRef.current) return
      retrieveCart().then((cart) => {
        if (cart) {
          dispatchRef.current({ type: "INIT_CART", cart })
        }
      })
    }
    window.addEventListener("cart-updated", handleCartUpdated)
    return () => window.removeEventListener("cart-updated", handleCartUpdated)
  }, [])

  // -----------------------------------------------------------------------
  // Context value
  // -----------------------------------------------------------------------
  const value: CartStoreContextValue = useMemo(
    () => ({
      state,
      dispatch: wrappedDispatch,
      getQuantity: (variantId: string) => state.items[variantId]?.quantity ?? 0,
      getLineItemId: (variantId: string) =>
        state.items[variantId]?.lineItemId ?? null,
      getError: (variantId: string) => state.errors[variantId] ?? null,
    }),
    [state, wrappedDispatch]
  )

  return (
    <CartStoreContext.Provider value={value}>
      {children}
    </CartStoreContext.Provider>
  )
}
