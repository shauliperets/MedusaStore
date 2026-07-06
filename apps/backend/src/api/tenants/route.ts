/** @format */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { TENANT_MODULE } from "../../modules/tenants";
import TenantModuleService from "../../modules/tenants/service";

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

  return res.json({ tenant });
}
