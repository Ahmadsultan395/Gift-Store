"use client";
import { useEffect, useState, useCallback } from "react";
import { Star, ThumbsUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useWebsiteStore } from "@/stores/useWebsiteStore";

const REVIEWS_PER_PAGE = 3;

function StarPicker({ value, onChange, size = 28 }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
        >
          <Star
            size={size}
            className={`transition-colors ${
              i <= (hover || value)
                ? "fill-amber-400 text-amber-400"
                : "text-slate-200 hover:text-amber-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-slate-200"
          }
        />
      ))}
    </div>
  );
}

function RatingBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <button className="flex w-full items-center gap-2 text-xs group">
      <span className="w-5 text-right text-slate-500">{star}</span>
      <Star size={10} className="fill-amber-400 text-amber-400 flex-shrink-0" />
      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-amber-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-slate-400 text-right">{count}</span>
    </button>
  );
}

export default function ReviewSection({ productId }) {
  const { customer } = useWebsiteStore();

  // Data
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [breakdown, setBreakdown] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Form
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchReviews = useCallback(
    async (page = 1) => {
      if (!productId) return;
      setLoading(true);
      try {
        const res = await fetch(
          `/api/products/${productId}/reviews?page=${page}&limit=${REVIEWS_PER_PAGE}`,
        );
        const json = await res.json();
        if (json.success) {
          setReviews(json.data.reviews || []);
          setTotal(json.data.total || 0);
          setAvgRating(json.data.avgRating || 0);
          setBreakdown(json.data.breakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
          setPagination(json.data.pagination || { page: 1, pages: 1 });
        }
      } catch {
      } finally {
        setLoading(false);
      }
    },
    [productId],
  );

  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    if (!rating) return setFormError("Please select a star rating");
    if (!comment.trim()) return setFormError("Please write a comment");

    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, title, comment }),
      });
      const json = await res.json();
      if (!json.success)
        return setFormError(json.message || "Submission failed");
      setSubmitted(true);
      setRating(0);
      setTitle("");
      setComment("");
    } catch {
      setFormError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  function goToPage(p) {
    if (p < 1 || p > pagination.pages) return;
    fetchReviews(p);
    // Scroll to reviews section
    document
      .getElementById("reviews-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const LABEL = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent",
  };

  return (
    <div id="reviews-section" className="mt-12">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <h2 className="text-xl font-bold text-slate-800">Customer Reviews</h2>
        {total > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-amber-700">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-xs text-amber-500">({total} reviews)</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* ── LEFT: Summary + Reviews List ──────────────────── */}
        <div className="lg:col-span-2">
          {/* Rating Summary */}
          {total > 0 && (
            <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-5">
              <div className="flex items-center gap-6">
                <div className="text-center flex-shrink-0">
                  <p className="text-5xl font-extrabold text-slate-800 leading-none">
                    {avgRating.toFixed(1)}
                  </p>
                  <StarDisplay rating={avgRating} size={16} />
                  <p className="mt-1 text-xs text-slate-400">{total} reviews</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((s) => (
                    <RatingBar
                      key={s}
                      star={s}
                      count={breakdown[s] || 0}
                      total={total}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reviews */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 py-12 text-center text-slate-400">
              <Star size={32} className="opacity-20" />
              <p className="text-sm">No reviews yet — be the first!</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div
                    key={r._id}
                    className="rounded-2xl border border-slate-100 bg-white p-5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 flex-shrink-0">
                          {r.customer?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 leading-tight">
                            {r.customer?.name || "Customer"}
                          </p>
                          <StarDisplay rating={r.rating} size={11} />
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 whitespace-nowrap ml-2">
                        {new Date(r.createdAt).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    {r.title && (
                      <p className="mt-2.5 text-sm font-semibold text-slate-700">
                        {r.title}
                      </p>
                    )}
                    {r.comment && (
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        {r.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* ── Pagination ─────────────────────────────── */}
              {pagination.pages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Page {pagination.page} of {pagination.pages} • {total}{" "}
                    reviews
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => goToPage(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:border-primary-400 hover:text-primary-600 disabled:opacity-40 transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {/* Page numbers */}
                    <div className="flex gap-1">
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                        .filter(
                          (p) =>
                            p === 1 ||
                            p === pagination.pages ||
                            Math.abs(p - pagination.page) <= 1,
                        )
                        .reduce((acc, p, i, arr) => {
                          if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, i) =>
                          p === "..." ? (
                            <span
                              key={`dots-${i}`}
                              className="flex h-8 w-8 items-center justify-center text-slate-400 text-xs"
                            >
                              ...
                            </span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => goToPage(p)}
                              className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-semibold transition-colors ${
                                p === pagination.page
                                  ? "bg-primary-600 text-white"
                                  : "border border-slate-200 text-slate-600 hover:border-primary-400 hover:text-primary-600"
                              }`}
                            >
                              {p}
                            </button>
                          ),
                        )}
                    </div>

                    <button
                      onClick={() => goToPage(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:border-primary-400 hover:text-primary-600 disabled:opacity-40 transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── RIGHT: Submit Form ─────────────────────────────── */}
        <div>
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 font-bold text-slate-800">Write a Review</h3>

            {!customer ? (
              <div className="rounded-xl bg-slate-50 p-5 text-center">
                <Star
                  size={28}
                  className="mx-auto mb-2 text-amber-400 fill-amber-400"
                />
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Share Your Experience
                </p>
                <p className="text-xs text-slate-500 mb-3">
                  Login to write a review for this product.
                </p>
                <a
                  href="/account/login"
                  className="inline-block rounded-xl bg-primary-600 px-5 py-2 text-sm font-bold text-white hover:bg-primary-700"
                >
                  Login to Review
                </a>
              </div>
            ) : submitted ? (
              <div className="flex flex-col items-center gap-3 rounded-xl bg-green-50 p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                  <ThumbsUp size={24} className="text-green-600" />
                </div>
                <p className="font-semibold text-green-800">
                  Review Submitted!
                </p>
                <p className="text-sm text-green-600">
                  It will appear after admin approval.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Your Rating *
                  </label>
                  <StarPicker value={rating} onChange={setRating} />
                  {rating > 0 && (
                    <p className="mt-1.5 text-xs font-semibold text-amber-600">
                      {LABEL[rating]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Title (optional)
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Quick summary..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Review *
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder="Share your experience with this product..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-100"
                  />
                </div>

                {formError && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-60 transition-colors"
                >
                  {submitting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Star size={15} />
                  )}
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
