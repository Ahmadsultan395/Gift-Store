"use client";
import { useEffect, useState } from "react";
import {
  Star, Quote, User, ChevronLeft, ChevronRight,
  PenSquare, X, Edit2,
} from "lucide-react";
import TestimonialForm from "./TestimonialForm";
import { useWebsiteStore } from "@/stores/useWebsiteStore";

// ── Helpers (unchanged from original) ─────────────────────────────
function Avatar({ t, size = 12, featured = false }) {
  const px = size * 4;
  return (
    <div className={`rounded-full p-[2px] transition-transform duration-300 ${featured ? "bg-gradient-to-br from-primary-400 to-teal-500" : "bg-slate-200"}`}>
      {t.photo ? (
        <img src={t.photo} alt={t.name} style={{ width:px, height:px }}
          className="rounded-full border-2 border-white object-cover"/>
      ) : (
        <div style={{ width:px, height:px }}
          className="flex items-center justify-center rounded-full border-2 border-white bg-white text-slate-400">
          <User size={px / 2}/>
        </div>
      )}
    </div>
  );
}

function StarRow({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(star => (
        <Star key={star} size={size}
          className={`transition-transform duration-200 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}/>
      ))}
    </div>
  );
}

function FeaturedCard({ t, onClick, visible }) {
  return (
    <div onClick={() => onClick(t)}
      className={`group relative col-span-1 row-span-2 flex cursor-pointer flex-col justify-between overflow-hidden rounded-[28px] border border-primary-200/70 bg-gradient-to-br from-primary-50/70 to-white p-8 shadow-lg shadow-primary-100/60 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-primary-300 hover:shadow-2xl hover:shadow-primary-200/70 sm:col-span-2 ${visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-6 scale-[0.97] opacity-0"}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary-400 via-teal-400 to-primary-500 opacity-70 transition-opacity duration-300 group-hover:opacity-100"/>
      <Quote className="pointer-events-none absolute -right-4 -top-4 text-primary-100 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" size={140} strokeWidth={1} fill="currentColor"/>
      <div className="pointer-events-none absolute inset-0 z-10 flex scale-95 items-center justify-center bg-primary-600/20 opacity-0 backdrop-blur-[1px] transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
        <span className="rounded-full bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-lg">Click to view the comment</span>
      </div>
      <div className="relative">
        <StarRow rating={t.rating} size={16}/>
        <p className="mt-5 text-xl font-medium leading-relaxed text-slate-800 transition-colors duration-200 line-clamp-4 group-hover:text-primary-700 sm:text-2xl">"{t.message}"</p>
      </div>
      <div className="relative mt-8 flex items-center gap-3">
        <div className="transition-transform duration-300 group-hover:scale-105"><Avatar t={t} size={14} featured/></div>
        <div>
          <p className="font-semibold text-slate-900">{t.name}</p>
          <p className="text-xs text-slate-400">Verified Customer</p>
        </div>
      </div>
    </div>
  );
}

function CompactCard({ t, onClick, visible, delay = 0 }) {
  return (
    <div onClick={() => onClick(t)}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      className={`group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-[24px] border border-slate-200 bg-gradient-to-br from-white to-primary-50/30 p-5 shadow-md shadow-slate-200/70 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-primary-300 hover:shadow-xl hover:shadow-primary-200/60 ${visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-6 scale-[0.97] opacity-0"}`}>
      <div className="pointer-events-none absolute inset-0 z-10 flex scale-95 items-center justify-center bg-primary-600/20 opacity-0 backdrop-blur-[1px] transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
        <span className="rounded-full bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-lg">Click to view the comment</span>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-400 to-teal-500 opacity-40 transition-opacity duration-300 group-hover:opacity-100"/>
      <div>
        <div className="flex items-center justify-between">
          <div className="transition-transform duration-300 group-hover:scale-105"><Avatar t={t} size={10}/></div>
          <StarRow rating={t.rating} size={13}/>
        </div>
        <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate-600 transition-colors duration-200 group-hover:text-primary-700">"{t.message}"</p>
      </div>
      <p className="mt-4 text-xs font-semibold text-slate-800">{t.name}</p>
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) pages.push(p);
    else if (pages[pages.length - 1] !== "...") pages.push("...");
  }
  return (
    <div className="mt-10 flex items-center justify-center gap-1.5">
      <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:border-primary-300 hover:text-primary-600 hover:shadow-sm disabled:pointer-events-none disabled:opacity-40">
        <ChevronLeft size={16}/>
      </button>
      {pages.map((p, i) =>
        p === "..." ? <span key={`dots-${i}`} className="px-1 text-slate-400">…</span> : (
          <button key={p} onClick={() => onChange(p)}
            className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-semibold transition-all duration-200 ${p === page ? "scale-105 bg-primary-600 text-white shadow-md shadow-primary-200" : "border border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:text-primary-600"}`}>
            {p}
          </button>
        )
      )}
      <button onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
        className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-all duration-200 hover:border-primary-300 hover:text-primary-600 hover:shadow-sm disabled:pointer-events-none disabled:opacity-40">
        Next <ChevronRight size={16}/>
      </button>
    </div>
  );
}

function ReviewModal({ existing, onClose, onSubmitted }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => setVisible(true));
    function handleEsc(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", handleEsc);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", handleEsc); cancelAnimationFrame(raf); };
  }, [onClose]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`} onClick={onClose}>
      <div className={`max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300 ease-out ${visible ? "scale-100 opacity-100" : "scale-95 opacity-0"}`} onClick={e => e.stopPropagation()}>
        <TestimonialForm existing={existing} onSuccess={onSubmitted} onClose={onClose}/>
      </div>
    </div>
  );
}

function DetailModal({ testimonial, onClose }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => setVisible(true));
    function handleEsc(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", handleEsc);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", handleEsc); cancelAnimationFrame(raf); };
  }, [onClose]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`} onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className={`relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300 ${visible ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary-400 via-teal-400 to-primary-500"/>
        <button onClick={onClose} className="absolute right-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow transition hover:bg-slate-100 hover:text-slate-700"><X size={18}/></button>
        <Quote className="pointer-events-none absolute right-2 top-6 z-0 text-primary-50" size={75} strokeWidth={1} fill="currentColor"/>
        <div className="relative z-10 max-h-[85vh] overflow-y-auto overflow-x-hidden p-5 sm:p-7">
          <div className="flex items-center gap-3 pr-10">
            <Avatar t={testimonial} size={11} featured/>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-bold text-slate-900">{testimonial.name}</h3>
              <StarRow rating={testimonial.rating} size={14}/>
            </div>
          </div>
          <p className="mt-6 break-words whitespace-pre-wrap text-sm leading-7 text-slate-600 sm:text-base">"{testimonial.message}"</p>
        </div>
      </div>
    </div>
  );
}

// ── Main Section ───────────────────────────────────────────────────
export default function TestimonialsSection() {
  const { customer } = useWebsiteStore();

  const [testimonials,        setTestimonials]        = useState([]);
  const [page,                setPage]                = useState(1);
  const [totalPages,          setTotalPages]          = useState(1);
  const [loading,             setLoading]             = useState(true);
  const [cardsVisible,        setCardsVisible]        = useState(false);
  const [showModal,           setShowModal]           = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [myTestimonial,       setMyTestimonial]       = useState(null); // customer's own
  const [checkingMine,        setCheckingMine]        = useState(false);
  const limit = 6;

  function loadTestimonials(p) {
    setLoading(true);
    setCardsVisible(false);
    fetch(`/api/testimonials?page=${p}&limit=${limit}`)
      .then(r => r.json())
      .then(res => {
        setTestimonials(res.data?.testimonials || []);
        setTotalPages(res.data?.totalPages    || 1);
      })
      .finally(() => setLoading(false));
  }

  // Check if logged-in customer already has a testimonial
  async function checkMyTestimonial() {
    if (!customer) return;
    setCheckingMine(true);
    try {
      const res  = await fetch("/api/testimonials/my");
      const data = await res.json();
      setMyTestimonial(data.success ? data.data : null);
    } catch {}
    finally { setCheckingMine(false); }
  }

  useEffect(() => { loadTestimonials(page); }, [page]);
  useEffect(() => { checkMyTestimonial(); }, [customer?._id]);
  useEffect(() => {
    if (!loading && testimonials.length) {
      const raf = requestAnimationFrame(() => setCardsVisible(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [loading, testimonials]);

  function handlePageChange(p) {
    setPage(p);
    document.getElementById("testimonials-section")?.scrollIntoView({ behavior:"smooth", block:"start" });
  }

  function handleSubmitted() {
    setPage(1);
    loadTestimonials(1);
    checkMyTestimonial();
  }

  function openWriteModal() {
    if (!customer) {
      window.location.href = "/account/login?redirect=/";
      return;
    }
    setShowModal(true);
  }

  // Button label based on state
  function getButtonLabel() {
    if (!customer)          return { label:"Write a Review", icon:<PenSquare size={16}/> };
    if (checkingMine)       return { label:"Loading...",     icon:null };
    if (myTestimonial)      return { label:"Edit Your Testimonial", icon:<Edit2 size={16}/> };
    return                         { label:"Write a Review", icon:<PenSquare size={16}/> };
  }

  const btn = getButtonLabel();

  return (
    <section id="testimonials-section" className="py-4">
      <div className="mb-10 text-center">
        <span className="inline-block rounded-full bg-primary-50 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary-500">
          Customer Reviews
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">What Our Customers Say</h2>
        <p className="mt-2 text-sm text-slate-500">Real people, real experiences</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-64 animate-pulse rounded-[28px] bg-slate-100 sm:col-span-2"/>
          {[0,1].map(i => <div key={i} className="h-64 animate-pulse rounded-[24px] bg-slate-100"/>)}
        </div>
      ) : !testimonials.length ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Quote className="text-slate-300" size={32}/>
          <p className="text-sm text-slate-400">No reviews yet. Be the first to share your experience!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {page === 1 && (
              <FeaturedCard t={testimonials[0]} onClick={setSelectedTestimonial} visible={cardsVisible}/>
            )}
            {(page === 1 ? testimonials.slice(1) : testimonials).map((t, i) => (
              <CompactCard key={t._id} t={t} onClick={setSelectedTestimonial} visible={cardsVisible} delay={i * 60}/>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={handlePageChange}/>
        </>
      )}

      {/* My testimonial status badge */}
      {customer && myTestimonial && (
        <div className={`mx-auto mt-6 w-fit rounded-full px-4 py-1.5 text-xs font-semibold ${
          myTestimonial.status === "approved"  ? "bg-green-100 text-green-700"  :
          myTestimonial.status === "rejected"  ? "bg-red-100 text-red-700"      :
          "bg-amber-100 text-amber-700"
        }`}>
          Your testimonial: {myTestimonial.status === "approved" ? "✅ Live" : myTestimonial.status === "rejected" ? "❌ Not approved" : "⏳ Pending review"}
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <button onClick={openWriteModal} disabled={checkingMine}
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-200 disabled:opacity-60">
          {btn.icon} {btn.label}
        </button>
      </div>

      {!customer && (
        <p className="mt-2 text-center text-xs text-slate-400">
          Please <a href="/account/login" className="font-semibold text-primary-600 hover:underline">log in</a> to share your testimonial.
        </p>
      )}

      {showModal && (
        <ReviewModal existing={myTestimonial} onClose={() => setShowModal(false)} onSubmitted={handleSubmitted}/>
      )}
      {selectedTestimonial && (
        <DetailModal testimonial={selectedTestimonial} onClose={() => setSelectedTestimonial(null)}/>
      )}
    </section>
  );
}
