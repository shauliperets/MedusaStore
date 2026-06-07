/** @format */

import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { HttpTypes } from "@medusajs/types";

type RegionDetailsProps = {
  data: HttpTypes.AdminRegion;
};

const RegionPaymentWarningWidget = ({ data }: RegionDetailsProps) => {
  const hasNoProviders = !data.payment_providers || data.payment_providers.length === 0;

  if (!hasNoProviders) return null;

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 shadow-sm">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-base font-bold text-amber-600">
        !
      </div>
      <div>
        <p className="font-semibold mb-1">Payment providers are not selected</p>
        <p className="text-amber-800">
          This region cannot accept payments until at least one provider is configured (for example,{" "}
          <strong>System</strong>).
        </p>
      </div>
    </div>
  );
};

export const config = defineWidgetConfig({
  zone: "region.details.before",
});

export default RegionPaymentWarningWidget;
