/** @format */

import { loadEnv, defineConfig } from "@medusajs/framework/utils";
import { TENANT_MODULE } from "./src/modules/tenants";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: {
      pool: {
        min: 1,
        max: 5,
        acquireTimeoutMillis: 600000,
        createTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
      },
    },
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    // Allow session cookies over HTTP (no HTTPS on this deployment)
    cookieOptions: {
      sameSite: "lax" as const,
      secure: false,
    },
  },
  modules: [
    {
      resolve: "./src/modules/tenants",
      key: TENANT_MODULE,
    },
  ],
});
