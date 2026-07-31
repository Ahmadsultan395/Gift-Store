"use client";
import { useEffect, useState } from "react";
import {
  Star,
  User,
  Eye,
  EyeOff,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/ui/PageHeader";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const TABS = [
  { key: "all", label: "All" },
  { key: "visible", label: "Live" },
  { key: "hidden", label: "Hidden" },
];

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const windowSize = 1;
  for (let p = 1; p <= totalPages; p++) {
    if (
      p === 1 ||
      p === totalPages ||
      (p >= page - windowSize && p <= page + windowSize)
    ) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="mt-6 flex items-center justify-center gap-1.5">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft size={15} />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-1 text-slate-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-semibold ${
              p === page
                ? "bg-primary-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [hiddenCount, setHiddenCount] = useState(0);
  const limit = 12;

  const [del, setDel] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchTestimonials();
  }, [debouncedSearch, status, page]);

  async function fetchTestimonials() {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      status,
    });
    if (debouncedSearch) params.set("search", debouncedSearch);

    try {
      const res = await fetch(`/api/admin/testimonials?${params}`, {
        cache: "no-store",
      });
      const json = await res.json();
      const data = json?.data || {};

      setTestimonials(
        Array.isArray(data.testimonials) ? data.testimonials : [],
      );
      setTotalPages(Number(data.totalPages) || 1);
      setTotal(Number(data.total) || 0);
      setVisibleCount(Number(data.visibleCount) || 0);
      setHiddenCount(Number(data.hiddenCount) || 0);
    } catch (err) {
      toast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  }

  async function toggleVisibility(id, current) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !current }),
      });
      if (!res.ok) throw new Error();

      setTestimonials((prev) =>
        prev.map((t) => (t._id === id ? { ...t, isVisible: !current } : t)),
      );
      setVisibleCount((v) => (current ? v - 1 : v + 1));
      setHiddenCount((h) => (current ? h + 1 : h - 1));

      toast.success(current ? "Review hidden" : "Review is now live");
    } catch (err) {
      toast.error("Failed to update visibility");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete() {
    if (!del) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/testimonials/${del._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();

      toast.success("Review deleted");
      setDel(null);
      fetchTestimonials();
    } catch (err) {
      toast.error("Failed to delete review");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Testimonials"
        subtitle="Manage customer reviews — show or hide them on the website."
      />

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-xl border border-slate-200 bg-white p-1">
          {TABS.map((tab) => {
            const count =
              tab.key === "all"
                ? total
                : tab.key === "visible"
                  ? visibleCount
                  : hiddenCount;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setStatus(tab.key);
                  setPage(1);
                }}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                  status === tab.key
                    ? "bg-primary-600 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or message..."
            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-xl bg-slate-200"
            />
          ))}
        </div>
      ) : testimonials.length === 0 ? (
        <p className="text-center text-sm text-slate-400 py-10">
          {debouncedSearch || status !== "all"
            ? "No testimonials match your search or filter."
            : "No testimonials submitted yet."}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t._id}
                className={`rounded-xl border p-4 shadow-sm ${
                  t.isVisible
                    ? "border-slate-200 bg-white"
                    : "border-slate-200 bg-slate-50 opacity-70"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {t.photo ? (
                      <img
                        src={t.photo}
                        alt={t.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <User size={18} />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-800">{t.name}</p>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={13}
                            className={
                              star <= t.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-200"
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      t.isVisible
                        ? "bg-primary-50 text-primary-700"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {t.isVisible ? "Live" : "Hidden"}
                  </span>
                </div>

                <p className="mt-3 line-clamp-3 text-sm text-slate-600">
                  {t.message}
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => toggleVisibility(t._id, t.isVisible)}
                    disabled={updatingId === t._id}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {t.isVisible ? (
                      <>
                        <EyeOff size={14} /> Hide
                      </>
                    ) : (
                      <>
                        <Eye size={14} /> Show
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setDel(t)}
                    className="flex items-center justify-center rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Delete testimonial?"
        message={`Delete "${del?.name}"'s review? This cannot be undone.`}
      />
    </div>
  );
}
