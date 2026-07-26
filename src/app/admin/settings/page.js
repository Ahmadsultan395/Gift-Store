"use client";
import { useEffect, useState } from "react";
import { Save, Settings as SettingsIcon } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { useAdminStore } from "@/stores/useAdminStore";
import ImageUpload from "@/components/ui/ImageUpload";

const TABS = ["Store Info", "Social Links", "Shipping & Tax", "SEO", "CMS"];

export default function SettingsPage() {
  const [tab, setTab] = useState("Store Info");
  const { settings, settingsLoading, fetchSettings, updateSettings } =
    useAdminStore();
  const form = settings;
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  function set(path) {
    return (e) => {
      const keys = path.split(".");

      const update = structuredClone(form || {});

      if (keys.length === 1) {
        update[keys[0]] = e.target.value;
      } else if (keys.length === 2) {
        update[keys[0]] = {
          ...(update[keys[0]] || {}),
          [keys[1]]: e.target.value,
        };
      }

      // temporary local update approach
      useAdminStore.setState({
        settings: update,
      });
    };
  }

  async function save() {
    setSaving(true);

    try {
      await updateSettings(form);
      showToast("Settings saved!");
    } catch (err) {
      showToast(err.message || "Error", "error");
    } finally {
      setSaving(false);
    }
  }

  if (settingsLoading || !form)
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Configure your store"
        action={
          <Button onClick={save} isLoading={saving}>
            <Save size={15} /> Save Settings
          </Button>
        }
      />

      <div className="flex gap-6">
        {/* Tab nav */}
        <nav className="hidden w-48 flex-shrink-0 sm:block">
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex w-full px-4 py-3 text-sm font-medium text-left transition-colors border-b border-slate-100 last:border-0 ${tab === t ? "bg-primary-50 text-primary-600" : "text-slate-600 hover:bg-slate-50"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </nav>

        <div className="flex-1 max-w-2xl">
          {/* Mobile tab select */}
          <select
            value={tab}
            onChange={(e) => setTab(e.target.value)}
            className="mb-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none sm:hidden"
          >
            {TABS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
            {tab === "Store Info" && (
              <>
                <Input
                  label="Store Name"
                  value={form.storeName || ""}
                  onChange={set("storeName")}
                  placeholder="Pansar Store"
                />
                <ImageUpload
                  label="Store Logo"
                  value={form.logo}
                  onChange={(img) =>
                    useAdminStore.setState({
                      settings: {
                        ...form,
                        logo: img,
                      },
                    })
                  }
                  folder="pansar-store/settings"
                  aspect="logo"
                />
                <Input
                  label="Phone"
                  value={form.phone || ""}
                  onChange={set("phone")}
                  placeholder="0300-0000000"
                />
                <Input
                  label="Email"
                  value={form.email || ""}
                  onChange={set("email")}
                  placeholder="store@email.com"
                />
                <Textarea
                  label="Address"
                  value={form.address || ""}
                  onChange={set("address")}
                  placeholder="Full store address"
                  rows={2}
                />
                {/* <Input
                  label="Currency"
                  value={form.currency || "PKR"}
                  onChange={set("currency")}
                  placeholder="PKR"
                /> */}
                {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Primary Color
                    </label>

                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={form.themeColors?.primary || "#0F4C39"}
                        onChange={set("themeColors.primary")}
                        className="h-11 w-16 cursor-pointer rounded-lg border border-slate-300"
                      />

                      <Input
                        value={form.themeColors?.primary || ""}
                        onChange={set("themeColors.primary")}
                        placeholder="#0F4C39"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Secondary Color
                    </label>

                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={form.themeColors?.secondary || "#0f172a"}
                        onChange={set("themeColors.secondary")}
                        className="h-11 w-16 cursor-pointer rounded-lg border border-slate-300"
                      />

                      <Input
                        value={form.themeColors?.secondary || ""}
                        onChange={set("themeColors.secondary")}
                        placeholder="#0f172a"
                      />
                    </div>
                  </div>
                </div> */}
              </>
            )}

            {tab === "Social Links" && (
              <>
                {[
                  ["Facebook", "socialLinks.facebook"],
                  ["Instagram", "socialLinks.instagram"],
                  ["WhatsApp", "socialLinks.whatsapp"],
                  ["YouTube", "socialLinks.youtube"],
                ].map(([l, k]) => (
                  <Input
                    key={k}
                    label={l}
                    value={k.split(".").reduce((o, i) => o?.[i], form) || ""}
                    onChange={set(k)}
                    placeholder={`https://${l.toLowerCase()}.com/...`}
                  />
                ))}
              </>
            )}

            {tab === "Shipping & Tax" && (
              <>
                <Input
                  label="Shipping Charges (PKR)"
                  type="number"
                  value={form.shippingCharges || 0}
                  onChange={set("shippingCharges")}
                  placeholder="150"
                />
                <Input
                  label="Tax Percentage (%)"
                  type="number"
                  value={form.taxPercent || 0}
                  onChange={set("taxPercent")}
                  placeholder="0"
                />
              </>
            )}

            {tab === "SEO" && (
              <>
                <Input
                  label="Meta Title"
                  value={form.seo?.metaTitle || ""}
                  onChange={set("seo.metaTitle")}
                  placeholder="Store title for Google"
                />
                <Textarea
                  label="Meta Description"
                  value={form.seo?.metaDescription || ""}
                  onChange={set("seo.metaDescription")}
                  rows={3}
                  placeholder="Brief description for search engines"
                />
                <Input
                  label="Meta Keywords"
                  value={form.seo?.metaKeywords || ""}
                  onChange={set("seo.metaKeywords")}
                  placeholder="pansar, grocery, spices"
                />
              </>
            )}

            {tab === "CMS" && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Announcement Bar
                  </label>
                  <Input
                    value={form.cms?.announcement || ""}
                    onChange={set("cms.announcement")}
                    placeholder="🎉 Free delivery on orders above PKR 2000!"
                  />
                </div>
                <Textarea
                  label="About Page Content"
                  value={form.cms?.aboutPage || ""}
                  onChange={set("cms.aboutPage")}
                  rows={4}
                  placeholder="About your store..."
                />
                <Textarea
                  label="Privacy Policy"
                  value={form.cms?.privacyPolicy || ""}
                  onChange={set("cms.privacyPolicy")}
                  rows={4}
                  placeholder="Privacy policy content..."
                />
                <Textarea
                  label="Terms & Conditions"
                  value={form.cms?.termsConditions || ""}
                  onChange={set("cms.termsConditions")}
                  rows={4}
                  placeholder="Terms content..."
                />
                <Textarea
                  label="Return Policy"
                  value={form.cms?.returnPolicy || ""}
                  onChange={set("cms.returnPolicy")}
                  rows={4}
                  placeholder="Return policy content..."
                />
              </>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 rounded-xl px-5 py-3 text-sm font-medium text-white shadow-lg ${toast.type === "error" ? "bg-red-600" : "bg-primary-600"}`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
