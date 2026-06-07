"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import useToggleState from "@lib/hooks/use-toggle-state"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text, clx } from "@modules/common/components/ui"
import {
  ChevronRight,
  Languages,
  Menu,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react"
import { Fragment } from "react"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"
import { Locale } from "@lib/data/locales"

const SideMenuItems = [
  { label: "Store", href: "/store", icon: ShoppingBag },
  { label: "Account", href: "/account", icon: UserRound },
  { label: "Cart", href: "/cart", icon: ShoppingBag },
]

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
}

const SideMenu = ({ regions, locales, currentLocale }: SideMenuProps) => {
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()

  return (
    <div className="h-full flex items-center">
      <Popover className="h-full flex">
        {({ open, close }) => (
          <>
            <div className="relative flex h-full">
              <Popover.Button
                data-testid="nav-menu-button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--surface-border)] bg-[var(--surface-elevated)] text-[var(--text-base)] transition-all hover:scale-[1.03] hover:border-sky-300/70 hover:text-[var(--brand-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <span className="sr-only">Open navigation menu</span>
                <Menu size={18} />
              </Popover.Button>
            </div>

            {open && (
              <div
                className="fixed inset-0 z-[50] bg-slate-950/35 backdrop-blur-sm"
                onClick={close}
                data-testid="side-menu-backdrop"
              />
            )}

            <Transition
              show={open}
              as={Fragment}
              enter="transition duration-300 ease-out"
              enterFrom="opacity-0 -translate-x-6"
              enterTo="opacity-100 translate-x-0"
              leave="transition duration-200 ease-in"
              leaveFrom="opacity-100 translate-x-0"
              leaveTo="opacity-0 -translate-x-3"
            >
              <PopoverPanel className="fixed inset-y-3 left-3 z-[60] w-[min(85vw,360px)]">
                <div
                  data-testid="nav-menu-popup"
                  className="surface-card flex h-full flex-col justify-between rounded-2xl p-5 shadow-2xl"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Text className="text-small-semi uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        Navigation
                      </Text>
                      <button
                        data-testid="close-menu-button"
                        onClick={close}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--surface-border)] text-[var(--text-muted)] transition-colors hover:text-[var(--text-base)]"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <ul className="space-y-2">
                      {SideMenuItems.map(({ label, href, icon: Icon }) => {
                        return (
                          <li key={label}>
                            <LocalizedClientLink
                              href={href}
                              className="group flex items-center justify-between rounded-xl px-3 py-3 text-base font-medium text-[var(--text-base)] transition-all hover:bg-slate-100 dark:hover:bg-slate-900"
                              onClick={close}
                              data-testid={`${label.toLowerCase()}-link`}
                            >
                              <span className="flex items-center gap-3">
                                <Icon
                                  size={18}
                                  className="text-[var(--text-muted)] group-hover:text-[var(--brand-accent)]"
                                />
                                {label}
                              </span>
                              <ChevronRight
                                size={16}
                                className="text-[var(--text-muted)] transition-transform group-hover:translate-x-1"
                              />
                            </LocalizedClientLink>
                          </li>
                        )
                      })}
                    </ul>
                  </div>

                  <div className="space-y-4 border-t border-[var(--surface-border)] pt-4">
                    {!!locales?.length && (
                      <div
                        className="flex items-center justify-between"
                        onMouseEnter={languageToggleState.open}
                        onMouseLeave={languageToggleState.close}
                      >
                        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                          <Languages size={16} />
                          <LanguageSelect
                            toggleState={languageToggleState}
                            locales={locales}
                            currentLocale={currentLocale}
                          />
                        </div>
                        <ChevronRight
                          className={clx(
                            "h-4 w-4 text-[var(--text-muted)] transition-transform duration-150",
                            languageToggleState.state ? "-rotate-90" : ""
                          )}
                        />
                      </div>
                    )}

                    <div
                      className="flex items-center justify-between"
                      onMouseEnter={countryToggleState.open}
                      onMouseLeave={countryToggleState.close}
                    >
                      {regions && (
                        <CountrySelect
                          toggleState={countryToggleState}
                          regions={regions}
                        />
                      )}
                      <ChevronRight
                        className={clx(
                          "h-4 w-4 text-[var(--text-muted)] transition-transform duration-150",
                          countryToggleState.state ? "-rotate-90" : ""
                        )}
                      />
                    </div>

                    <Text className="text-small-regular text-[var(--text-muted)]">
                      © {new Date().getFullYear()} Medusa Store
                    </Text>
                  </div>
                </div>
              </PopoverPanel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  )
}

export default SideMenu
