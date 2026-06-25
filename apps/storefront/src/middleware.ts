import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "dk"

// ---------------------------------------------------------------------------
// Tenant detection helpers
// ---------------------------------------------------------------------------

type TenantConfig = {
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

const tenantCache = new Map<string, { data: TenantConfig | null; ts: number }>()
const TENANT_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function getTenantForRequest(host: string): Promise<TenantConfig | null> {
  // Extract subdomain — ignore www, bare domains, localhost without subdomain
  const hostWithoutPort = host.split(":")[0]
  const parts = hostWithoutPort.split(".")

  // Require at least subdomain.domain.tld (3 parts) or subdomain.localhost (2 parts)
  const isLocalhost = hostWithoutPort.endsWith("localhost")
  if (isLocalhost && parts.length < 2) return null
  if (!isLocalhost && parts.length < 3) return null

  const subdomain = parts[0]
  if (!subdomain || subdomain === "www") return null

  const cached = tenantCache.get(subdomain)
  if (cached && Date.now() - cached.ts < TENANT_CACHE_TTL) {
    return cached.data
  }

  try {
    const res = await fetch(
      `${BACKEND_URL}/store/tenants?subdomain=${encodeURIComponent(subdomain)}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) {
      tenantCache.set(subdomain, { data: null, ts: Date.now() })
      return null
    }
    const { tenant } = await res.json()
    tenantCache.set(subdomain, { data: tenant, ts: Date.now() })
    return tenant as TenantConfig
  } catch {
    tenantCache.set(subdomain, { data: null, ts: Date.now() })
    return null
  }
}

// Maps country codes to UI locales. Unlisted countries default to "en".
const COUNTRY_LOCALE_MAP: Record<string, string> = {
  il: "he",
}

function getLocaleForCountry(countryCode: string): string {
  return COUNTRY_LOCALE_MAP[countryCode.toLowerCase()] ?? "en"
}

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap(cacheId: string, publishableKey?: string | null) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (!BACKEND_URL) {
    throw new Error(
      "Middleware.ts: Error fetching regions. Did you set up regions in your Medusa Admin and define a NEXT_PUBLIC_MEDUSA_BACKEND_URL environment variable."
    )
  }

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    // Fetch regions from Medusa. We can't use the JS client here because middleware is running on Edge and the client needs a Node environment.
    const response = await fetch(`${BACKEND_URL}/store/regions`, {
      method: "GET",
      headers: {
        "x-publishable-api-key": (publishableKey ?? PUBLISHABLE_API_KEY)!,
      },
      next: {
        revalidate: 3600,
        tags: [`regions-${cacheId}`],
      },
    })

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`)
    }

    const json = await response.json()

    const { regions } = json

    if (!regions?.length) {
      return new Map<string, HttpTypes.StoreRegion>()
    }

    // Create a map of country codes to regions.
    regions.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach((c) => {
        regionMapCache.regionMap.set(c.iso_2 ?? "", region)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
  }

  return regionMapCache.regionMap
}

/**
 * Fetches regions from Medusa and sets the region cookie.
 * @param request
 * @param response
 */
async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  let countryCode

  const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

  // Cloudflare Workers provides country via request.cf.country
  const cloudflareCountryCode = (
    request as { cf?: { country?: string } }
  ).cf?.country?.toLowerCase()

  // Vercel provides x-vercel-ip-country header
  const vercelCountryCode = request.headers
    .get("x-vercel-ip-country")
    ?.toLowerCase()

  if (urlCountryCode && regionMap.has(urlCountryCode)) {
    countryCode = urlCountryCode
  } else if (cloudflareCountryCode && regionMap.has(cloudflareCountryCode)) {
    countryCode = cloudflareCountryCode
  } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
    countryCode = vercelCountryCode
  } else if (regionMap.has(DEFAULT_REGION)) {
    countryCode = DEFAULT_REGION
  } else if (regionMap.keys().next().value) {
    countryCode = regionMap.keys().next().value
  }

  return countryCode
}

/**
 * Middleware to handle region selection and onboarding status.
 */
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
  }

  // ---------------------------------------------------------------------------
  // Tenant detection via subdomain
  // ---------------------------------------------------------------------------
  const host = request.headers.get("host") || ""
  const tenant = await getTenantForRequest(host)

  const cacheIdCookie = request.cookies.get("_medusa_cache_id")
  const cacheId = cacheIdCookie?.value || crypto.randomUUID()

  // Use tenant's publishable key if available, otherwise fall back to env
  const publishableKey = tenant?.publishable_api_key ?? PUBLISHABLE_API_KEY

  const regionMap = await getRegionMap(cacheId, publishableKey)
  const countryCode = await getCountryCode(request, regionMap)

  // if the country code is available, use it, otherwise use the default region
  const country = countryCode || DEFAULT_REGION
  const firstPathSegment = request.nextUrl.pathname.split("/")[1]?.toLowerCase()
  const urlHasCountry = firstPathSegment === country.toLowerCase()

  // Attach tenant info as a header so server components can read it
  const requestHeaders = new Headers(request.headers)
  if (tenant) {
    requestHeaders.set("x-tenant", JSON.stringify(tenant))
  }
  requestHeaders.set("x-publishable-api-key", publishableKey ?? "")

  if (urlHasCountry) {
    const response = NextResponse.next({ request: { headers: requestHeaders } })
    if (!cacheIdCookie) {
      response.cookies.set("_medusa_cache_id", cacheId, {
        maxAge: 60 * 60 * 24,
      })
    }
    // Derive locale from country and keep the cookie in sync
    response.cookies.set("_medusa_locale", getLocaleForCountry(country), {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })
    return response
  }

  // if the url doesn't have the country, redirect to it
  const redirectPath =
    request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname
  const queryString = request.nextUrl.search || ""
  const redirectUrl = `${request.nextUrl.origin}/${country}${redirectPath}${queryString}`

  return NextResponse.redirect(redirectUrl, 307)
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
