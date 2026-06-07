/** @format */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { TENANT_MODULE } from "../../../../modules/tenants";
import TenantModuleService from "../../../../modules/tenants/service";

export async function GET(req: MedusaRequest<{ id: string }>, res: MedusaResponse) {
  const tenantService: TenantModuleService = req.scope.resolve(TENANT_MODULE);
  const tenant = await tenantService.retrieveTenant(req.params.id);
  return res.json({ tenant });
}

export async function PATCH(req: MedusaRequest<{ id: string }>, res: MedusaResponse) {
  const tenantService: TenantModuleService = req.scope.resolve(TENANT_MODULE);
  const tenant = await tenantService.updateTenants({
    id: req.params.id,
    ...(req.body as any),
  });
  return res.json({ tenant });
}

export async function DELETE(req: MedusaRequest<{ id: string }>, res: MedusaResponse) {
  const tenantService: TenantModuleService = req.scope.resolve(TENANT_MODULE);
  await tenantService.deleteTenants(req.params.id);
  return res.status(200).json({ id: req.params.id, deleted: true });
}
