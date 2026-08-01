"use client";
import { useEffect, useState } from "react";
import {
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { useAdminStore } from "@/stores/useAdminStore";
import ImageUpload from "@/components/ui/ImageUpload";

// ──  Add FAQs tab to the TABS array  ─────────────────────
const TABS = [
  "Store Info",
  "Social Links",
  "Shipping & Tax",
  "SEO",
  "CMS",
  "FAQs",
];

// ── Single FAQ row ─────────────────────────────────────────────────
function FaqRow({
  faq,
  index,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-50">
        <GripVertical size={14} className="text-slate-300 flex-shrink-0" />
        <span className="text-xs font-bold text-slate-400 w-5">
          #{index + 1}
        </span>
        <p className="flex-1 text-sm font-medium text-slate-700 truncate">
          {faq.question || (
            <span className="text-slate-400 italic">No question yet</span>
          )}
        </p>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1 text-slate-300 hover:text-slate-600 disabled:opacity-0"
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1 text-slate-300 hover:text-slate-600 disabled:opacity-0"
          >
            <ChevronDown size={14} />
          </button>
          <button
            onClick={() => setOpen((p) => !p)}
            className="p-1 text-slate-400 hover:text-slate-700"
          >
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-slate-300 hover:text-red-500"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {/* Body */}
      {open && (
        <div className="p-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Question *
            </label>
            <input
              value={faq.question || ""}
              onChange={(e) => onChange("question", e.target.value)}
              placeholder="e.g. What are your delivery hours?"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Answer *
            </label>
            <textarea
              value={faq.answer || ""}
              onChange={(e) => onChange("answer", e.target.value)}
              rows={3}
              placeholder="Detailed answer..."
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState("Store Info");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const { settings, settingsLoading, fetchSettings, updateSettings } =
    useAdminStore();
  const form = settings;

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
      useAdminStore.setState({ settings: update });
    };
  }

  // ── FAQ helpers ──────────────────────────────────────────────────
  function getFaqs() {
    return Array.isArray(form?.faqs) ? form.faqs : [];
  }

  function setFaqs(newFaqs) {
    useAdminStore.setState({ settings: { ...form, faqs: newFaqs } });
  }

  function addFaq() {
    setFaqs([...getFaqs(), { question: "", answer: "" }]);
  }

  function updateFaq(index, key, value) {
    const updated = getFaqs().map((f, i) =>
      i === index ? { ...f, [key]: value } : f,
    );
    setFaqs(updated);
  }

  function deleteFaq(index) {
    setFaqs(getFaqs().filter((_, i) => i !== index));
  }

  function moveFaq(index, dir) {
    const faqs = [...getFaqs()];
    const swapI = index + dir;
    if (swapI < 0 || swapI >= faqs.length) return;
    [faqs[index], faqs[swapI]] = [faqs[swapI], faqs[index]];
    setFaqs(faqs);
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

  const faqs = getFaqs();

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

          {/* ── Store Info ─────────────────────────────────────── */}
          {tab === "Store Info" && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
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
                  useAdminStore.setState({ settings: { ...form, logo: img } })
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
            </div>
          )}

          {/* ── Social Links ────────────────────────────────────── */}
          {tab === "Social Links" && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
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
            </div>
          )}

          {/* ── Shipping & Tax ──────────────────────────────────── */}
          {tab === "Shipping & Tax" && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
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
            </div>
          )}

          {/* ── SEO ─────────────────────────────────────────────── */}
          {tab === "SEO" && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
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
            </div>
          )}

          {/* ── CMS ─────────────────────────────────────────────── */}
          {tab === "CMS" && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
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
            </div>
          )}

          {/* ── FAQs ─────────────────────────────────────────────── */}
          {tab === "FAQs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4">
                <div>
                  <p className="font-semibold text-slate-800">
                    Frequently Asked Questions
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {faqs.length} FAQ{faqs.length !== 1 ? "s" : ""}
                    {/* • Displayedon the website's /faq page */}
                  </p>
                </div>
                <Button onClick={addFaq} size="sm">
                  <Plus size={14} /> Add FAQ
                </Button>
              </div>

              {faqs.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 py-14 text-center text-slate-400">
                  <p className="text-sm font-medium">No FAQs available yet</p>
                  <p className="text-xs">
                    Add frequently asked questions for your customers.
                  </p>
                  <Button onClick={addFaq} variant="outline" size="sm">
                    <Plus size={14} /> Add Your First FAQ
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {faqs.map((faq, i) => (
                    <FaqRow
                      key={i}
                      faq={faq}
                      index={i}
                      onChange={(key, val) => updateFaq(i, key, val)}
                      onDelete={() => deleteFaq(i)}
                      onMoveUp={() => moveFaq(i, -1)}
                      onMoveDown={() => moveFaq(i, +1)}
                      isFirst={i === 0}
                      isLast={i === faqs.length - 1}
                    />
                  ))}
                  <button
                    onClick={addFaq}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-3 text-sm font-medium text-slate-400 hover:border-primary-400 hover:text-primary-600 transition-colors"
                  >
                    <Plus size={15} /> Add Another FAQ
                  </button>
                </div>
              )}

              <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-xs text-blue-700">
                <p className="font-semibold mb-1">💡 Tips:</p>
                <ul className="space-y-0.5 list-disc list-inside">
                  <li>
                    Save your changes to publish FAQs on the <b>/faq</b> page.
                  </li>
                  <li>Use the ↑↓ arrows to reorder FAQs.</li>
                  <li>
                    Include common topics such as delivery time, return policy,
                    and payment methods.
                  </li>
                </ul>
              </div>
            </div>
          )}
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
