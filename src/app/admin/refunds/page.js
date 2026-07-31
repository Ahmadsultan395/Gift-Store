"use client";

import { useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { useAdminStore } from "@/stores/useAdminStore";

export default function RefundsPage() {
  const [type, setType] = useState("all");

  const {
    sales,
    salesLoading,
    fetchSales,
    orders,
    ordersLoading,
    fetchOrders,
  } = useAdminStore();

  useEffect(() => {
    fetchSales?.({ page: 1, limit: 500 });
    fetchOrders?.({ page: 1, limit: 500 });
  }, [fetchSales, fetchOrders]);

  const refundedSales = useMemo(
    () => (sales || []).filter((s) => (s.refundedAmount || 0) > 0),
    [sales],
  );

  const refundedOrders = useMemo(
    () =>
      (orders || []).filter(
        (o) => o.paymentStatus === "refunded" || o.status === "refunded",
      ),
    [orders],
  );

  const merged = useMemo(() => {
    const list = [
      ...(type !== "order"
        ? refundedSales.map((s) => ({
            type: "sale",
            _id: s._id,
            number: s.invoiceNumber,
            customerName: s.customer?.name || "Walk-in",
            grandTotal: s.grandTotal || 0,
            refundedAmount: s.refundedAmount || 0,
            refundStatus: s.paymentStatus === "refunded" ? "full" : "partial",
            reason: s.refundReason || "—",
            refundedAt: s.refundedAt || s.updatedAt,
          }))
        : []),

      ...(type !== "sale"
        ? refundedOrders.map((o) => ({
            type: "order",
            _id: o._id,
            number: o.orderNumber,

            customerName: o.shippingInfo?.name || o.customer?.name || "—",

            grandTotal: o.grandTotal || 0,

            // current order schema me full refund hai
            refundedAmount: o.grandTotal || 0,

            refundStatus: "full",

            reason: "Customer Return",

            refundedAt: o.updatedAt,
          }))
        : []),
    ];

    return list.sort(
      (a, b) => new Date(b.refundedAt || 0) - new Date(a.refundedAt || 0),
    );
  }, [type, refundedSales, refundedOrders]);

  const totalRefundedSalesAmount = refundedSales.reduce(
    (sum, s) => sum + (s.refundedAmount || 0),
    0,
  );

  const totalRefundedOrdersAmount = refundedOrders.reduce(
    (sum, o) => sum + (o.grandTotal || 0),
    0,
  );

  const loading = salesLoading || ordersLoading;

  return (
    <div>
      <PageHeader
        title="Refunds"
        subtitle="Refunded sales & orders — combined history"
      />

      {/* Summary */}
      <div className="mb-5 grid grid-cols-1  min-[450px]:grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-400">
            Refunded Sales Amount
          </p>
          <p className="mt-1 text-xl font-bold text-red-600">
            PKR {totalRefundedSalesAmount.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-400">
            Refunded Sales Count
          </p>
          <p className="mt-1 text-xl font-bold">{refundedSales.length}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-400">
            Refunded Orders Amount
          </p>
          <p className="mt-1 text-xl font-bold text-red-600">
            PKR {totalRefundedOrdersAmount.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-400">
            Refunded Orders Count
          </p>
          <p className="mt-1 text-xl font-bold">{refundedOrders.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          ["all", "All"],
          ["sale", "Sales Only"],
          ["order", "Orders Only"],
        ].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setType(v)}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              type === v
                ? "bg-primary-600 text-white"
                : "border bg-white text-slate-600"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-lg bg-slate-200"
                />
              ))}
            </div>
          ) : merged.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
              <RotateCcw size={48} className="opacity-20" />
              <p>No refunds found.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  {[
                    "Type",
                    "Number",
                    "Customer",
                    "Grand Total",
                    "Refunded",
                    "Status",
                    "Reason",
                    "Date",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs uppercase text-slate-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {merged.map((r) => (
                  <tr
                    key={`${r.type}-${r._id}`}
                    className="border-b hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <Badge variant={r.type === "sale" ? "blue" : "purple"}>
                        {r.type}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 font-mono text-xs">{r.number}</td>

                    <td className="px-4 py-3">{r.customerName}</td>

                    <td className="px-4 py-3 font-semibold">
                      PKR {r.grandTotal.toLocaleString()}
                    </td>

                    <td className="px-4 py-3 font-semibold text-red-600">
                      PKR {r.refundedAmount.toLocaleString()}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant="red">Fully Refunded</Badge>
                    </td>

                    <td className="px-4 py-3 text-slate-500">{r.reason}</td>

                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(r.refundedAt).toLocaleDateString("en-PK")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
