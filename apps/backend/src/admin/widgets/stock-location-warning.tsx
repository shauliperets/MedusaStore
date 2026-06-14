/** @format */

import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { HttpTypes } from "@medusajs/types";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type ProductDetailsProps = {
  data: HttpTypes.AdminProduct;
};

const InfoIcon = ({ tooltip }: { tooltip: string }) => (
  <span
    title={tooltip}
    className="ml-1.5 inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-amber-300 bg-amber-50 text-[11px] font-bold text-amber-700 transition-colors hover:bg-amber-100 hover:border-amber-400"
    aria-label={tooltip}
  >
    ?
  </span>
);

/**
 * Check if any stock location exists and is linked to a sales channel.
 * If not, products with manage_inventory=true + allow_backorder=false
 * will silently fail when customers try to add them to cart.
 */
const StockLocationWarningWidget = ({ data }: ProductDetailsProps) => {
  const { t } = useTranslation();
  const [stockLocations, setStockLocations] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/admin/stock-locations", { credentials: "include" })
      .then((res) => res.json())
      .then((json) => {
        setStockLocations(json.stock_locations?.length ?? 0);
      })
      .catch(() => setStockLocations(0))
      .finally(() => setLoading(false));
  }, []);

  const problematicVariants =
    data.variants?.filter(
      (v) => v.manage_inventory && !v.allow_backorder && (v.inventory_quantity == null || v.inventory_quantity === 0),
    ) ?? [];

  const hasStockLocations = stockLocations > 0;
  const hasProblems = problematicVariants.length > 0;

  if (loading) return null;
  if (!hasStockLocations && !hasProblems) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Global warning: no stock locations exist */}
      {!hasStockLocations && hasProblems && (
        <div className="flex items-start gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900 shadow-sm">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-base font-bold text-red-600">
            !
          </div>
          <div>
            <p className="font-semibold mb-1 inline-flex items-center">
              {t("stockLocationWarning.title")}
              <InfoIcon tooltip={t("stockLocationWarning.tooltip")} />
            </p>
            <p className="text-red-800 mb-2">{t("stockLocationWarning.description")}</p>
            <p className="text-red-800 font-medium">{t("stockLocationWarning.affectedVariants")}:</p>
            <ul className="list-disc list-inside mt-1 text-red-700">
              {problematicVariants.map((v) => (
                <li key={v.id}>
                  {v.title || t("stockLocationWarning.defaultVariant")} —{" "}
                  {t("stockLocationWarning.inventoryOnNoBackorder")}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-red-700 font-medium">{t("stockLocationWarning.action")}</p>
          </div>
        </div>
      )}

      {/* Per-variant warning: inventory on, backorder off, no stock */}
      {hasStockLocations &&
        problematicVariants.map((v) => (
          <div
            key={v.id}
            className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm"
          >
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-sm font-bold text-amber-600">
              !
            </div>
            <div>
              <p className="font-semibold">
                {t("stockLocationWarning.perVariantTitle", {
                  variant: v.title || t("stockLocationWarning.defaultVariant"),
                })}
              </p>
              <p className="text-amber-800">{t("stockLocationWarning.perVariantDescription")}</p>
            </div>
          </div>
        ))}
    </div>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.after",
});

export default StockLocationWarningWidget;
