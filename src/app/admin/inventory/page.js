"use client";
import { useEffect, useState } from "react";
import { Package, AlertTriangle, XCircle, Clock } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { useAdminStore } from "@/stores/useAdminStore";

const VIEWS = [
  { key: "all", label: "All Products", icon: Package, color: "blue" },
  { key: "low", label: "Low Stock", icon: AlertTriangle, color: "yellow" },
  { key: "out", label: "Out of Stock", icon: XCircle, color: "red" },
  { key: "expired", label: "Expired", icon: Clock, color: "red" },
  { key: "near", label: "Near Expiry", icon: Clock, color: "orange" },
];

export default function InventoryPage() {
  const [view, setView] = useState("all");
  const { inventory, inventoryLoading, fetchInventory } = useAdminStore();

  useEffect(() => {
    fetchInventory(view);
  }, [view, fetchInventory]);

  const { products = [], counts = {} } = inventory;

  function stockBadge(p) {
    if (p.stock <= 0) return { label: "Out of Stock", color: "red" };
    if (p.stock <= p.lowStockThreshold)
      return { label: `Low: ${p.stock} ${p.unit}`, color: "yellow" };
    return { label: `${p.stock} ${p.unit}`, color: "green" };
  }

  function expiryBadge(p) {
    if (!p.expiryDate) return null;
    const diff = Math.ceil(
      (new Date(p.expiryDate) - Date.now()) / (1000 * 60 * 60 * 24),
    );
    if (diff < 0) return { label: `Expired ${-diff}d ago`, color: "red" };
    if (diff < 30) return { label: `Expires in ${diff}d`, color: "orange" };
    return null;
  }

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle="Monitor stock levels and product expiry"
      />

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          ["Total", counts.total || 0, "blue"],
          ["In Stock", counts.inStock || 0, "green"],
          ["Low Stock", counts.lowStock || 0, "yellow"],
          ["Out of Stock", counts.outOfStock || 0, "red"],
          ["Expired", counts.expired || 0, "red"],
        ].map(([label, value, color]) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {label}
            </p>
            <p
              className={`mt-1 text-2xl font-bold ${color === "red" ? "text-red-600" : color === "yellow" ? "text-yellow-600" : color === "green" ? "text-green-600" : "text-slate-800"}`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* View tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${view === v.key ? "bg-primary-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-green-400"}`}
          >
            <v.icon size={14} /> {v.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          {inventoryLoading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-lg bg-slate-100"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
              <Package size={40} className="opacity-20" />
              <p className="text-sm">No products in this category</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  {[
                    "#",
                    "Product",
                    "Category",
                    "SKU",
                    "Stock",
                    "Threshold",
                    "Expiry",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 text-left"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => {
                  const sb = stockBadge(p);
                  const eb = expiryBadge(p);
                  return (
                    <tr
                      key={p._id}
                      className="border-b border-slate-50 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {p.images?.[0]?.url ? (
                            <img
                              src={p.images[0].url}
                              className="h-8 w-8 rounded-lg object-cover flex-shrink-0"
                              alt=""
                            />
                          ) : (
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                              <Package size={14} className="text-slate-300" />
                            </div>
                          )}
                          <span className="font-medium text-slate-800 truncate max-w-[160px]">
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {p.category?.name || "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">
                        {p.sku}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={sb.color}>{sb.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {p.lowStockThreshold} {p.unit}
                      </td>
                      <td className="px-4 py-3">
                        {eb ? (
                          <Badge variant={eb.color}>{eb.label}</Badge>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={p.status === "active" ? "green" : "slate"}
                        >
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
