import { Heading, Text } from "@modules/common/components/ui"
import { getTranslations } from "next-intl/server"

import InteractiveLink from "@modules/common/components/interactive-link"

const EmptyCartMessage = async () => {
  const t = await getTranslations("cart")

  return (
    <div
      className="surface-card py-20 px-6 small:px-10 flex flex-col justify-center items-start"
      data-testid="empty-cart-message"
    >
      <Heading
        level="h1"
        className="flex flex-row text-3xl-regular gap-x-2 items-baseline"
      >
        {t("title")}
      </Heading>
      <Text className="text-base-regular mt-3 mb-6 max-w-[32rem] text-[var(--text-muted)]">
        {t("empty")}
      </Text>
      <div>
        <InteractiveLink href="/store">{t("explore")}</InteractiveLink>
      </div>
    </div>
  )
}

export default EmptyCartMessage
