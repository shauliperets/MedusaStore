import { Button, Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="surface-card flex flex-col gap-4 small:flex-row small:items-center small:justify-between p-4">
      <div>
        <Heading level="h2" className="txt-xlarge text-[var(--text-base)]">
          Already have an account?
        </Heading>
        <Text className="txt-medium mt-2 text-[var(--text-muted)]">
          Sign in for a better experience.
        </Text>
      </div>
      <div>
        <LocalizedClientLink href="/account">
          <Button
            variant="secondary"
            size="medium"
            data-testid="sign-in-button"
          >
            Sign in
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
