import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get("_medusa_locale")?.value
  const locale =
    localeCookie && ["en", "he"].includes(localeCookie) ? localeCookie : "en"

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
