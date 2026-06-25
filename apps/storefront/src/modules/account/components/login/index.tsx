import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"
import { useTranslations } from "next-intl"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)
  const t = useTranslations("account")
  const tCheckout = useTranslations("checkout")

  return (
    <div
      className="flex w-full max-w-md flex-col items-center"
      data-testid="login-page"
    >
      <h1 className="mb-3 text-2xl font-semibold tracking-tight">
        {t("welcomeBack")}
      </h1>
      <p className="mb-8 text-center text-base-regular text-ui-fg-subtle">
        {t("signInSubtext")}
      </p>
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label={tCheckout("email")}
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label={tCheckout("password")}
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={message} data-testid="login-error-message" />
        <SubmitButton data-testid="sign-in-button" className="w-full mt-6">
          {t("login")}
        </SubmitButton>
      </form>
      <span className="mt-6 text-center text-small-regular text-ui-fg-subtle">
        {t("notAMember")}{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="font-medium text-ui-fg-base underline-offset-2 hover:underline"
          data-testid="register-button"
        >
          {t("joinUs")}
        </button>
        .
      </span>
    </div>
  )
}

export default Login
