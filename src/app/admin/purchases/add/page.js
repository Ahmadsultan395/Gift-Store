"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Receipt } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

const EMPTY_ITEM = {
  product: "",
  quantity: 1,
  purchasePrice: 0,
  tax: 0,
  discount: 0,
  total: 0,
};

function calcItemTotal(item) {
  return (
    item.quantity * item.purchasePrice + (item.tax || 0) - (item.discount || 0)
  );
}

export default function AddPurchasePage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [form, setForm] = useState({
    supplier: "",
    invoiceNumber: `INV-${Date.now()}`,
    tax: 0,
    discount: 0,
    amountPaid: 0,
    purchaseDate: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/admin/suppliers")
      .then((r) => r.json())
      .then((d) =>
        setSuppliers(
          (d.data || []).map((s) => ({
            value: s._id,
            label: `${s.name} (${s.phone})`,
          })),
        ),
      );
    fetch("/api/admin/products?limit=500&status=active")
      .then((r) => r.json())
      .then((d) =>
        setProducts(
          (d.data?.products || []).map((p) => ({
            value: p._id,
            label: `${p.name} [${p.sku}]`,
            price: p.purchasePrice || 0,
          })),
        ),
      );
  }, []);

  function setField(k) {
    return (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  }

  function updateItem(i, k, v) {
    setItems((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [k]: v };
      // Auto-fill price when product changes
      if (k === "product") {
        const found = products.find((p) => p.value === v);
        if (found) next[i].purchasePrice = found.price;
      }
      next[i].total = calcItemTotal(next[i]);
      return next;
    });
  }

  function addItem() {
    setItems((p) => [...p, { ...EMPTY_ITEM }]);
  }
  function removeItem(i) {
    setItems((p) => p.filter((_, idx) => idx !== i));
  }

  const subTotal = items.reduce((s, it) => s + it.total, 0);
  const grandTotal =
    subTotal + Number(form.tax || 0) - Number(form.discount || 0);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.supplier) return setError("Select a supplier");
    if (!items[0].product) return setError("Add at least one product");

    setSaving(true);
    try {
      const res = await fetch("/api/admin/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items,
          tax: Number(form.tax || 0),
          discount: Number(form.discount || 0),
          amountPaid: Number(form.amountPaid || 0),
        }),
      });
      const data = await res.json();
      if (!data.success) return setError(data.message || "Failed");
      setSuccess(
        `✅ Purchase bill created! Stock updated for ${items.length} product(s).`,
      );
      setTimeout(() => router.push("/admin/purchases"), 2000);
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Create Purchase Bill"
        subtitle="Stock will automatically increase after saving"
      />

      <form onSubmit={handleSubmit} className="space-y-5 max-w-5xl">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Header fields */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-600 uppercase tracking-wide">
            Bill Information
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Select
              label="Supplier *"
              value={form.supplier}
              onChange={setField("supplier")}
              options={suppliers}
              placeholder="Select supplier"
              className="sm:col-span-2"
            />
            <Input
              label="Invoice Number *"
              value={form.invoiceNumber}
              onChange={setField("invoiceNumber")}
            />
            <Input
              label="Purchase Date"
              type="date"
              value={form.purchaseDate}
              onChange={setField("purchaseDate")}
            />
          </div>
        </div>

        {/* Line items */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Products
            </h2>
            <Button type="button" size="sm" onClick={addItem}>
              <Plus size={14} /> Add Row
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400">
                  <th className="pb-2 text-left pr-3 min-w-[200px]">Product</th>
                  <th className="pb-2 text-left pr-3 w-20">Qty</th>
                  <th className="pb-2 text-left pr-3 w-28">Price (PKR)</th>
                  <th className="pb-2 text-left pr-3 w-24">Tax</th>
                  <th className="pb-2 text-left pr-3 w-24">Discount</th>
                  <th className="pb-2 text-right w-28">Total</th>
                  <th className="pb-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2 pr-3">
                      <select
                        value={item.product}
                        onChange={(e) =>
                          updateItem(i, "product", e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-green-600"
                      >
                        <option value="">Select product</option>
                        {products.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(i, "quantity", Number(e.target.value))
                        }
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        min="0"
                        value={item.purchasePrice}
                        onChange={(e) =>
                          updateItem(i, "purchasePrice", Number(e.target.value))
                        }
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        min="0"
                        value={item.tax}
                        onChange={(e) =>
                          updateItem(i, "tax", Number(e.target.value))
                        }
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        min="0"
                        value={item.discount}
                        onChange={(e) =>
                          updateItem(i, "discount", Number(e.target.value))
                        }
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none"
                      />
                    </td>
                    <td className="py-2 text-right font-semibold text-green-700">
                      PKR {item.total.toLocaleString()}
                    </td>
                    <td className="py-2 pl-2">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(i)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals + Notes */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Notes
            </h2>
            <textarea
              value={form.notes}
              onChange={setField("notes")}
              rows={4}
              placeholder="Any notes for this purchase..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-600 resize-none"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Payment Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Sub Total</span>
                <span>PKR {subTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-500">Tax (PKR)</span>
                <input
                  type="number"
                  value={form.tax}
                  onChange={setField("tax")}
                  className="w-28 rounded-lg border border-slate-200 px-2 py-1 text-right text-sm outline-none"
                />
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-500">Discount (PKR)</span>
                <input
                  type="number"
                  value={form.discount}
                  onChange={setField("discount")}
                  className="w-28 rounded-lg border border-slate-200 px-2 py-1 text-right text-sm outline-none"
                />
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-base">
                <span>Grand Total</span>
                <span className="text-green-700">
                  PKR {grandTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2 mt-2">
                <span className="text-slate-500">Amount Paid</span>
                <input
                  type="number"
                  value={form.amountPaid}
                  onChange={setField("amountPaid")}
                  className="w-28 rounded-lg border border-slate-200 px-2 py-1 text-right text-sm outline-none"
                />
              </div>
              <div className="flex justify-between text-red-600 font-medium">
                <span>Balance Due</span>
                <span>
                  PKR{" "}
                  {Math.max(0, grandTotal - form.amountPaid).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/purchases")}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={saving}>
            <Receipt size={16} /> Save Purchase Bill
          </Button>
        </div>
      </form>
    </div>
  );
}
