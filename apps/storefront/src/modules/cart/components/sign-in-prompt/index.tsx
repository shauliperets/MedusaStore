import { Button, Heading, Text } from "@modules/common/components/ui"
import { getTranslations } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = async () => {
  const t = await getTranslations("cart")

  return (
    <div className="surface-card flex flex-col gap-4 small:flex-row small:items-center small:justify-between p-4">
      <div>
        <Heading level="h2" className="txt-xlarge text-[var(--text-base)]">
          {t("haveAccount")}
        </Heading>
        <Text className="txt-medium mt-2 text-[var(--text-muted)]">
          {t("signInBetter")}
        </Text>
      </div>
      <div>
        <LocalizedClientLink href="/account">
          <Button variant="secondary" size="md" data-testid="sign-in-button">
            {t("signIn")}
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
