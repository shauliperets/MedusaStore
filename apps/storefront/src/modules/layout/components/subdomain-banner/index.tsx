import "server-only"
import { headers } from "next/headers"
import { getTenant } from "@lib/context/tenant-context"

function extractSubdomain(host: string): string | null {
  const hostWithoutPort = host.split(":")[0]
  const parts = hostWithoutPort.split(".")
  const isLocalhost = hostWithoutPort.endsWith("localhost")
  if (isLocalhost && parts.length < 2) return null
  if (!isLocalhost && parts.length < 3) return null
  const subdomain = parts[0]
  if (!subdomain || subdomain === "www") return null
  return subdomain
}

export default async function SubdomainBanner() {
  const tenant = await getTenant()
  if (tenant) return null

  const headersList = await headers()
  const host = headersList.get("host") || ""
  const subdomain = extractSubdomain(host)
  if (!subdomain) return null

  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-center text-sm text-amber-800">
      <span className="font-medium">
        ⚠ No tenant configured for subdomain:{" "}
        <strong className="font-bold">{subdomain}</strong>
      </span>
    </div>
  )
}
