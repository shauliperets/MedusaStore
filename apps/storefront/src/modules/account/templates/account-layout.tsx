import React from "react"
import UnderlineLink from "@modules/common/components/interactive-link"
import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"
import { Card } from "@modules/common/components/ui"
import { getTranslations } from "next-intl/server"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = async ({
  customer,
  children,
}) => {
  const t = await getTranslations("account")

  return (
    <div className="flex-1 py-6" data-testid="account-page">
      <div className="content-shell mx-auto flex h-full max-w-7xl flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
          <div>{customer && <AccountNav customer={customer} />}</div>
          <div className="min-h-[60vh]">{children}</div>
        </div>
        <Card>
          <Card.Content className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h3 className="text-xl font-semibold mb-2">
                {t("gotQuestions")}
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                {t("questionsSubtext")}
              </p>
            </div>
            <div>
              <UnderlineLink href="/customer-service">
                {t("customerService")}
              </UnderlineLink>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  )
}

export default AccountLayout
