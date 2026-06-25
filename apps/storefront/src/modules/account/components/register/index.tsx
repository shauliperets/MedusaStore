"use client"

import { useActionState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"
import { useTranslations } from "next-intl"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(
    signup as (
      state: string | null,
      formData: FormData
    ) => Promise<string | null>,
    null as string | null
  )
  const t = useTranslations("account")
  const tCheckout = useTranslations("checkout")

  return (
    <div
      className="flex w-full max-w-md flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="mb-3 text-center text-2xl font-semibold tracking-tight">
        {t("becomeMember")}
      </h1>
      <p className="mb-5 text-center text-base-regular text-ui-fg-subtle">
        {t("registerSubtext")}
      </p>
      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label={tCheckout("firstName")}
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label={tCheckout("lastName")}
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label={tCheckout("email")}
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label={tCheckout("phone")}
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label={tCheckout("password")}
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={message} data-testid="register-error" />
        <span className="mt-6 text-center text-small-regular text-ui-fg-subtle">
          {t("byCreatingAccount")}{" "}
          <LocalizedClientLink
            href="/content/privacy-policy"
            className="font-medium text-ui-fg-base underline-offset-2 hover:underline"
          >
            {t("privacyPolicy")}
          </LocalizedClientLink>{" "}
          and{" "}
          <LocalizedClientLink
            href="/content/terms-of-use"
            className="font-medium text-ui-fg-base underline-offset-2 hover:underline"
          >
            {t("termsOfUse")}
          </LocalizedClientLink>
          .
        </span>
        <SubmitButton className="w-full mt-6" data-testid="register-button">
          {t("join")}
        </SubmitButton>
      </form>
      <span className="mt-6 text-center text-small-regular text-ui-fg-subtle">
        {t("alreadyMember")}{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="font-medium text-ui-fg-base underline-offset-2 hover:underline"
        >
          {t("login")}
        </button>
        .
      </span>
    </div>
  )
}

export default Register
