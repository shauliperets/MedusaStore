/** @format */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  createApiKeysWorkflow,
  createSalesChannelsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
} from "@medusajs/medusa/core-flows";
import { TENANT_MODULE } from "../../../modules/tenants";
import TenantModuleService from "../../../modules/tenants/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const tenantService: TenantModuleService = req.scope.resolve(TENANT_MODULE);
  const tenants = await tenantService.listTenants({});
  return res.json({ tenants });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  // Strip publishable_api_key from body — it is auto-generated below
  const { publishable_api_key: _ignored, ...tenantData } = req.body as any;

  const { result: [salesChannel] } = await createSalesChannelsWorkflow(req.scope).run({
    input: {
      salesChannelsData: [
        {
          name: tenantData.store_name,
          description: `Sales channel for ${tenantData.store_name}`,
        },
      ],
    },
  });

  const { result: [apiKey] } = await createApiKeysWorkflow(req.scope).run({
    input: {
      api_keys: [
        {
          title: `${tenantData.store_name} - Publishable Key`,
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });

  await linkSalesChannelsToApiKeyWorkflow(req.scope).run({
    input: {
      id: apiKey.id,
      add: [salesChannel.id],
    },
  });

  const tenantService: TenantModuleService = req.scope.resolve(TENANT_MODULE);
  const tenant = await tenantService.createTenants({
    ...tenantData,
    publishable_api_key: apiKey.token,
    sales_channel_id: salesChannel.id,
  });

  return res.status(201).json({ tenant });
}
