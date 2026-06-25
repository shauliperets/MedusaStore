# MedusaStore — AI Context File

## Project Overview

A **multi-tenant e-commerce platform** built on MedusaJS v2. Each subdomain maps to a fully independent store with its own catalog, sales channel, publishable API key, and region. The platform operator manages tenants via a custom Medusa Admin widget; each tenant gets a branded Next.js storefront at `<subdomain>.domain.com`.

---

## Repository Structure

```
MedusaStore/                    # Turborepo monorepo (npm workspaces)
├── apps/
│   ├── backend/                # MedusaJS v2 backend (Node 20+)
│   │   └── src/
│   │       ├── admin/          # Custom admin widgets & i18n (en/he)
│   │       ├── api/            # Custom API routes (MedusaRequest/MedusaResponse)
│   │       ├── modules/        # Custom Medusa modules (e.g. tenants)
│   │       ├── workflows/      # Custom Medusa workflows
│   │       ├── links/          # Module link definitions
│   │       ├── jobs/           # Background jobs
│   │       └── subscribers/    # Event subscribers
│   └── storefront/             # Next.js 15 + React 19 storefront
│       └── src/
│           ├── app/            # App Router pages ([countryCode] layout)
│           ├── modules/        # Feature modules (account, cart, checkout, …)
│           ├── lib/
│           │   ├── data/       # Server-side data-fetching functions
│           │   ├── context/    # Server-only context readers (tenant, etc.)
│           │   └── hooks/      # Client hooks
│           └── middleware.ts   # Tenant resolution + locale routing
├── turbo.json
└── package.json
```

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Monorepo | Turborepo + npm workspaces | turbo 2.x |
| Backend | MedusaJS | 2.15.3 |
| Backend language | TypeScript | 5.6 |
| Storefront | Next.js (App Router) | 15.x |
| Storefront UI | React | 19.x |
| Styling | Tailwind CSS | 3.x |
| i18n | next-intl | 4.x |
| Payments | Stripe (`@stripe/react-stripe-js`) | — |
| UI primitives | Radix UI, Headless UI, Lucide React | — |
| Admin UI | `@medusajs/ui` + `react-i18next` | 4.x / 13.x |
| HTTP client | `@medusajs/js-sdk` | 2.15.3 |
| Deployment | Vercel (storefront) + Hetzner VPS (backend) | — |

---

## Key Commands

```bash
# Development (both apps)
npm run dev

# Individual apps
npm run backend:dev          # Medusa backend only
npm run storefront:dev       # Next.js storefront only (port 3000, Turbopack)

# Build all
npm run build

# Lint all
npm run lint

# Seed the backend database
npm run backend:seed
```

> There are no automated tests. Do not add tests unless explicitly requested.

---

## Multi-Tenancy Architecture

**How it works:**
1. `middleware.ts` extracts the subdomain from the incoming `Host` header.
2. It fetches the `TenantConfig` from the backend (cached for 5 minutes in a `Map`).
3. The resolved config is serialised into an `x-tenant` HTTP header and forwarded to all RSC requests.
4. Server components call `getTenant()` from `src/lib/context/tenant-context.ts` to read the header.

**`TenantConfig` shape:**
```ts
type TenantConfig = {
  id: string
  subdomain: string
  store_name: string
  headline: string | null
  tagline: string | null
  logo_text: string | null
  publishable_api_key: string   // scopes all Medusa SDK calls
  sales_channel_id: string | null
  region_id: string | null
  default_locale: string        // "en" | "he"
}
```

**Critical rule — every data fetch must be tenant-scoped.** Never use a global or env-level publishable key when a tenant config is available. Always derive `publishable_api_key`, `sales_channel_id`, and `region_id` from `getTenant()`.

---

## Non-Negotiable Code Rules

### 1. Tenant-Aware Data Fetching
All storefront server-side data calls must be scoped to the current tenant:

```ts
// ✅ Correct
const tenant = await getTenant()
const sdk = createMedusaClient(tenant.publishable_api_key)

// ❌ Wrong — uses global env key, ignores tenant
const sdk = createMedusaClient(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY)
```

### 2. Internationalisation — next-intl for Every String
No hardcoded text anywhere in the storefront. All user-visible strings must go through `next-intl`:

```tsx
// ✅ Server component
const t = await getTranslations("Namespace")
return <h1>{t("title")}</h1>

// ✅ Client component
const t = useTranslations("Namespace")
return <button>{t("submit")}</button>

// ❌ Never
return <h1>Welcome to our store</h1>
```

- Message files live in `apps/storefront/messages/en.json` and `messages/he.json`.
- When adding a new string, add the key to **both** files.
- Hebrew (`he`) triggers RTL layout — the root `<html dir="rtl">` is set automatically by the layout; no manual RTL handling needed.

### 3. Medusa v2 Module & Workflow Conventions
All backend business logic must follow Medusa v2 patterns:

- **Modules** (`src/modules/`): Define data models using `model.define()` from `@medusajs/framework/utils`. Expose logic through a service class. Never query the database directly outside a module service.
- **Workflows** (`src/workflows/`): Use `createWorkflow` / `createStep` for any multi-step or side-effect-producing operations.
- **Links** (`src/links/`): Use Medusa's module link system to associate entities across modules. Do not add foreign keys manually.
- **API routes** (`src/api/`): Use `MedusaRequest` / `MedusaResponse` from `@medusajs/framework/http`. Resolve module services via `req.scope.resolve(MODULE_KEY)`.
- **Core flows**: Prefer importing from `@medusajs/medusa/core-flows` before writing custom workflows for standard operations.

```ts
// ✅ Correct — resolve service via DI container
const tenantService: TenantModuleService = req.scope.resolve(TENANT_MODULE)

// ❌ Wrong — direct DB access, bypasses module boundaries
const tenants = await db.query("SELECT * FROM tenant")
```

### 4. React Server Components First
Storefront components default to RSC. Only add `"use client"` when the component genuinely requires browser APIs, event handlers, or React state/effects. Prop-drilling interactivity down to a small leaf client component is preferred over marking a whole tree as client-side.

### 5. Tailwind Only — No External CSS Files
All styling must use Tailwind utility classes. Do not create new `.css` files or use CSS-in-JS. The only exception is the existing `globals.css` for base/reset styles.

---

## Admin Customisations

The Medusa Admin is extended with:
- Custom widgets in `apps/backend/src/admin/widgets/`
- i18n via `react-i18next` with message files in `apps/backend/src/admin/i18n/json/` (en / he)

When adding admin UI, follow the same i18n rule: all strings go through `useTranslation()` and both `en.json` + `he.json` must be updated.

---

## Environment Variables

### Backend (`apps/backend/.env`)
```
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
COOKIE_SECRET=
STRIPE_API_KEY=
```

### Storefront (`apps/storefront/.env.local`)
```
NEXT_PUBLIC_MEDUSA_BACKEND_URL=
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=   # fallback only — tenant key takes precedence
NEXT_PUBLIC_DEFAULT_REGION=
NEXT_PUBLIC_STORE_NAME=
NEXT_PUBLIC_STRIPE_KEY=
```

---

## Deployment Notes

- **Storefront** → Vercel. Set all `NEXT_PUBLIC_*` environment variables in the Vercel project dashboard.
- **Backend** → Hetzner VPS. Requires `DATABASE_URL` (PostgreSQL) and `REDIS_URL`. Run `medusa build` before deploying; the start command is `medusa start`.
- Tenant subdomain routing relies on wildcard DNS (`*.domain.com`) pointing to the Vercel deployment.
