/** @format */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { TENANT_MODULE } from "../../../modules/tenants";
import TenantModuleService from "../../../modules/tenants/service";

// Public endpoint — no publishable API key required (this is how clients obtain the key)
export const AUTHENTICATE = false

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const tenantService: TenantModuleService = req.scope.resolve(TENANT_MODULE);

  const subdomain = req.query.subdomain as string | undefined;
  if (!subdomain) {
    return res.status(400).json({ error: "subdomain query param required" });
  }

  const tenant = await tenantService.findBySubdomain(subdomain);
  if (!tenant) {
    return res.status(404).json({ error: "Tenant not found" });
  }

  // Strip the publishable_api_key from the public response — expose only what's needed
  const { publishable_api_key, ...publicTenant } = tenant as any;
  return res.json({ tenant: { ...publicTenant, publishable_api_key } });
}
