/**
 * Migration script: Creates a demo tenant with its own sales channel and links
 * all existing products, categories, collections, and inventory to it.
 *
 * Run via: npx medusa db:migrate
 */

import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createCollectionsWorkflow,
  createSalesChannelsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";
import { TENANT_MODULE } from "../modules/tenants";
import TenantModuleService from "../modules/tenants/service";

export default async function tenant_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const tenantService: TenantModuleService = container.resolve(TENANT_MODULE);

  logger.info("Seeding demo tenant...");

  // ── 1. Sales channel ──────────────────────────────────────────────────────
  const {
    result: [salesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        {
          name: "Demo Store",
          description: "Sales channel for Demo Store",
        },
      ],
    },
  });

  // ── 2. Publishable API key ────────────────────────────────────────────────
  const {
    result: [apiKey],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "Demo Store - Publishable Key",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });

  // ── 3. Link key → channel ─────────────────────────────────────────────────
  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: apiKey.id,
      add: [salesChannel.id],
    },
  });

  // ── 4. Tenant record ──────────────────────────────────────────────────────
  await tenantService.createTenants({
    subdomain: "demo",
    store_name: "Demo Store",
    headline: "Welcome to Demo Store",
    tagline: "Your favourite online store",
    logo_text: "Demo",
    default_locale: "en",
    publishable_api_key: apiKey.token,
    sales_channel_id: salesChannel.id,
  });

  logger.info("Demo tenant created.");

  // ── 5. Link all existing products to the new sales channel ────────────────
  logger.info("Linking products to Demo Store sales channel...");
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title"],
  });

  if (products.length > 0) {
    await link.create(
      products.map((product: { id: string }) => ({
        [Modules.PRODUCT]: { product_id: product.id },
        [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannel.id },
      }))
    );
    logger.info(`Linked ${products.length} product(s) to Demo Store.`);
  }

  // ── 6. Link stock location → sales channel (Inventory) ───────────────────
  logger.info("Linking stock location to Demo Store sales channel...");
  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  });

  if (stockLocations.length > 0) {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: stockLocations[0].id,
        add: [salesChannel.id],
      },
    });
    logger.info(
      `Linked stock location "${stockLocations[0].name}" to Demo Store.`
    );
  }

  // ── 7. Collection ─────────────────────────────────────────────────────────
  logger.info("Creating Demo Store collection...");
  const {
    result: [collection],
  } = await createCollectionsWorkflow(container).run({
    input: {
      collections: [
        {
          title: "Demo Store Collection",
          handle: "demo-store",
          metadata: { tenant_subdomain: "demo" },
        },
      ],
    },
  });

  // Assign all products to the collection
  if (products.length > 0) {
    const productModuleService = container.resolve(Modules.PRODUCT);
    await Promise.all(
      products.map((product: { id: string }) =>
        productModuleService.updateProducts(product.id, {
          collection_id: collection.id,
        })
      )
    );
    logger.info(
      `Assigned ${products.length} product(s) to collection "${collection.title}".`
    );
  }

  // ── 8. Categories are global — products already have categories from the
  //    initial seed, so they are automatically visible on the Demo Store
  //    once the products are linked to its sales channel.
  logger.info("Demo tenant seed complete.");
}
