import "server-only"

export type TenantConfig = {
  id: string
  subdomain: string
  store_name: string
  headline: string | null
  tagline: string | null
  logo_text: string | null
  publishable_api_key: string
  region_id: string | null
  default_locale: string
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

const tenantCache = new Map<string, { data: TenantConfig | null; ts: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function getTenantBySubdomain(
  subdomain: string
): Promise<TenantConfig | null> {
  const cached = tenantCache.get(subdomain)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data
  }

  try {
    const res = await fetch(
      `${BACKEND_URL}/store/tenants?subdomain=${encodeURIComponent(subdomain)}`,
      {
        next: { revalidate: 300, tags: [`tenant-${subdomain}`] },
        cache: "force-cache",
      }
    )

    if (!res.ok) {
      tenantCache.set(subdomain, { data: null, ts: Date.now() })
      return null
    }

    const { tenant } = (await res.json()) as { tenant: TenantConfig }
    tenantCache.set(subdomain, { data: tenant, ts: Date.now() })
    return tenant
  } catch {
    return null
  }
}
