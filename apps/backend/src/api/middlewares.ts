/** @format */

import { defineMiddlewares } from "@medusajs/framework/http";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { TENANT_MODULE } from "../modules/tenants";
import TenantModuleService from "../modules/tenants/service";

async function injectSalesChannel(req: MedusaRequest, _res: MedusaResponse, next: () => void) {
  const pubKey = req.headers["x-publishable-api-key"] as string | undefined;
  console.log(
    `>> [Middleware] request.method=${req.method} request.url=${req.url} (pubKey=${pubKey ?? "none"}) request.body=${JSON.stringify(req)}`,
  );
  if (pubKey) {
    const tenantService: TenantModuleService = req.scope.resolve(TENANT_MODULE);
    const [tenant] = await tenantService.listTenants({
      publishable_api_key: pubKey,
    });
    if (tenant?.sales_channel_id) {
      req.query = { ...req.query, sales_channel_id: tenant.sales_channel_id };
    }
  }
  next();
}

export default defineMiddlewares({
  routes: [
    { matcher: "/store/product-categories", middlewares: [injectSalesChannel] },
    { matcher: "/store/orders", middlewares: [injectSalesChannel] },
  ],
});
