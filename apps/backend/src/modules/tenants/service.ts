/** @format */

import { MedusaService } from "@medusajs/framework/utils";
import Tenant from "./models/tenant";

class TenantModuleService extends MedusaService({
  Tenant,
}) {
  async findBySubdomain(subdomain: string) {
    const [tenant] = await this.listTenants({ subdomain });
    return tenant ?? null;
  }
}

export default TenantModuleService;
