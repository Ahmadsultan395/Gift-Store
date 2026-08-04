"use client";
import { useEffect, useState } from "react";
import {
  Star, User, Check, X, Trash2,
  Search, ChevronLeft, ChevronRight,
} from "lucide-react";
import PageHeader    from "@/components/ui/PageHeader";
import Badge         from "@/components/ui/Badge";
import Modal         from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const TABS = [
  { key:"all",      label:"All"      },
  { key:"pending",  label:"Pending"  },
  { key:"approved", label:"Approved" },
  { key:"rejected", label:"Rejected" },
];

function StarRow({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={13}
          className={s <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}/>
      ))}
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= page-1 && p <= page+1)) pages.push(p);
    else if (pages[pages.length-1] !== "...") pages.push("...");
  }
  return (
    <div className="mt-6 flex items-center justify-center gap-1.5">
      <button onClick={() => onChange(Math.max(1,page-1))} disabled={page===1}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40">
        <ChevronLeft size={15}/>
      </button>
      {pages.map((p,i) => p==="..." ? (
        <span key={`d${i}`} className="px-1 text-slate-400">…</span>
      ) : (
        <button key={p} onClick={() => onChange(p)}
          className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-semibold ${p===page ? "bg-primary-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
          {p}
        </button>
      ))}
      <button onClick={() => onChange(Math.min(totalPages,page+1))} disabled={page===totalPages}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40">
        <ChevronRight size={15}/>
      </button>
    </div>
  );
}

export default function AdminTestimonialsPage() {
  const [data,       setData]       = useState({ testimonials:[], pendingCount:0, approvedCount:0, rejectedCount:0, totalPages:1, total:0 });
  const [loading,    setLoading]    = useState(true);
  const [status,     setStatus]     = useState("all");
  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState("");
  const [debSearch,  setDebSearch]  = useState("");
  const [acting,     setActing]     = useState(null); // id being approved/rejected
  const [del,        setDel]        = useState(null);
  const [deleting,   setDeleting]   = useState(false);
  const [viewing,    setViewing]    = useState(null);
  const [rejectNote, setRejectNote] = useState("");
  const [toast,      setToast]      = useState(null);

  function showToast(msg, type="success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [status]);
  useEffect(() => { fetchData(); }, [page, status, debSearch]);

  async function fetchData() {
    setLoading(true);
    const p = new URLSearchParams({ page, limit:12, status });
    if (debSearch) p.set("search", debSearch);
    try {
      const res  = await fetch(`/api/admin/testimonials?${p}`, { cache:"no-store" });
      const json = await res.json();
      setData(json.data || {});
    } catch { showToast("Failed to load", "error"); }
    finally { setLoading(false); }
  }

  async function handleAction(id, newStatus, note="") {
    setActing(id);
    try {
      const res  = await fetch(`/api/admin/testimonials/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: newStatus, adminNote: note }),
      });
      const json = await res.json();
      if (!json.success) return showToast(json.message || "Failed", "error");
      showToast(`Testimonial ${newStatus}`);
      setViewing(null); setRejectNote("");
      fetchData();
    } catch { showToast("Error", "error"); }
    finally { setActing(null); }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/admin/testimonials/${del._id}`, { method:"DELETE" });
      showToast("Testimonial deleted");
      setDel(null); fetchData();
    } catch { showToast("Error", "error"); }
    finally { setDeleting(false); }
  }

  const { testimonials=[], pendingCount=0, approvedCount=0, rejectedCount=0, total=0, totalPages=1 } = data;

  const tabCounts = { all: total, pending: pendingCount, approved: approvedCount, rejected: rejectedCount };

  return (
    <div>
      <PageHeader title="Testimonials" subtitle="Manage customer testimonials — approve, reject or delete."/>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setStatus(tab.key)}
            className={`rounded-xl border p-3 text-left transition-all hover:shadow-sm ${status===tab.key ? "border-primary-400 bg-primary-50" : "border-slate-200 bg-white"}`}>
            <p className="text-xs font-medium uppercase text-slate-400">{tab.label}</p>
            <p className="mt-0.5 text-2xl font-bold text-slate-800">{tabCounts[tab.key] ?? 0}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 max-w-xs">
        <Search size={15} className="text-slate-400"/>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or message..."
          className="flex-1 bg-transparent text-sm outline-none"/>
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 animate-pulse rounded-xl bg-slate-100"/>)}
        </div>
      ) : testimonials.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-400">
          {debSearch || status !== "all" ? "No testimonials match your filters." : "No testimonials yet."}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map(t => (
              <div key={t._id}
                className={`flex flex-col justify-between rounded-xl border p-4 shadow-sm transition-all ${
                  t.status==="approved" ? "border-green-200 bg-green-50/30"  :
                  t.status==="rejected" ? "border-red-100 bg-red-50/20 opacity-70" :
                  "border-slate-200 bg-white"
                }`}>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {t.photo ? (
                      <img src={t.photo} alt={t.name} className="h-10 w-10 rounded-full object-cover flex-shrink-0"/>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 flex-shrink-0">
                        <User size={18}/>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{t.name}</p>
                      <StarRow rating={t.rating}/>
                    </div>
                  </div>
                  <Badge variant={t.status==="approved"?"green":t.status==="rejected"?"red":"yellow"}>
                    {t.status}
                  </Badge>
                </div>

                {/* Message */}
                <p className="mt-3 line-clamp-3 text-sm text-slate-600 leading-relaxed">"{t.message}"</p>

                {/* Date */}
                <p className="mt-2 text-xs text-slate-400">
                  {new Date(t.createdAt).toLocaleDateString("en-PK",{ day:"numeric", month:"short", year:"numeric" })}
                </p>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2">
                  {t.status !== "approved" && (
                    <button onClick={() => handleAction(t._id, "approved")}
                      disabled={acting === t._id}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-600 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors">
                      <Check size={13}/> Approve
                    </button>
                  )}
                  {t.status !== "rejected" && (
                    <button onClick={() => { setViewing(t); setRejectNote(""); }}
                      disabled={acting === t._id}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors">
                      <X size={13}/> Reject
                    </button>
                  )}
                  {t.status === "approved" && (
                    <button onClick={() => handleAction(t._id, "rejected")}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors">
                      Hide
                    </button>
                  )}
                  <button onClick={() => setDel(t)}
                    className="flex items-center justify-center rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage}/>
        </>
      )}

      {/* Reject reason modal */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Reject Testimonial" size="sm">
        {viewing && (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-800">{viewing.name}</p>
              <StarRow rating={viewing.rating}/>
              <p className="mt-2 text-sm text-slate-600">"{viewing.message}"</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Reason (optional)</label>
              <input value={rejectNote} onChange={e => setRejectNote(e.target.value)}
                placeholder="Let the customer know why..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400"/>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setViewing(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={() => handleAction(viewing._id, "rejected", rejectNote)}
                disabled={!!acting}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50">
                <X size={14}/> Reject
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!del} onClose={() => setDel(null)} onConfirm={handleDelete} isLoading={deleting}
        title="Delete Testimonial?" message={`Delete "${del?.name}"'s testimonial? This cannot be undone.`}/>

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 rounded-xl px-5 py-3 text-sm font-medium text-white shadow-lg ${toast.type==="error"?"bg-red-600":"bg-primary-600"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
