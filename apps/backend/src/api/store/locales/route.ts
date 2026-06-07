/** @format */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

const SUPPORTED_LOCALES = [
  { code: "en", name: "English" },
  { code: "he", name: "עברית" },
];

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  return res.json({ locales: SUPPORTED_LOCALES });
}
