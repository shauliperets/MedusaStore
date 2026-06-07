"use client"

import { addToCart } from "@lib/data/cart"
import { useParams } from "next/navigation"
import { useEffect, useState, useTransition } from "react"

type ProductCardCounterProps = {
  variantId: string | null
}

export default function ProductCardCounter({
  variantId,
}: ProductCardCounterProps) {
  const [counter, setCounter] = useState(0)
  const [isHover, setIsHover] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isError, setIsError] = useState(false)

  const countryCode = useParams().countryCode as string

  useEffect(() => {
    if (!isError) return
    const timer = setTimeout(() => setIsError(false), 1500)
    return () => clearTimeout(timer)
  }, [isError])

  const handlePlus = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!variantId) return
    const previousCount = counter
    setCounter(counter + 1)
    startTransition(async () => {
      try {
        await addToCart({ variantId, quantity: 1, countryCode })
      } catch (err) {
        console.error("Failed to add to cart:", err)
        setCounter(previousCount)
        setIsError(true)
      }
    })
  }

  const handleMinus = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (counter <= 0) return
    const newCount = counter - 1
    setCounter(newCount)
  }

  const showButtons = isHover || counter > 0
  const showMinus = showButtons && counter > 0

  return (
    <div
      className="absolute inset-0 flex items-end justify-center pb-3 z-10"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div className="flex items-center gap-x-3">
        {/* Minus button */}
        <button
          onClick={handleMinus}
          aria-label="Remove from cart"
          className={[
            "w-10 h-10 rounded-full bg-black/60 border-none cursor-pointer flex items-center justify-center",
            "shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-all duration-300",
            "hover:bg-black/80 hover:scale-110",
            showMinus
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-75 pointer-events-none",
          ].join(" ")}
        >
          {/* Minus symbol */}
          <span className="block w-[18px] h-[2px] bg-white rounded-full" />
        </button>

        {/* Counter */}
        {showButtons && (
          <span className="text-white font-semibold text-base min-w-[1.5ch] text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {counter}
          </span>
        )}

        {/* Plus button */}
        <button
          onClick={handlePlus}
          disabled={isPending || !variantId}
          aria-label="Add to cart"
          className={[
            "w-10 h-10 rounded-full border-none cursor-pointer relative flex items-center justify-center",
            "shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-all duration-300",
            isError
              ? "bg-red-500/80 hover:bg-red-500"
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
      </div>
    </div>
  )
}
