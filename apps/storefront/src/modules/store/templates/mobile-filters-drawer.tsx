"use client"

import { Dialog, Transition } from "@headlessui/react"
import useToggleState from "@lib/hooks/use-toggle-state"
import { Button, Text } from "@modules/common/components/ui"
import { SlidersHorizontal, X } from "lucide-react"
import { Fragment, ReactNode } from "react"

type MobileFiltersDrawerProps = {
  title: string
  children: ReactNode
}

const MobileFiltersDrawer = ({ title, children }: MobileFiltersDrawerProps) => {
  const { state, open, close } = useToggleState()

  return (
    <>
      <div className="lg:hidden">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={open}
          data-testid="mobile-filters-button"
          aria-label="Open category filters"
        >
          <SlidersHorizontal size={16} className="mr-2" />
          {title}
        </Button>
      </div>

      <Transition appear show={state} as={Fragment}>
        <Dialog as="div" className="relative z-[70] lg:hidden" onClose={close}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-950/35 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-out duration-300"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in duration-200"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel
                  className="h-full w-[min(88vw,360px)] p-3"
                  data-testid="mobile-filters-drawer"
                >
                  <div className="surface-card flex h-full flex-col rounded-2xl p-4">
                    <div className="mb-4 flex items-center justify-between border-b border-[var(--surface-border)] pb-3">
                      <div>
                        <Text className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                          Browse
                        </Text>
                        <Dialog.Title className="text-lg font-semibold tracking-tight text-[var(--text-base)]">
                          {title}
                        </Dialog.Title>
                      </div>
                      <button
                        type="button"
                        onClick={close}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--surface-border)] text-[var(--text-muted)] transition-colors hover:text-[var(--text-base)]"
                        aria-label="Close filters"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1">
                      {children}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default MobileFiltersDrawer
