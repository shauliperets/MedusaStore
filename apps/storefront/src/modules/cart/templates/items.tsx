import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Heading, Table } from "@modules/common/components/ui"
import { getTranslations } from "next-intl/server"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = async ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items
  const t = await getTranslations("cart")

  return (
    <div>
      <div className="pb-4 flex items-center justify-between">
        <Heading className="text-2xl font-semibold tracking-tight">
          {t("title")}
        </Heading>
      </div>
      <Table>
        <Table.Header className="border-t-0">
          <Table.Row className="text-[var(--text-muted)] text-small-semi uppercase tracking-wide">
            <Table.HeaderCell className="!pl-0">{t("item")}</Table.HeaderCell>
            <Table.HeaderCell></Table.HeaderCell>
            <Table.HeaderCell>{t("quantityLabel")}</Table.HeaderCell>
            <Table.HeaderCell className="hidden small:table-cell">
              {t("price")}
            </Table.HeaderCell>
            <Table.HeaderCell className="!pr-0 text-right">
              {t("total")}
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items
            ? items
                .sort((a, b) => {
                  return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                })
                .map((item) => {
                  return (
                    <Item
                      key={item.id}
                      item={item}
                      currencyCode={cart?.currency_code}
                    />
                  )
                })
            : repeat(5).map((i) => {
                return <SkeletonLineItem key={i} />
              })}
        </Table.Body>
      </Table>
    </div>
  )
}

export default ItemsTemplate
