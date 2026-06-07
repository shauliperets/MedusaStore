/** @format */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { TENANT_MODULE } from "../../../modules/tenants";
import TenantModuleService from "../../../modules/tenants/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const tenantService: TenantModuleService = req.scope.resolve(TENANT_MODULE);
  const tenants = await tenantService.listTenants({});
  return res.json({ tenants });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const tenantService: TenantModuleService = req.scope.resolve(TENANT_MODULE);
  const tenant = await tenantService.createTenants(req.body as any);
  return res.status(201).json({ tenant });
}
