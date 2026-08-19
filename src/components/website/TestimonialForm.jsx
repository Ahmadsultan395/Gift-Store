"use client";
import { useState } from "react";
import { Star, Loader2, CheckCircle2, X } from "lucide-react";

export default function TestimonialForm({
  existing = null,
  onSuccess,
  onClose,
}) {
  // existing = customer's current testimonial (if editing)
  const isEditing = !!existing;

  const [rating, setRating] = useState(existing?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState(existing?.message || "");
  const [photo, setPhoto] = useState("");
  const [photoPreview, setPhotoPreview] = useState(existing?.photo || "");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result);
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!rating) return setError("Please select a star rating");
    if (!message.trim()) return setError("Please write a message");

    setSubmitting(true);
    try {
      const res = await fetch("/api/testimonials/my", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, message, photo }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Something went wrong, please try again");
        return;
      }
      setSuccess(true);
      onSuccess?.();
    } catch {
      setError("Something went wrong, please try again");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="relative flex flex-col items-center gap-4 rounded-2xl bg-white p-8 text-center">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute -top-2 right-0 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        )}
        <CheckCircle2 className="text-primary-600" size={44} />
        <p className="font-semibold text-slate-800 text-base leading-snug">
          Thank you! Your testimonial has been submitted for review and will
          appear after admin approval.
        </p>
        <button
          onClick={onClose}
          className="rounded-xl bg-primary-600 px-6 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative space-y-4 rounded-2xl bg-white p-1"
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-2 right-0 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X size={18} />
        </button>
      )}

      <h3 className="text-lg font-bold text-slate-800">
        {isEditing ? "Edit Your Testimonial" : "Write a Testimonial"}
      </h3>

      {isEditing && existing?.status === "pending" && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
          Your testimonial is currently pending approval. Editing will re-submit
          it for review.
        </div>
      )}
      {isEditing && existing?.status === "rejected" && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          Your testimonial was not approved. You can edit and re-submit it.
          {existing.adminNote && (
            <span className="block mt-1 font-medium">
              Note: {existing.adminNote}
            </span>
          )}
        </div>
      )}

      {/* Rating */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">
          Rating *
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            >
              <Star
                size={26}
                className={
                  star <= (hoverRating || rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-300"
                }
              />
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">
          Message *
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
          placeholder="Share your experience with us..."
        />
      </div>

      {/* Photo optional */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">
          Your Photo (optional)
        </label>
        <input type="file" accept="image/*" onChange={handlePhotoChange} />
        {photoPreview && (
          <img
            src={photoPreview}
            alt="Preview"
            className="mt-2 h-16 w-16 rounded-full object-cover border-2 border-primary-200"
          />
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
      >
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {submitting
          ? "Submitting..."
          : isEditing
            ? "Update Testimonial"
            : "Submit Testimonial"}
      </button>
    </form>
  );
}
