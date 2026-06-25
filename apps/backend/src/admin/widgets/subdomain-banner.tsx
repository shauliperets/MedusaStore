/** @format */

import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type Tenant = { subdomain: string };

function extractSubdomain(hostname: string): string | null {
  const parts = hostname.split(".");
  const isLocalhost = hostname.endsWith("localhost");
  if (isLocalhost && parts.length < 2) return null;
  if (!isLocalhost && parts.length < 3) return null;
  const subdomain = parts[0];
  if (!subdomain || subdomain === "www") return null;
  return subdomain;
}

const SubdomainBannerWidget = () => {
  const { t } = useTranslation();
  const [unconfiguredSubdomain, setUnconfiguredSubdomain] = useState<string | null>(null);

  useEffect(() => {
    const subdomain = extractSubdomain(window.location.hostname);
    if (!subdomain) return;

    fetch("/admin/tenants", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const tenants: Tenant[] = data.tenants ?? [];
        const found = tenants.some((ten) => ten.subdomain === subdomain);
        if (!found) setUnconfiguredSubdomain(subdomain);
      })
      .catch(() => {});
  }, []);

  if (!unconfiguredSubdomain) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900 shadow-sm mb-4">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-sm font-bold text-amber-600">
        !
      </div>
      <div>
        <span className="font-semibold">
          {t("subdomainBanner.title", { subdomain: unconfiguredSubdomain })}
        </span>
        <span className="ml-2 text-amber-700">{t("subdomainBanner.description")}</span>
      </div>
    </div>
  );
};

export const config = defineWidgetConfig({
  zone: [
    "order.list.before",
    "product.list.before",
    "customer.list.before",
    "region.list.before",
    "product_category.list.before",
    "location.list.before",
    "inventory_item.list.before",
    "promotion.list.before",
  ],
});

export default SubdomainBannerWidget;
