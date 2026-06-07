"use client"

import useToggleState from "@lib/hooks/use-toggle-state"
import { HttpTypes } from "@medusajs/types"
import CountrySelect from "../country-select"

type FooterCountrySelectProps = {
  regions: HttpTypes.StoreRegion[]
}

export default function FooterCountrySelect({
  regions,
}: FooterCountrySelectProps) {
  const toggleState = useToggleState()

  return (
    <div
      onMouseEnter={toggleState.open}
      onMouseLeave={toggleState.close}
      className="relative"
    >
      <CountrySelect toggleState={toggleState} regions={regions} />
    </div>
  )
}
