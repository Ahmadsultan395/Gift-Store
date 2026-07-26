"use client";
import { useEffect, useState } from "react";
import { ShoppingCart, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useAdminStore } from "@/stores/useAdminStore";

const STATUS_OPTS = [
  "",
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
];
const STATUS_COLOR = {
  pending: "yellow",
  confirmed: "blue",
  packed: "purple",
  shipped: "orange",
  delivered: "green",
  cancelled: "red",
};

export default function OrdersPage() {
  const {
    orders,
    ordersStats,
    ordersPagination,
    ordersLoading,
    fetchOrders,
    updateOrderStatus,
  } = useAdminStore();

  const [statusFilter, setSF] = useState("");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    const params = { page, limit: 20 };
    if (statusFilter) params.status = statusFilter;
    fetchOrders(params);
  }, [page, statusFilter, fetchOrders]);

  async function handleStatusChange(id, status) {
    setUpdating(true);
    try {
      await updateOrderStatus(id, { status });
      showToast(`Order status → ${status}`);
      if (viewing?._id === id) setViewing((v) => ({ ...v, status }));
    } catch (err) {
      showToast(err?.message || "Failed", "error");
    } finally {
      setUpdating(false);
    }
  }

  const stats = ordersStats || {};
  const pagination = ordersPagination || {};

  return (
    <div>
      <PageHeader title="Orders" subtitle="Website customer orders" />

      {/* Stats */}
      <div className="mb-5 grid grid-cols-3 gap-4 sm:grid-cols-6">
        {[
          ["Total", stats.total || 0, "slate"],
          ["Pending", stats.pending || 0, "yellow"],
          ["Confirmed", stats.confirmed || 0, "blue"],
          ["Shipped", stats.shipped || 0, "orange"],
          ["Delivered", stats.delivered || 0, "green"],
          ["Cancelled", stats.cancelled || 0, "red"],
        ].map(([l, v, c]) => (
          <button
            key={l}
            onClick={() => setSF(l === "Total" ? "" : l.toLowerCase())}
            className={`rounded-xl border p-3 text-left transition-all hover:shadow-sm ${statusFilter === (l === "Total" ? "" : l.toLowerCase()) ? "border-green-400 bg-green-50" : "border-slate-200 bg-white"}`}
          >
            <p className="text-xs text-slate-400">{l}</p>
            <p className="mt-0.5 text-xl font-bold text-slate-800">{v}</p>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          {ordersLoading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-lg bg-slate-100"
                />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
              <ShoppingCart size={48} className="opacity-20" />
              <p>No orders found.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  {[
                    "Order #",
                    "Customer",
                    "Date",
                    "Items",
                    "Total",
                    "Payment",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 ${h === "Actions" ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o._id}
                    className="border-b border-slate-50 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-medium">
                      {o.orderNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">
                        {o.shippingInfo?.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {o.shippingInfo?.phone}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString("en-PK")}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {o.items?.length}
                    </td>
                    <td className="px-4 py-3 font-semibold text-green-700">
                      PKR {o.grandTotal?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={o.paymentMethod === "cod" ? "yellow" : "green"}
                      >
                        {o.paymentMethod?.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_COLOR[o.status]}>{o.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <select
                          value={o.status}
                          onChange={(e) =>
                            handleStatusChange(o._id, e.target.value)
                          }
                          disabled={updating}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none"
                        >
                          {STATUS_OPTS.filter(Boolean).map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => setViewing(o)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
            <p className="text-xs text-slate-400">
              Page {page} of {pagination.pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border p-1.5 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.pages, p + 1))
                }
                disabled={page === pagination.pages}
                className="rounded-lg border p-1.5 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={`Order: ${viewing?.orderNumber}`}
        size="lg"
      >
        {viewing && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  SHIPPING INFO
                </p>
                <p className="font-medium">{viewing.shippingInfo?.name}</p>
                <p className="text-slate-500">{viewing.shippingInfo?.phone}</p>
                <p className="text-slate-500">
                  {viewing.shippingInfo?.address}, {viewing.shippingInfo?.city}
                </p>
                {viewing.shippingInfo?.notes && (
                  <p className="text-slate-400 text-xs mt-1">
                    Note: {viewing.shippingInfo.notes}
                  </p>
                )}
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  ORDER SUMMARY
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment</span>
                    <span className="font-medium uppercase">
                      {viewing.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status</span>
                    <Badge variant={STATUS_COLOR[viewing.status]}>
                      {viewing.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total</span>
                    <span className="font-bold text-green-700">
                      PKR {viewing.grandTotal?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">ITEMS</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-1 text-left">Product</th>
                    <th className="pb-1 text-right">Qty</th>
                    <th className="pb-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {viewing.items?.map((item, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="py-1.5">
                        {item.name || item.product?.name}
                      </td>
                      <td className="py-1.5 text-right text-slate-500">
                        {item.quantity}
                      </td>
                      <td className="py-1.5 text-right font-medium text-green-700">
                        PKR {item.total?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

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
