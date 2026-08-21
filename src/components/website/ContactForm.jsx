"use client";
import { useState } from "react";
import { Send, CheckCircle, Loader2 } from "lucide-react";

/**
 * Shared contact form — used on both the full /contact page and the
 * compact homepage section (HomeContactSection). Always collects the
 * same complete fields (name, phone, email, subject, message) so the
 * backend/admin inbox gets full info either way — `compact` only
 * changes visual density, never which fields are sent.
 *
 * Props:
 * - compact: tighter spacing, no field labels (placeholder-only), no
 *   message character counter. Default false (full /contact page look).
 * - onSuccess: optional callback fired after a successful send.
 */
export default function ContactForm({ compact = false, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function setF(k) {
    return (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Please enter your name");
    if (!form.message.trim()) return setError("Please write a message");
    if (!form.phone.trim() && !form.email.trim())
      return setError("Please enter a phone number or email");

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) return setError(data.message || "Failed to send");
      setSuccess(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      onSuccess?.();
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-300/30";

  if (success) {
    return (
      <div
        className={`flex flex-col items-center gap-4 rounded-2xl bg-primary-50 text-center ${
          compact ? "py-8" : "py-14"
        }`}
      >
        <div className="relative">
          <div
            className={`flex items-center justify-center rounded-full bg-primary-100 ${
              compact ? "h-14 w-14" : "h-20 w-20"
            }`}
          >
            <CheckCircle
              size={compact ? 26 : 36}
              className="text-primary-600"
            />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-primary-400/40 animate-ping" />
        </div>
        <div>
          <p
            className={`font-bold text-primary-800 ${compact ? "text-sm" : "text-lg"}`}
          >
            Message Sent! ✅
          </p>
          <p
            className={`mt-1 text-primary-600 ${compact ? "text-xs" : "text-sm"}`}
          >
            We'll get back to you as soon as possible
          </p>
        </div>
        <button
          onClick={() => setSuccess(false)}
          className={`rounded-xl border border-primary-300 bg-white font-medium text-primary-700 hover:bg-primary-50 transition-colors ${
            compact ? "px-4 py-1.5 text-xs" : "mt-2 px-6 py-2 text-sm"
          }`}
        >
          Send Another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={compact ? "space-y-3 text-left" : "space-y-4"}
    >
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${compact ? "gap-3" : "gap-4"}`}
      >
        {/* Name */}
        <div>
          {!compact && (
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Full Name *
            </label>
          )}
          <input
            value={form.name}
            onChange={setF("name")}
            placeholder="Your name"
            className={inputClass}
          />
        </div>
        {/* Phone */}
        <div>
          {!compact && (
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Phone Number
            </label>
          )}
          <input
            value={form.phone}
            onChange={setF("phone")}
            placeholder="03xx-xxxxxxx"
            type="tel"
            className={inputClass}
          />
        </div>
      </div>

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${compact ? "gap-3" : "gap-4"}`}
      >
        {/* Email */}
        <div>
          {!compact && (
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Email Address
            </label>
          )}
          <input
            value={form.email}
            onChange={setF("email")}
            placeholder="you@email.com"
            type="email"
            className={inputClass}
          />
        </div>

        {/* Subject */}
        <div>
          <label
            htmlFor="contact-subject"
            className={
              compact
                ? "sr-only"
                : "mb-1.5 block text-sm font-medium text-slate-700"
            }
          >
            Subject
          </label>

          <select
            id="contact-subject"
            name="subject"
            value={form.subject}
            onChange={setF("subject")}
            className={`${inputClass} bg-white`}
          >
            <option value="">Select a topic</option>
            <option value="Order Issue">Order Issue</option>
            <option value="Product Inquiry">Product Inquiry</option>
            <option value="Gift Wrapping / Customization">
              Gift Wrapping / Customization
            </option>
            <option value="Delivery Problem">Delivery Problem</option>
            <option value="Refund / Return">Refund / Return</option>
            <option value="General Question">General Question</option>
            <option value="Feedback">Feedback</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Message */}
      <div>
        {!compact && (
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Message *
          </label>
        )}
        <textarea
          value={form.message}
          onChange={setF("message")}
          rows={compact ? 3 : 5}
          placeholder="Write your question or message here..."
          className={`resize-none ${inputClass}`}
        />
        {!compact && (
          <p className="mt-1 text-right text-xs text-slate-400">
            {form.message.length}/500
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-600 sm:text-sm">
          ⚠ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`group flex items-center justify-center gap-2.5 rounded-xl bg-primary-600 font-bold text-white transition-all hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-200 disabled:opacity-60 active:scale-[0.99] ${
          compact
            ? "w-full py-2.5 text-sm sm:w-auto sm:mx-auto sm:px-6"
            : "w-full py-3.5 text-sm"
        }`}
      >
        {loading ? (
          <>
            <Loader2 size={compact ? 15 : 17} className="animate-spin" />{" "}
            Sending...
          </>
        ) : (
          <>
            <Send
              size={compact ? 14 : 16}
              className="transition-transform group-hover:translate-x-0.5"
            />
            Send Message
          </>
        )}
      </button>
    </form>
  );
}
