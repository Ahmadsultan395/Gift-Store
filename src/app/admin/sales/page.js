"use client";
import { useEffect, useState } from "react";
import {
  Receipt,
  ChevronLeft,
  ChevronRight,
  Eye,
  CreditCard,
  RotateCcw,
  CheckCircle,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

const PAY_COLOR = { paid: "green", partial: "yellow", unpaid: "red" };

export default function SalesHistoryPage() {
  const [data, setData] = useState({ sales: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusF, setStatusF] = useState("");
  const [viewing, setViewing] = useState(null);
  const [payModal, setPayModal] = useState(null);
  const [refModal, setRefModal] = useState(null);
  const [newPay, setNewPay] = useState("");
  const [payMethod, setPayMethod] = useState("cash");
  const [refAmount, setRefAmount] = useState("");
  const [refReason, setRefReason] = useState("");
  const [restoreStk, setRestoreSt] = useState(true);
  const [actLoading, setActLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function fetchData() {
    setLoading(true);
    const p = new URLSearchParams({
      page,
      limit: 20,
    });

    if (statusF) p.set("status", statusF);

    if (search.trim()) {
      p.set("search", search.trim());
    }
    const res = await fetch(`/api/admin/pos?${p}`);
    const json = await res.json();
    setData(json.data || {});
    setLoading(false);
  }
  useEffect(() => {
    setPage(1);
  }, [statusF, search]);
  useEffect(() => {
    const timer = setTimeout(fetchData, 400);
    return () => clearTimeout(timer);
  }, [page, statusF, search]);

  // Add payment
  async function handleAddPayment() {
    if (!newPay || Number(newPay) <= 0)
      return showToast("Please enter a valid amount.", "error");
    setActLoading(true);
    try {
      const res = await fetch(`/api/admin/sales/${payModal._id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(newPay), method: payMethod }),
      });
      const data = await res.json();
      if (!data.success) return showToast(data.message || "Failed", "error");
      showToast(`Payment of PKR ${newPay} recorded successfully!`);
      setPayModal(null);
      setNewPay("");
      fetchData();
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setActLoading(false);
    }
  }

  // Process refund
  async function handleRefund() {
    if (!refAmount || Number(refAmount) <= 0)
      showToast("Please enter a refund amount.", "error");
    setActLoading(true);
    try {
      const res = await fetch(`/api/admin/sales/${refModal._id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(refAmount),
          reason: refReason || "Customer return",
          restoreStock: restoreStk,
        }),
      });
      const data = await res.json();
      if (!data.success) return showToast(data.message || "Failed", "error");
      showToast(
        `Refund of PKR ${refAmount} processed successfully! ${
          restoreStk ? "Stock has been restored." : ""
        }`,
      );
      setRefModal(null);
      setRefAmount("");
      setRefReason("");
      fetchData();
    } catch {
      showToast("Error", "error");
    } finally {
      setActLoading(false);
    }
  }

  const { sales = [], pagination = {} } = data;

  return (
    <div>
      <PageHeader title="Sales History" subtitle="All POS Transactions" />

      {/* Filter tabs */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by invoice, customer..."
          className="w-full md:w-80 rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-green-500"
        />

        <div className="flex gap-2">
          {[
            ["", "All"],
            ["paid", "Paid"],
            ["partial", "Partial"],
            ["unpaid", "Unpaid"],
          ].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setStatusF(v)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                statusF === v
                  ? "bg-primary-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-green-400"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
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
          ) : sales.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
              <Receipt size={48} className="opacity-20" />
              <p>No sales found.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  {[
                    "Invoice",
                    "Customer",
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
                {sales.map((s) => (
                  <tr
                    key={s._id}
                    className={`border-b border-slate-50 hover:bg-slate-50 ${s.isRefunded || ((s.refundedAmount || 0) >= (s.amountPaid || 0) && (s.amountPaid || 0) > 0) ? "opacity-60 bg-red-50" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-medium text-slate-700">
                        {s.invoiceNumber}
                      </p>
                      {(() => {
                        const fullyRefunded =
                          s.isRefunded ||
                          ((s.refundedAmount || 0) >= (s.amountPaid || 0) &&
                            (s.amountPaid || 0) > 0);
                        const partialRefund =
                          !fullyRefunded && (s.refundedAmount || 0) > 0;
                        return fullyRefunded ? (
                          <span className="text-[9px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full">
                            ✕ REFUNDED
                          </span>
                        ) : partialRefund ? (
                          <span className="text-[9px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-full">
                            ↩ Refunded: PKR {(s.refundedAmount || 0).toFixed(0)}
                          </span>
                        ) : null;
                      })()}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {s.customer?.name || (
                        <span className="text-slate-300">Walk-in</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                      {new Date(s.saleDate).toLocaleString("en-PK", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {s.items?.length} items
                    </td>
                    <td className="px-4 py-3 font-semibold text-green-700">
                      PKR {s.grandTotal?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      PKR {s.amountPaid?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      {s.balanceDue > 0 ? (
                        <span className="font-semibold text-red-600">
                          PKR {s.balanceDue?.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-green-600 text-xs">✅ Paid</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={PAY_COLOR[s.paymentStatus]}>
                        {s.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewing(s)}
                          title="View Detail"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye size={14} />
                        </button>
                        {!s.isRefunded && s.paymentStatus !== "paid" && (
                          <button
                            onClick={() => {
                              setPayModal(s);
                              setNewPay("");
                            }}
                            title="Add Payment"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-green-50 hover:text-green-600"
                          >
                            <CreditCard size={14} />
                          </button>
                        )}
                        {!s.isRefunded &&
                          (s.amountPaid || 0) > 0 &&
                          (s.amountPaid || 0) - (s.refundedAmount || 0) > 0 && (
                            <button
                              onClick={() => {
                                setRefModal(s);
                                setRefAmount(
                                  Math.max(
                                    0,
                                    (s.amountPaid || 0) -
                                      (s.refundedAmount || 0),
                                  ).toFixed(2),
                                );
                                setRefReason("Customer return");
                                setRestoreSt(true);
                              }}
                              title="Refund"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            >
                              <RotateCcw size={14} />
                            </button>
                          )}
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
              Page {page} of {pagination.pages} • {pagination.total} total
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

      {/* ── Sale Detail Modal ─────────────────────────────────────── */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={`Invoice: ${viewing?.invoiceNumber}`}
        size="md"
      >
        {viewing && (
          <div className="space-y-4 text-sm">
            {(viewing.isRefunded || (viewing.refundedAmount || 0) > 0) && (
              <div
                className={`rounded-xl border px-4 py-3 ${viewing.isRefunded || (viewing.refundedAmount || 0) >= (viewing.amountPaid || 0) ? "bg-red-50 border-red-200 text-red-700" : "bg-orange-50 border-orange-200 text-orange-700"}`}
              >
                <p className="font-bold">
                  {viewing.isRefunded ||
                  (viewing.refundedAmount || 0) >= (viewing.amountPaid || 0)
                    ? "✕ Fully Refunded"
                    : "↩ Partial Refund"}
                </p>
                <p className="text-xs mt-0.5">
                  PKR {(viewing.refundedAmount || 0).toFixed(2)} refunded
                  {viewing.refund?.reason ? ` — ${viewing.refund.reason}` : ""}
                  {viewing.refund?.refundedAt
                    ? ` on ${new Date(viewing.refund.refundedAt).toLocaleDateString("en-PK")}`
                    : ""}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Customer", viewing.customer?.name || "Walk-in"],
                ["Cashier", viewing.cashier?.name || "—"],
                ["Date", new Date(viewing.saleDate).toLocaleString("en-PK")],
                ["Method", viewing.paymentMethod],
              ].map(([l, v]) => (
                <div key={l} className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">{l}</p>
                  <p className="font-medium text-slate-700">{v}</p>
                </div>
              ))}
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="pb-1 text-left">Item</th>
                  <th className="pb-1 text-right">Qty</th>
                  <th className="pb-1 text-right">Price</th>
                  <th className="pb-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {viewing.items?.map((item, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="py-1.5 text-slate-700">{item.name}</td>
                    <td className="py-1.5 text-right">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-1.5 text-right">
                      PKR {item.price?.toFixed(2)}
                    </td>
                    <td className="py-1.5 text-right font-medium text-green-700">
                      PKR {item.total?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="space-y-1 border-t border-slate-100 pt-3 text-xs">
              <div className="flex justify-between font-bold text-sm">
                <span>Grand Total</span>
                <span className="text-green-700">
                  PKR {viewing.grandTotal?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Amount Paid</span>
                <span>PKR {viewing.amountPaid?.toFixed(2)}</span>
              </div>
              {viewing.balanceDue > 0 && (
                <div className="flex justify-between font-bold text-red-600">
                  <span>Balance Due</span>
                  <span>PKR {viewing.balanceDue?.toFixed(2)}</span>
                </div>
              )}
            </div>
            {/* Payment history */}
            {viewing.paymentHistory?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">
                  Payment History
                </p>
                <div className="space-y-1.5">
                  {viewing.paymentHistory.map((ph, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle size={12} className="text-green-600" />
                        <span className="font-medium text-green-700">
                          PKR {ph.amount?.toFixed(2)}
                        </span>
                        <span className="text-green-500 capitalize">
                          ({ph.method})
                        </span>
                      </div>
                      <span className="text-slate-400">
                        {new Date(ph.paidAt).toLocaleDateString("en-PK")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ── Add Payment Modal ─────────────────────────────────────── */}
      <Modal
        open={!!payModal}
        onClose={() => {
          setPayModal(null);
          setNewPay("");
        }}
        title="Add Payment"
        size="sm"
      >
        {payModal && (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-4 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice</span>
                <span className="font-mono font-medium">
                  {payModal.invoiceNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total</span>
                <span className="font-semibold text-green-700">
                  PKR {payModal.grandTotal?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Paid So Far</span>
                <span>PKR {payModal.amountPaid?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-1.5 font-bold text-red-600">
                <span>Balance Due</span>
                <span>PKR {payModal.balanceDue?.toFixed(2)}</span>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Payment Amount (PKR) *
              </label>
              <input
                type="number"
                value={newPay}
                onChange={(e) => setNewPay(e.target.value)}
                max={Math.max(
                  0,
                  (payModal.grandTotal || 0) - (payModal.amountPaid || 0),
                )}
                placeholder={`Remaining Balance: PKR ${((payModal.grandTotal || 0) - (payModal.amountPaid || 0)).toFixed(2)}`}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-bold outline-none focus:border-green-500"
              />
            </div>
            <div className="flex gap-2">
              {["cash", "card", "bank_transfer"].map((m) => (
                <button
                  key={m}
                  onClick={() => setPayMethod(m)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-medium capitalize ${payMethod === m ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600"}`}
                >
                  {m.replace("_", " ")}
                </button>
              ))}
            </div>
            {newPay > 0 && (
              <div className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">
                {Number(newPay) >
                (payModal.grandTotal || 0) - (payModal.amountPaid || 0) ? (
                  <span className="text-red-600 font-bold">
                    ⚠ Maximum payable amount{" "}
                    {(
                      (payModal.grandTotal || 0) - (payModal.amountPaid || 0)
                    ).toFixed(2)}{" "}
                  </span>
                ) : (
                  <span>
                    Remaining balance after this payment:: PKR{" "}
                    {Math.max(
                      0,
                      (payModal.grandTotal || 0) -
                        (payModal.amountPaid || 0) -
                        Number(newPay),
                    ).toFixed(2)}
                  </span>
                )}
              </div>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setPayModal(null)}
                disabled={actLoading}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleAddPayment}
                isLoading={actLoading}
              >
                <CreditCard size={14} /> Add Payment
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Refund Modal ──────────────────────────────────────────── */}
      <Modal
        open={!!refModal}
        onClose={() => setRefModal(null)}
        title="Process Refund"
        size="sm"
      >
        {refModal && (
          <div className="space-y-4">
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice</span>
                <span className="font-mono">{refModal.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Grand Total</span>
                <span className="font-semibold">
                  PKR {refModal.grandTotal?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid</span>
                <span className="font-bold text-green-700">
                  PKR {refModal.amountPaid?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Already Refunded</span>
                <span className="text-red-500">
                  PKR {(refModal.refundedAmount || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-1.5 font-bold text-red-700">
                <span>Max Refundable</span>
                <span>
                  PKR{" "}
                  {Math.max(
                    0,
                    (refModal.amountPaid || 0) - (refModal.refundedAmount || 0),
                  ).toFixed(2)}
                </span>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Refund Amount (PKR) *
              </label>
              <input
                type="number"
                value={refAmount}
                onChange={(e) => setRefAmount(e.target.value)}
                max={Math.max(
                  0,
                  (refModal.amountPaid || 0) - (refModal.refundedAmount || 0),
                )}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-bold outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Reason
              </label>
              <input
                value={refReason}
                onChange={(e) => setRefReason(e.target.value)}
                placeholder="e.g. Customer return, damaged product..."
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-500"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={restoreStk}
                onChange={(e) => setRestoreSt(e.target.checked)}
                className="h-4 w-4 accent-green-600"
              />
              <span className="text-sm text-slate-700">
                Restore stock (returned items will be added back to inventory)
              </span>
            </label>
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
              ⚠ This refund will automatically be recorded as an Expense. This
              action cannot be undone.
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setRefModal(null)}
                disabled={actLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleRefund}
                isLoading={actLoading}
              >
                <RotateCcw size={14} /> Process Refund
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 rounded-xl px-5 py-3 text-sm font-medium text-white shadow-lg max-w-sm ${toast.type === "error" ? "bg-red-600" : "bg-primary-600"}`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
