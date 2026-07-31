"use client";
import { useEffect, useState } from "react";
import {
  Star,
  Check,
  X,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Search,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

function StarRow({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
          }
        />
      ))}
    </div>
  );
}

export default function ReviewsAdminPage() {
  const [data, setData] = useState({ reviews: [], stats: {}, pagination: {} });
  const [loading, setLoading] = useState(true);
  const [statusF, setStatusF] = useState("pending");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState(null);
  const [del, setDel] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [acting, setActing] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchData() {
    setLoading(true);

    const p = new URLSearchParams({
      page,
      limit: 20,
    });

    if (statusF) p.set("status", statusF);
    if (search.trim()) p.set("search", search);

    const res = await fetch(`/api/admin/reviews?${p}`);
    const json = await res.json();

    setData(json.data || {});
    setLoading(false);
  }

  useEffect(() => {
    setPage(1);
  }, [statusF, search]);

  useEffect(() => {
    fetchData();
  }, [page, statusF, search]);

  async function handleAction(id, status, note = "") {
    setActing(true);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote: note }),
      });
      const json = await res.json();
      if (!json.success) return showToast(json.message || "Failed", "error");
      showToast(`Review ${status}!`);
      setViewing(null);
      setRejectNote("");
      fetchData();
    } catch {
      showToast("Error", "error");
    } finally {
      setActing(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/admin/reviews/${del._id}`, { method: "DELETE" });
      showToast("Review delete ho gaya");
      setDel(null);
      fetchData();
    } catch {
      showToast("Error", "error");
    } finally {
      setDeleting(false);
    }
  }

  const { reviews = [], stats = {}, pagination = {} } = data;

  return (
    <div>
      <PageHeader
        title="Reviews"
        subtitle="Manage customer product reviews and control their approval status."
      />

      {/* Stats */}
      <div className="mb-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          ["Pending", stats.pending || 0, "yellow"],
          ["Approved", stats.approved || 0, "green"],
          ["Rejected", stats.rejected || 0, "red"],
        ].map(([l, v, c]) => (
          <button
            key={l}
            onClick={() => setStatusF(l.toLowerCase())}
            className={`rounded-xl border p-4 text-left transition-all hover:shadow-sm ${statusF === l.toLowerCase() ? "border-primary-400 bg-primary-50" : "border-slate-200 bg-white"}`}
          >
            <p className="text-xs font-medium uppercase text-slate-400">{l}</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{v}</p>
          </button>
        ))}
      </div>

      <div className="mb-5 max-w-sm">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product or customer..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-lg bg-slate-100"
                />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
              <MessageSquare size={48} className="opacity-20" />
              <p>No review found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  {[
                    "Product",
                    "Customer",
                    "Rating",
                    "Review",
                    "Date",
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
                {reviews.map((r) => (
                  <tr
                    key={r._id}
                    className="border-b border-slate-50 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {r.product?.images?.[0]?.url ? (
                          <img
                            src={r.product.images[0].url}
                            className="h-8 w-8 rounded-lg object-cover flex-shrink-0"
                            alt=""
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-lg bg-slate-100 flex-shrink-0" />
                        )}
                        <span className="text-xs font-medium text-slate-700 line-clamp-2 max-w-[120px]">
                          {r.product?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {r.customer?.name || "Unknown"}
                    </td>
                    <td className="px-4 py-3">
                      <StarRow rating={r.rating} />
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      {r.title && (
                        <p className="text-xs font-semibold text-slate-700 truncate">
                          {r.title}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 truncate">
                        {r.comment || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          r.status === "approved"
                            ? "green"
                            : r.status === "rejected"
                              ? "red"
                              : "yellow"
                        }
                      >
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setViewing(r)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye size={15} />
                        </button>
                        {r.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleAction(r._id, "approved")}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-primary-50 hover:text-primary-600"
                            >
                              <Check size={15} />
                            </button>
                            <button
                              onClick={() => {
                                setViewing(r);
                              }}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            >
                              <X size={15} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setDel(r)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={15} />
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

      {/* Review Detail + Action Modal */}
      <Modal
        open={!!viewing}
        onClose={() => {
          setViewing(null);
          setRejectNote("");
        }}
        title="Review Detail"
        size="sm"
      >
        {viewing && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
              {viewing.product?.images?.[0]?.url ? (
                <img
                  src={viewing.product.images[0].url}
                  className="h-12 w-12 rounded-xl object-cover flex-shrink-0"
                  alt=""
                />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-slate-200 flex-shrink-0" />
              )}
              <div>
                <p className="font-semibold text-slate-800">
                  {viewing.product?.name}
                </p>
                <p className="text-xs text-slate-500">
                  {viewing.customer?.name}
                </p>
                <StarRow rating={viewing.rating} size={16} />
              </div>
            </div>
            {viewing.title && (
              <p className="font-semibold text-slate-800">{viewing.title}</p>
            )}
            {viewing.comment && (
              <p className="text-sm text-slate-600 leading-relaxed">
                {viewing.comment}
              </p>
            )}
            <p className="text-xs text-slate-400">
              {new Date(viewing.createdAt).toLocaleString("en-PK")}
            </p>

            {viewing.status === "pending" && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Rejection Note (optional)
                  </label>
                  <input
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="Reason for rejection..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-red-400"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      handleAction(viewing._id, "rejected", rejectNote)
                    }
                    disabled={acting}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border-2 border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                  >
                    <X size={15} /> Reject
                  </button>
                  <button
                    onClick={() => handleAction(viewing._id, "approved")}
                    disabled={acting}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary-600 py-2.5 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-50"
                  >
                    <Check size={15} /> Approve
                  </button>
                </div>
              </>
            )}

            {viewing.status === "rejected" && viewing.adminNote && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                <p className="font-semibold">Rejection Note:</p>
                <p>{viewing.adminNote}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Delete Review?"
        message={`Are you sure you want to delete ${del?.customer?.name}'s review?`}
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
