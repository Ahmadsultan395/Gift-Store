"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Package, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import ImageUpload from "@/components/ui/ImageUpload";

const UNITS = ["pcs", "kg", "g", "litre", "ml", "dozen", "bag", "box"].map(
  (u) => ({ value: u, label: u }),
);
const STATUSES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "draft", label: "Draft" },
];

export default function ProductForm({ product, onSave }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tag, setTag] = useState("");

  const [form, setForm] = useState({
    name: "",
    sku: "",
    barcode: "",
    category: "",
    brand: "",
    description: "",
    shortDescription: "",
    purchasePrice: "",
    sellingPrice: "",
    oldPrice: "",
    discountPrice: "",
    stock: "",
    unit: "pcs",
    weight: "",
    lowStockThreshold: "5",
    expiryDate: "",
    status: "active",
    isFeatured: false,
    isNewArrival: false,
    isFlashSale: false,
    tags: [],
    images: [],
    seo: { metaTitle: "", metaDescription: "" },
  });

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) =>
        setCategories(
          (d.data || []).map((c) => ({ value: c._id, label: c.name })),
        ),
      );
    fetch("/api/admin/brands")
      .then((r) => r.json())
      .then((d) =>
        setBrands((d.data || []).map((b) => ({ value: b._id, label: b.name }))),
      );
  }, []);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        sku: product.sku || "",
        barcode: product.barcode || "",
        category: product.category?._id || product.category || "",
        brand: product.brand?._id || product.brand || "",
        description: product.description || "",
        shortDescription: product.shortDescription || "",
        purchasePrice: product.purchasePrice || "",
        sellingPrice: product.sellingPrice || "",
        oldPrice: product.oldPrice || "",
        discountPrice: product.discountPrice || "",
        stock: product.stock || "",
        unit: product.unit || "pcs",
        weight: product.weight || "",
        lowStockThreshold: product.lowStockThreshold || 5,
        expiryDate: product.expiryDate ? product.expiryDate.split("T")[0] : "",
        status: product.status || "active",
        isFeatured: product.isFeatured || false,
        isNewArrival: product.isNewArrival || false,
        isFlashSale: product.isFlashSale || false,
        tags: product.tags || [],
        images: product.images || [],
        seo: product.seo || { metaTitle: "", metaDescription: "" },
      });
    }
  }, [product]);

  function set(k) {
    return (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  }
  function setCheck(k) {
    return (e) => setForm((p) => ({ ...p, [k]: e.target.checked }));
  }
  function setSeo(k) {
    return (e) =>
      setForm((p) => ({ ...p, seo: { ...p.seo, [k]: e.target.value } }));
  }

  function addTag() {
    if (tag.trim() && !form.tags.includes(tag.trim())) {
      setForm((p) => ({ ...p, tags: [...p.tags, tag.trim()] }));
      setTag("");
    }
  }
  function removeTag(t) {
    setForm((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) }));
  }

  // Image handlers
  function addImage(img) {
    if (!img?.url) return;
    setForm((p) => ({
      ...p,
      images: [...p.images, { url: img.url, publicId: img.publicId || "" }],
    }));
  }
  function removeImage(idx) {
    setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.category || !form.sku || !form.sellingPrice) {
      return setError("Name, Category, SKU and Selling Price are required.");
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        purchasePrice: parseFloat(form.purchasePrice) || 0,
        sellingPrice: parseFloat(form.sellingPrice) || 0,
        oldPrice: parseFloat(form.oldPrice) || 0,
        discountPrice: parseFloat(form.discountPrice) || 0,
        stock: parseInt(form.stock) || 0,
        lowStockThreshold: parseInt(form.lowStockThreshold) || 5,
        brand: form.brand || undefined,
      };
      const url = product
        ? `/api/admin/products/${product._id}`
        : "/api/admin/products";
      const method = product ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) return setError(data.message || "Failed to save");
      if (onSave) onSave(data.data);
      else router.push("/admin/products");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Product Images */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Product Images
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-4">
          {form.images.map((img, i) => (
            <div key={i} className="relative group">
              <div className="aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <img
                  src={img.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              {i === 0 && (
                <span className="absolute top-1 left-1 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-white">
                  MAIN
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
        <ImageUpload
          label={`Add Image ${form.images.length > 0 ? `(${form.images.length} added)` : ""}`}
          folder="pansar-store/products"
          onChange={addImage}
          aspect="square"
        />
        <p className="mt-1 text-xs text-slate-400">
          First image will be the main product image. Add multiple images.
        </p>
      </div>

      {/* Basic Info */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Product Name *"
            value={form.name}
            onChange={set("name")}
            placeholder="e.g. Shan Biryani Masala"
            className="sm:col-span-2"
          />
          <Input
            label="SKU *"
            value={form.sku}
            onChange={set("sku")}
            placeholder="e.g. SBM-200G"
          />
          <Input
            label="Barcode"
            value={form.barcode}
            onChange={set("barcode")}
            placeholder="Scan or type barcode"
          />
          <Select
            label="Category *"
            value={form.category}
            onChange={set("category")}
            options={categories}
            placeholder="Select category"
          />
          <Select
            label="Brand"
            value={form.brand}
            onChange={set("brand")}
            options={brands}
            placeholder="Select brand (optional)"
          />
          <Textarea
            label="Short Description"
            value={form.shortDescription}
            onChange={set("shortDescription")}
            placeholder="Brief description..."
            rows={2}
            className="sm:col-span-2"
          />
          <Textarea
            label="Full Description"
            value={form.description}
            onChange={set("description")}
            placeholder="Detailed product description..."
            rows={4}
            className="sm:col-span-2"
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Pricing
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Input
            label="Purchase Price (PKR)"
            type="number"
            value={form.purchasePrice}
            onChange={set("purchasePrice")}
            placeholder="0"
          />
          <Input
            label="Selling Price (PKR) *"
            type="number"
            value={form.sellingPrice}
            onChange={set("sellingPrice")}
            placeholder="0"
          />
          <Input
            label="Old Price (PKR)"
            type="number"
            value={form.oldPrice}
            onChange={set("oldPrice")}
            placeholder="For strikethrough"
          />
          <Input
            label="Discount Price (PKR)"
            type="number"
            value={form.discountPrice}
            onChange={set("discountPrice")}
            placeholder="Final offer price"
          />
        </div>
      </div>

      {/* Stock */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Stock & Details
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Input
            disabled={true}
            label="Stock Quantity *"
            type="number"
            value={form.stock}
            onChange={set("stock")}
            placeholder="0"
          />
          <Select
            label="Unit"
            value={form.unit}
            onChange={set("unit")}
            options={UNITS}
          />
          <Input
            label="Weight"
            value={form.weight}
            onChange={set("weight")}
            placeholder="e.g. 200g"
          />
          <Input
            label="Low Stock Alert"
            type="number"
            value={form.lowStockThreshold}
            onChange={set("lowStockThreshold")}
            placeholder="5"
          />
          <Input
            label="Expiry Date"
            type="date"
            value={form.expiryDate}
            onChange={set("expiryDate")}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={set("status")}
            options={STATUSES}
          />
        </div>
      </div>

      {/* Tags */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Tags
        </h2>
        <div className="flex gap-2 mb-3">
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Type a tag and press Enter"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-600"
          />
          <Button type="button" onClick={addTag} variant="outline" size="sm">
            <Plus size={14} />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.tags.map((t) => (
            <span
              key={t}
              className="flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700"
            >
              {t}
              <button type="button" onClick={() => removeTag(t)}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Flags */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Product Flags
        </h2>
        <div className="flex flex-wrap gap-6">
          {[
            ["isFeatured", "⭐ Featured Product"],
            ["isNewArrival", "🆕 New Arrival"],
            ["isFlashSale", "⚡ Flash Sale"],
          ].map(([k, lbl]) => (
            <label key={k} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form[k]}
                onChange={setCheck(k)}
                className="h-4 w-4 rounded accent-primary-600"
              />
              <span className="text-sm font-medium text-slate-700">{lbl}</span>
            </label>
          ))}
        </div>
      </div>

      {/* SEO */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-700 uppercase tracking-wide">
          SEO Settings
        </h2>
        <div className="space-y-3">
          <Input
            label="Meta Title"
            value={form.seo.metaTitle}
            onChange={setSeo("metaTitle")}
            placeholder="Page title for search engines"
          />
          <Textarea
            label="Meta Description"
            value={form.seo.metaDescription}
            onChange={setSeo("metaDescription")}
            placeholder="Brief description for search results..."
            rows={2}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pb-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={saving}>
          <Package size={16} /> {product ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
