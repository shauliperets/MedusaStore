/** @format */

import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

type Tenant = {
  id: string;
  subdomain: string;
  store_name: string;
  headline: string | null;
  tagline: string | null;
  logo_text: string | null;
  publishable_api_key: string;
  sales_channel_id: string | null;
  region_id: string | null;
  default_locale: string;
};

const InfoIcon = ({ tooltip }: { tooltip: string }) => (
  <span
    title={tooltip}
    className="ml-1.5 inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-ui-border-strong bg-ui-bg-subtle text-[11px] font-bold text-ui-fg-muted transition-colors hover:bg-ui-tag-blue-bg hover:text-ui-tag-blue-text hover:border-ui-tag-blue-border"
    aria-label={tooltip}
  >
    ?
  </span>
);

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith("he") ? "he" : "en";

  const switchTo = (lang: "en" | "he") => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-ui-border-base bg-ui-bg-subtle p-1">
      <button
        onClick={() => switchTo("en")}
        className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
          currentLang === "en"
            ? "bg-white text-ui-fg-base shadow-sm dark:bg-slate-800"
            : "text-ui-fg-muted hover:text-ui-fg-base"
        }`}
      >
        {currentLang === "en" && "✓ "}🇬🇧 {t("languageSwitcher.english")}
      </button>
      <button
        onClick={() => switchTo("he")}
        className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
          currentLang === "he"
            ? "bg-white text-ui-fg-base shadow-sm dark:bg-slate-800"
            : "text-ui-fg-muted hover:text-ui-fg-base"
        }`}
      >
        {currentLang === "he" && "✓ "}🇮🇱 {t("languageSwitcher.hebrew")}
      </button>
    </div>
  );
};

const TenantForm = ({
  tenant,
  onSave,
  onCancel,
}: {
  tenant: Partial<Tenant>;
  onSave: (data: Partial<Tenant>) => void;
  onCancel: () => void;
}) => {
  const { t } = useTranslation();
  const [form, setForm] = useState<Partial<Tenant>>(tenant);

  const update = (field: keyof Tenant, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const fields: { field: keyof Tenant; labelKey: string; placeholderKey: string; tooltipKey: string }[] = [
    {
      field: "subdomain",
      labelKey: "tenants.form.fields.subdomain",
      placeholderKey: "tenants.form.fields.subdomainPlaceholder",
      tooltipKey: "tenants.form.fields.subdomainTooltip",
    },
    {
      field: "store_name",
      labelKey: "tenants.form.fields.storeName",
      placeholderKey: "tenants.form.fields.storeNamePlaceholder",
      tooltipKey: "tenants.form.fields.storeNameTooltip",
    },
    {
      field: "headline",
      labelKey: "tenants.form.fields.headline",
      placeholderKey: "tenants.form.fields.headlinePlaceholder",
      tooltipKey: "tenants.form.fields.headlineTooltip",
    },
    {
      field: "tagline",
      labelKey: "tenants.form.fields.tagline",
      placeholderKey: "tenants.form.fields.taglinePlaceholder",
      tooltipKey: "tenants.form.fields.taglineTooltip",
    },
    {
      field: "logo_text",
      labelKey: "tenants.form.fields.logoText",
      placeholderKey: "tenants.form.fields.logoTextPlaceholder",
      tooltipKey: "tenants.form.fields.logoTextTooltip",
    },
    {
      field: "region_id",
      labelKey: "tenants.form.fields.regionId",
      placeholderKey: "tenants.form.fields.regionIdPlaceholder",
      tooltipKey: "tenants.form.fields.regionIdTooltip",
    },
    {
      field: "default_locale",
      labelKey: "tenants.form.fields.defaultLocale",
      placeholderKey: "tenants.form.fields.defaultLocalePlaceholder",
      tooltipKey: "tenants.form.fields.defaultLocaleTooltip",
    },
  ];

  return (
    <div className="rounded-2xl border border-ui-border-base bg-ui-bg-base p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
          <span className="text-base font-semibold">T</span>
        </div>
        <div>
          <p className="text-base font-semibold text-ui-fg-base">{t("tenants.form.title")}</p>
          <p className="text-xs text-ui-fg-subtle">{t("tenants.form.description")}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {fields.map(({ field, labelKey, placeholderKey, tooltipKey }) => (
          <div key={field} className="flex flex-col gap-1.5">
            <label className="text-ui-fg-base text-xs font-semibold uppercase tracking-wide inline-flex items-center gap-1">
              {t(labelKey)}
              <InfoIcon tooltip={t(tooltipKey)} />
            </label>
            <input
              className="h-10 rounded-xl border border-ui-border-base bg-ui-bg-field px-3 text-sm text-ui-fg-base transition-colors focus:border-ui-border-interactive focus:outline-none focus:ring-2 focus:ring-ui-border-interactive/20"
              value={(form[field] as string) ?? ""}
              placeholder={t(placeholderKey)}
              onChange={(e) => update(field, e.target.value)}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-6">
        <button
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
          onClick={() => onSave(form)}
        >
          {t("tenants.form.save")}
        </button>
        <button
          className="inline-flex h-10 items-center rounded-xl border border-ui-border-base px-4 text-sm font-medium text-ui-fg-subtle transition-all hover:bg-ui-bg-subtle hover:text-ui-fg-base"
          onClick={onCancel}
        >
          {t("tenants.form.cancel")}
        </button>
      </div>
    </div>
  );
};

const TenantsWidget = () => {
  const { t } = useTranslation();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/admin/tenants");
      const data = await res.json();
      setTenants(data.tenants ?? []);
    } catch {
      setError(t("tenants.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (data: Partial<Tenant>) => {
    await fetch("/admin/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setCreating(false);
    load();
  };

  const handleUpdate = async (id: string, data: Partial<Tenant>) => {
    await fetch(`/admin/tenants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setEditingId(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("tenants.deleteConfirm"))) return;
    await fetch(`/admin/tenants/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-ui-fg-base">{t("tenants.title")}</h2>
          <p className="text-sm text-ui-fg-subtle">{t("tenants.description")}</p>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <button
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
            onClick={() => setCreating(true)}
          >
            <span aria-hidden="true" className="text-lg">
              +
            </span>{" "}
            {t("tenants.newTenant")}
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {creating && (
        <TenantForm tenant={{ default_locale: "en" }} onSave={handleCreate} onCancel={() => setCreating(false)} />
      )}

      {loading ? (
        <div className="space-y-3">
          <div className="h-24 rounded-xl border border-ui-border-base bg-ui-bg-subtle animate-pulse" />
          <div className="h-24 rounded-xl border border-ui-border-base bg-ui-bg-subtle animate-pulse" />
        </div>
      ) : tenants.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ui-border-base bg-ui-bg-subtle p-6 text-sm text-ui-fg-subtle">
          {t("tenants.noTenants")}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {tenants.map((tenant) =>
            editingId === tenant.id ? (
              <TenantForm
                key={tenant.id}
                tenant={tenant}
                onSave={(data) => handleUpdate(tenant.id, data)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div
                key={tenant.id}
                className="rounded-2xl border border-ui-border-base bg-ui-bg-base p-5 shadow-sm transition-all hover:shadow-md hover:border-indigo-200 flex items-start justify-between gap-4"
              >
                <div className="flex flex-col gap-1">
                  <p className="font-medium text-ui-fg-base">
                    {tenant.store_name}{" "}
                    <span className="text-ui-fg-subtle font-normal text-sm">({tenant.subdomain})</span>
                  </p>
                  {tenant.headline && <p className="text-sm text-ui-fg-subtle">{tenant.headline}</p>}
                  {tenant.tagline && <p className="text-xs text-ui-fg-muted">{tenant.tagline}</p>}
                  <p className="text-xs text-ui-fg-muted mt-1">
                    {t("tenants.locale")}: {tenant.default_locale}
                  </p>
                  {tenant.publishable_api_key && (
                    <p className="text-xs text-ui-fg-muted font-mono mt-0.5 truncate max-w-xs" title={tenant.publishable_api_key}>
                      Key: {tenant.publishable_api_key.slice(0, 24)}…
                    </p>
                  )}
                  {tenant.sales_channel_id && (
                    <p className="text-xs text-ui-fg-muted font-mono mt-0.5 truncate max-w-xs" title={tenant.sales_channel_id}>
                      Channel: {tenant.sales_channel_id}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                    onClick={() => setEditingId(tenant.id)}
                  >
                    {t("tenants.edit")}
                  </button>
                  <button
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => handleDelete(tenant.id)}
                  >
                    {t("tenants.delete")}
                  </button>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
};

export const config = defineWidgetConfig({
  zone: "user.details.after",
});

export default TenantsWidget;
