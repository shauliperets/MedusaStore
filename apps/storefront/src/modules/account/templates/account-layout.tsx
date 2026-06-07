import React from "react"
import UnderlineLink from "@modules/common/components/interactive-link"
import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"
import { Card } from "@modules/common/components/ui"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  return (
    <div className="flex-1 py-6" data-testid="account-page">
      <div className="content-shell mx-auto flex h-full max-w-7xl flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <div>{customer && <AccountNav customer={customer} />}</div>
          <div className="flex-1">{children}</div>
        </div>
        <Card>
          <Card.Content className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h3 className="text-xl font-semibold mb-2">Got questions?</h3>
              <p className="text-sm text-[var(--text-muted)]">
                You can find frequently asked questions and answers on our
                customer service page.
              </p>
            </div>
            <div>
              <UnderlineLink href="/customer-service">
                Customer Service
              </UnderlineLink>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  )
}

export default AccountLayout
