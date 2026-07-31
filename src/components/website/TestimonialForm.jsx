"use client";
import { useState } from "react";
import { Star, Loader2, CheckCircle2, X } from "lucide-react";

export default function TestimonialForm({ onSuccess, onClose }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [photo, setPhoto] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
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

    if (!name.trim() || !message.trim() || !rating) {
      setError("Name, message and rating are required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message, rating, photo }),
      });
      if (!res.ok) throw new Error("Could not submit review");

      setSuccess(true);
      setName("");
      setMessage("");
      setRating(0);
      setPhoto("");
      setPhotoPreview("");
      onSuccess?.();
    } catch (err) {
      setError("Something went wrong, please try again");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="relative flex flex-col items-center gap-3 rounded-2xl bg-white p-8 text-center">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute -top-2 right-0 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        )}
        <CheckCircle2 className="text-primary-600" size={40} />
        <p className="font-semibold text-primary-800">
          Thank you! Your review has been submitted.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="text-sm font-medium text-primary-600 underline"
        >
          Write another review
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

      <h3 className="text-lg font-bold text-slate-800">Write a Review</h3>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
          placeholder="Your name"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">
          Rating
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

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
          placeholder="Share your experience..."
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">
          Photo (optional)
        </label>
        <input type="file" accept="image/*" onChange={handlePhotoChange} />
        {photoPreview && (
          <img
            src={photoPreview}
            alt="Preview"
            className="mt-2 h-16 w-16 rounded-full object-cover"
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
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
