"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Package,
  Pencil,
  Trash2,
  AlertTriangle,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useAdminStore } from "@/stores/useAdminStore";

const STATUS_BADGE = {
  active: "green",
  inactive: "slate",
  draft: "yellow",
};

const STOCK_BADGE = {
  in_stock: { label: "In Stock", color: "green" },
  low_stock: { label: "Low Stock", color: "yellow" },
  out_of_stock: { label: "Out of Stock", color: "red" },
};

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    brand: "",
    status: "",
    stock: "",
  });
  const [page, setPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const {
    products,
    fetchProducts,
    productsPagination,
    productsLoading,

    categories,
    fetchCategories,

    brands,
    fetchBrands,

    removeProduct,
  } = useAdminStore();

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // Load dropdowns
  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchProducts({
      page,
      limit: 20,
      search,
      ...filters,
    });
  }, [page, search, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounce search
  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  async function handleDelete() {
    setDeleting(true);

    try {
      await removeProduct(deleteTarget._id);

      showToast("Product deleted");

      setDeleteTarget(null);
    } catch {
      showToast("Something went wrong", "error");
    } finally {
      setDeleting(false);
    }
  }

  const pagination = productsPagination;

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${pagination.total ?? 0} products`}
        action={
          <Link href="/admin/products/add">
            <Button>
              <Plus size={16} /> Add Product
            </Button>
          </Link>
        }
      />

      {/* Search + Filter bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="text-slate-400 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, SKU, barcode..."
            className="flex-1 text-sm outline-none text-slate-600 min-w-0"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilter((p) => !p)}
        >
          <Filter size={14} /> Filters {showFilter ? "▲" : "▼"}
        </Button>
      </div>

      {/* Filters panel */}
      {showFilter && (
        <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => {
                setFilters((p) => ({ ...p, category: e.target.value }));
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Brand
            </label>
            <select
              value={filters.brand}
              onChange={(e) => {
                setFilters((p) => ({ ...p, brand: e.target.value }));
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none"
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters((p) => ({ ...p, status: e.target.value }));
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Stock
            </label>
            <select
              value={filters.stock}
              onChange={(e) => {
                setFilters((p) => ({ ...p, stock: e.target.value }));
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none"
            >
              <option value="">All Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          {productsLoading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-lg bg-slate-100"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
              <Package size={48} className="opacity-20" />
              <p className="text-sm font-medium">No products found</p>
              <Link href="/admin/products/add">
                <Button size="sm">
                  <Plus size={14} /> Add your first product
                </Button>
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  {[
                    "#",
                    "Product",
                    "SKU",
                    "Category",
                    "Stock",
                    "Purchase",
                    "Selling",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap ${h === "Actions" ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => {
                  const availability =
                    p.stock <= 0
                      ? "out_of_stock"
                      : p.stock <= p.lowStockThreshold
                        ? "low_stock"
                        : "in_stock";
                  const stockBadge = STOCK_BADGE[availability];
                  return (
                    <tr
                      key={p._id}
                      className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {(page - 1) * 20 + i + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.images?.[0] ? (
                            <img
                              src={p.images[0].url}
                              alt={p.name}
                              className="h-10 w-10 rounded-lg object-cover border border-slate-100 flex-shrink-0"
                            />
                          ) : (
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                              <Package size={16} className="text-slate-300" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate max-w-[180px]">
                              {p.name}
                            </p>
                            {p.brand && (
                              <p className="text-xs text-slate-400">
                                {p.brand.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">
                        {p.sku}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {p.category?.name || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <Badge variant={stockBadge.color}>
                            {stockBadge.label}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {p.stock} {p.unit}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        PKR {(p.purchasePrice || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-semibold text-primary-700 whitespace-nowrap">
                        PKR {(p.sellingPrice || 0).toLocaleString()}
                        {p.discountPercent > 0 && (
                          <span className="ml-1 text-[10px] font-normal text-red-500">
                            -{p.discountPercent}%
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_BADGE[p.status]}>
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/products/${p._id}/view`}>
                            <button className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                              <Eye size={15} />
                            </button>
                          </Link>
                          <Link href={`/admin/products/${p._id}/edit`}>
                            <button className="rounded-lg p-1.5 text-slate-400 hover:bg-green-50 hover:text-green-600 transition-colors">
                              <Pencil size={15} />
                            </button>
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
            <p className="text-xs text-slate-400">
              Showing {(page - 1) * 20 + 1}–
              {Math.min(page * 20, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.pages, p + 1))
                }
                disabled={page === pagination.pages}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Delete Product?"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
      />

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
