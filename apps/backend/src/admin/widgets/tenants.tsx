/** @format */

import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { useState, useEffect } from "react";

type Tenant = {
  id: string;
  subdomain: string;
  store_name: string;
  headline: string | null;
  tagline: string | null;
  logo_text: string | null;
  publishable_api_key: string;
  region_id: string | null;
  default_locale: string;
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
  const [form, setForm] = useState<Partial<Tenant>>(tenant);

  const update = (field: keyof Tenant, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="rounded-2xl border border-ui-border-base bg-ui-bg-base p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
          <span className="text-base font-semibold">T</span>
        </div>
        <div>
          <p className="text-base font-semibold text-ui-fg-base">Tenant Configuration</p>
          <p className="text-xs text-ui-fg-subtle">Configure storefront settings and branding</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {(
          [
            ["subdomain", "Subdomain", "e.g. store1"],
            ["store_name", "Store Name", "e.g. My Store"],
            ["headline", "Headline", "Hero headline shown on storefront"],
            ["tagline", "Tagline", "Subtitle under the headline"],
            ["logo_text", "Logo Text", "Text shown in the nav bar"],
            ["publishable_api_key", "Publishable API Key", "pk_..."],
            ["region_id", "Region ID", "Optional: defaults to first region"],
            ["default_locale", "Default Locale", "en or he"],
          ] as [keyof Tenant, string, string][]
        ).map(([field, label, placeholder]) => (
          <div key={field} className="flex flex-col gap-1.5">
            <label className="text-ui-fg-base text-xs font-semibold uppercase tracking-wide">{label}</label>
            <input
              className="h-10 rounded-xl border border-ui-border-base bg-ui-bg-field px-3 text-sm text-ui-fg-base transition-colors focus:border-ui-border-interactive focus:outline-none focus:ring-2 focus:ring-ui-border-interactive/20"
              value={(form[field] as string) ?? ""}
              placeholder={placeholder}
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
          Save Changes
        </button>
        <button
          className="inline-flex h-10 items-center rounded-xl border border-ui-border-base px-4 text-sm font-medium text-ui-fg-subtle transition-all hover:bg-ui-bg-subtle hover:text-ui-fg-base"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const TenantsWidget = () => {
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
      setError("Failed to load tenants");
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
    if (!confirm("Delete this tenant?")) return;
    await fetch(`/admin/tenants/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-ui-fg-base">Tenants</h2>
          <p className="text-sm text-ui-fg-subtle">Manage storefront tenants and branding metadata.</p>
        </div>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
          onClick={() => setCreating(true)}
        >
          <span aria-hidden="true" className="text-lg">
            +
          </span>{" "}
          New Tenant
        </button>
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
          No tenants yet.
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
                  <p className="text-xs text-ui-fg-muted mt-1">Locale: {tenant.default_locale}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                    onClick={() => setEditingId(tenant.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => handleDelete(tenant.id)}
                  >
                    Delete
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
