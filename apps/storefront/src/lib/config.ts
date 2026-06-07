import { getLocaleHeader } from "@lib/util/get-locale-header"
import Medusa, { FetchArgs, FetchInput } from "@medusajs/js-sdk"

// Defaults to standard port for Medusa server
let MEDUSA_BACKEND_URL = "http://localhost:9000"

if (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) {
  MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
}

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})

const originalFetch = sdk.client.fetch.bind(sdk.client)

sdk.client.fetch = async <T>(
  input: FetchInput,
  init?: FetchArgs
): Promise<T> => {
  const fetchHeaders = init?.headers ?? {}
  let localeHeader: Record<string, string | null> | undefined

  try {
    localeHeader = await getLocaleHeader()
    ;(fetchHeaders as Record<string, string | null>)["x-medusa-locale"] ??=
      localeHeader["x-medusa-locale"]
  } catch {}

  // Inject per-tenant publishable key from the x-publishable-api-key header
  // (set by middleware). Only applies in server context.
  let tenantKey: string | null = null
  try {
    const { headers } = await import("next/headers")
    const headersList = await headers()
    tenantKey = headersList.get("x-publishable-api-key")
  } catch {}

  const newHeaders: Record<string, string | null> = {
    ...localeHeader,
    ...fetchHeaders,
  }

  if (tenantKey) {
    newHeaders["x-publishable-api-key"] = tenantKey
  }

  init = { ...init, headers: newHeaders }
  return originalFetch(input, init)
}
