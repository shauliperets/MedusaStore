import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260618105128 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "tenant" drop constraint if exists "tenant_subdomain_unique";`);
    this.addSql(`create table if not exists "tenant" ("id" text not null, "subdomain" text not null, "store_name" text not null, "headline" text null, "tagline" text null, "logo_text" text null, "publishable_api_key" text not null, "sales_channel_id" text null, "region_id" text null, "default_locale" text not null default 'en', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "tenant_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_tenant_subdomain_unique" ON "tenant" ("subdomain") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_tenant_deleted_at" ON "tenant" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "tenant" cascade;`);
  }

}
