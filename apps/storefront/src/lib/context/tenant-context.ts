import "server-only"
import { headers } from "next/headers"

export type TenantConfig = {
  id: string
  subdomain: string
  store_name: string
  headline: string | null
  tagline: string | null
  logo_text: string | null
  publishable_api_key: string
  sales_channel_id: string | null
  region_id: string | null
  default_locale: string
}

/**
 * Reads the x-tenant header injected by middleware.
 * Falls back to env-based defaults if no tenant header is present.
 */
export async function getTenant(): Promise<TenantConfig | null> {
  try {
    const headersList = await headers()
    const raw = headersList.get("x-tenant")
    if (raw) {
      return JSON.parse(raw) as TenantConfig
    }
  } catch {}
  return null
}

export async function getTenantStoreName(): Promise<string> {
  const tenant = await getTenant()
  return tenant?.store_name || process.env.NEXT_PUBLIC_STORE_NAME || ""
}
