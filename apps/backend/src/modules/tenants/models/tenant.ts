/** @format */

import { model } from "@medusajs/framework/utils";

const Tenant = model.define("tenant", {
  id: model.id().primaryKey(),
  subdomain: model.text().unique(),
  store_name: model.text(),
  headline: model.text().nullable(),
  tagline: model.text().nullable(),
  logo_text: model.text().nullable(),
  publishable_api_key: model.text(),
  sales_channel_id: model.text().nullable(),
  region_id: model.text().nullable(),
  default_locale: model.text().default("en"),
});

export default Tenant;
