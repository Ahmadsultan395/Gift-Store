"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Receipt,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";

const PAY_COLOR = { paid: "green", partial: "yellow", unpaid: "red" };

export default function PurchasesPage() {
  const [data, setData] = useState({
    purchases: [],
    stats: {},
    pagination: {},
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [del, setDel] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [payModal, setPayModal] = useState(null); // { purchase }
  const [newPaid, setNewPaid] = useState("");
  const [payLoading, setPayLoading] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchData() {
    setLoading(true);
    const res = await fetch(`/api/admin/purchases?page=${page}&limit=20`);
    const json = await res.json();
    setData(json.data || {});
    setLoading(false);
  }
  useEffect(() => {
    fetchData();
  }, [page]);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/purchases/${del._id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) return showToast(json.message || "Failed", "error");
      showToast("Deleted");
      setDel(null);
      fetchData();
    } catch {
      showToast("Error", "error");
    } finally {
      setDeleting(false);
    }
  }

  async function handlePayment() {
    setPayLoading(true);
    try {
      const res = await fetch(`/api/admin/purchases/${payModal._id}/payment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountPaid: Number(newPaid) }),
      });
      const json = await res.json();
      if (!json.success) return showToast(json.message || "Failed", "error");
      showToast("Payment updated!");
      setPayModal(null);
      setNewPaid("");
      fetchData();
    } catch {
      showToast("Error", "error");
    } finally {
      setPayLoading(false);
    }
  }

  function openPayment(p) {
    setPayModal(p);
    setNewPaid(p.amountPaid || 0);
  }

  const { purchases = [], stats = {}, pagination = {} } = data;

  const totalPurchase = purchases.reduce(
    (sum, p) => sum + (p.grandTotal || 0),
    0,
  );

  const totalPaid = purchases.reduce((sum, p) => sum + (p.amountPaid || 0), 0);

  const totalDue = totalPurchase - totalPaid;

  const totalItems = purchases.reduce(
    (sum, p) => sum + (p.items?.length || 0),
    0,
  );

  return (
    <div>
      <PageHeader
        title="Purchases"
        subtitle="Purchase bills & stock-in history"
        action={
          <Link href="/admin/purchases/add">
            <Button>
              <Plus size={16} /> New Purchase Bill
            </Button>
          </Link>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-5">
        {[
          {
            label: "Total Bills",
            value: pagination.total || 0,
          },

          {
            label: "Total Purchase",
            value: `PKR ${totalPurchase.toLocaleString()}`,
          },

          {
            label: "Paid Amount",
            value: `PKR ${totalPaid.toLocaleString()}`,
          },

          {
            label: "Remaining Due",
            value: `PKR ${totalDue.toLocaleString()}`,
          },

          {
            label: "Items Purchased",
            value: totalItems,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              {s.label}
            </p>

            <p className="mt-1 text-xl font-bold text-slate-800">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-lg bg-slate-100"
                />
              ))}
            </div>
          ) : purchases.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
              <Receipt size={48} className="opacity-20" />
              <p>No purchases yet.</p>
              <Link href="/admin/purchases/add">
                <Button size="sm">
                  <Plus size={14} /> Create First Bill
                </Button>
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  {[
                    "Invoice",
                    "Supplier",
                    "Date",
                    "Items",
                    "Total",
                    "Paid",
                    "Balance",
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
                {purchases.map((p) => {
                  const balance = (p.grandTotal || 0) - (p.amountPaid || 0);
                  return (
                    <tr
                      key={p._id}
                      className="border-b border-slate-50 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-mono text-xs font-medium text-slate-700">
                        {p.invoiceNumber}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">
                          {p.supplier?.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {p.supplier?.phone}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {new Date(p.purchaseDate).toLocaleDateString("en-PK")}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {p.items?.length} items
                      </td>
                      <td className="px-4 py-3 font-semibold text-primary-700">
                        PKR {(p.grandTotal || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        PKR {(p.amountPaid || 0).toLocaleString()}
                      </td>
                      <td
                        className={`px-4 py-3 font-semibold ${balance > 0 ? "text-red-600" : "text-green-600"}`}
                      >
                        {balance > 0
                          ? `PKR ${balance.toLocaleString()}`
                          : "✅ Paid"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={PAY_COLOR[p.paymentStatus]}>
                          {p.paymentStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {p.paymentStatus !== "paid" && (
                            <button
                              onClick={() => openPayment(p)}
                              title="Add Payment"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-green-50 hover:text-green-600"
                            >
                              <CreditCard size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => setDel(p)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-primary-50 hover:text-red-600"
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
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-primary-100 px-5 py-3">
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

      {/* Payment Modal */}
      <Modal
        open={!!payModal}
        onClose={() => {
          setPayModal(null);
          setNewPaid("");
        }}
        title="Update Payment"
        size="sm"
      >
        {payModal && (
          <div className="space-y-4">
            <div className="rounded-xl bg-primary-50 p-4 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice</span>
                <span className="font-mono font-medium">
                  {payModal.invoiceNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Grand Total</span>
                <span className="font-semibold text-primary-700">
                  PKR {payModal.grandTotal?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Previously Paid</span>
                <span>PKR {(payModal.amountPaid || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5 font-semibold text-red-600">
                <span>Balance Due</span>
                <span>
                  PKR{" "}
                  {(
                    (payModal.grandTotal || 0) - (payModal.amountPaid || 0)
                  ).toLocaleString()}
                </span>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Total Amount Paid (PKR)
              </label>
              <input
                type="number"
                value={newPaid}
                onChange={(e) => setNewPaid(e.target.value)}
                max={payModal.grandTotal}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-100"
              />
              <p className="mt-1 text-xs text-slate-400">
                Enter total cumulative amount paid (not just this installment)
              </p>
            </div>
            {newPaid > 0 && (
              <div className="rounded-lg bg-green-50 px-3 py-2 text-sm">
                <p className="text-primary-700 font-medium">
                  Remaining after this: PKR{" "}
                  {Math.max(
                    0,
                    (payModal.grandTotal || 0) - Number(newPaid),
                  ).toLocaleString()}
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setPayModal(null);
                  setNewPaid("");
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handlePayment}
                isLoading={payLoading}
              >
                <CreditCard size={15} /> Update Payment
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Delete Purchase?"
        message={`Delete "${del?.invoiceNumber}"?`}
      />
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 rounded-xl px-5 py-3 text-sm font-medium text-white shadow-lg ${toast.type === "error" ? "bg-red-600" : "bg-primary"}`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
