"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Gift,
  Mail,
  X,
  Send,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";

/**
 * SubscribePopup
 * ---------------------------------------------------------------------
 * Site-wide "gift shop" newsletter popup. Mount it ONCE in the root
 * website layout (outside individual pages) so it works across every
 * route.
 *
 * BEHAVIOUR / TIMING RULES (all controlled by the constants below):
 *  - First-time visitor → popup shows after a short delay.
 *  - If the visitor closes it (X or backdrop click) → it will not
 *    show again until SHOW_INTERVAL_HOURS have passed.
 *  - If the visitor successfully subscribes → it never shows again
 *    on that browser (permanent dismissal).
 *  - Everything is tracked in localStorage, so it persists across
 *    page navigations and browser restarts (not just per-tab/session).
 *
 * TO CHANGE THE FREQUENCY:
 *  - "1 baar din mein"        → SHOW_INTERVAL_HOURS = 24
 *  - "har 4 ghante baad"      → SHOW_INTERVAL_HOURS = 4
 *  - "har 1 ghante baad"      → SHOW_INTERVAL_HOURS = 1
 *  Just edit the single constant below — nothing else to touch.
 */

// ── Config — tweak these two numbers to control behaviour ───────────
const SHOW_INTERVAL_HOURS = 24; // how often to re-show after a close
const FIRST_SHOW_DELAY_MS = 1800; // small delay so it doesn't jump-scare on load

const STORAGE_KEYS = {
  lastShown: "gs_newsletter_last_shown",
  subscribed: "gs_newsletter_subscribed",
};

export default function SubscribePopup() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [shake, setShake] = useState(false);

  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  // ── Decide on mount whether the popup is allowed to show ──────────
  useEffect(() => {
    try {
      const alreadySubscribed = localStorage.getItem(STORAGE_KEYS.subscribed);
      if (alreadySubscribed === "true") return; // never show again

      const lastShown = localStorage.getItem(STORAGE_KEYS.lastShown);
      const intervalMs = SHOW_INTERVAL_HOURS * 60 * 60 * 1000;

      const eligible =
        !lastShown || Date.now() - Number(lastShown) >= intervalMs;

      if (!eligible) return;

      const timer = setTimeout(() => {
        setOpen(true);
        localStorage.setItem(STORAGE_KEYS.lastShown, String(Date.now()));
      }, FIRST_SHOW_DELAY_MS);

      return () => clearTimeout(timer);
    } catch {
      // localStorage unavailable (SSR/private mode) — just skip silently
    }
  }, []);

  // mount flag purely for the entrance animation
  useEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(raf);
    }
    setMounted(false);
  }, [open]);

  const closePopup = useCallback(() => {
    setMounted(false);
    setTimeout(() => setOpen(false), 250); // let exit animation play
  }, []);

  // lock body scroll while open
  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  // close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && closePopup();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closePopup]);

  async function handleSubscribe(e) {
    e.preventDefault();

    if (!email.trim() || !isValidEmail(email)) {
      setStatus("error");
      setErrorMsg(
        !email.trim()
          ? "Please enter your email"
          : "Enter a valid email address",
      );
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!data.success) {
        setStatus("error");
        setErrorMsg(data.message || "Something went wrong");
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }

      setStatus("success");
      setEmail("");
      try {
        localStorage.setItem(STORAGE_KEYS.subscribed, "true");
      } catch {}

      setTimeout(() => closePopup(), 2000);
    } catch {
      setStatus("error");
      setErrorMsg("Couldn't connect. Please try again.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[999] flex items-center justify-center p-4 transition-opacity duration-300 ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
      aria-modal="true"
      role="dialog"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-primary-950/70 backdrop-blur-sm"
        onClick={closePopup}
      />

      {/* card */}
      <div
        className={`
        sp-border-glow
        relative w-full max-w-md overflow-hidden rounded-3xl
        bg-gradient-to-br from-primary-900 via-primary-950 to-primary-950
        shadow-2xl shadow-black/50
        transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${mounted ? "translate-y-0 scale-100 opacity-100" : "translate-y-6 scale-95 opacity-0"}
        ${shake ? "sp-shake" : ""}
        `}
      >
        {/* animated gradient border ring */}
        <div className="sp-border-ring pointer-events-none absolute inset-0 rounded-3xl" />
        <div className="pointer-events-none absolute inset-[1.5px] rounded-3xl bg-primary-950" />

        {/* ambient glows */}
        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-secondary-400/20 blur-[70px]" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-secondary-500/15 blur-[80px]" />

        {/* dot-grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            color: "#E9D073",
          }}
        />

        {/* floating sparkle accents */}
        <Sparkles
          size={80}
          className="sp-twinkle pointer-events-none absolute -right-3 -top-3 text-secondary-400/20 rotate-12"
        />
        <Gift
          size={56}
          strokeWidth={1.3}
          className="sp-twinkle-delay pointer-events-none absolute -left-3 -bottom-3 text-secondary-400/15 -rotate-12"
        />

        {/* close button */}
        <button
          onClick={closePopup}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:text-white hover:rotate-90"
        >
          <X size={16} />
        </button>

        {/* content */}
        <div className="relative px-7 pb-8 pt-10 text-center sm:px-9">
          <div className="sp-icon-wrap relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-secondary-300/25 backdrop-blur-sm">
            <span className="sp-icon-pulse absolute inset-0 rounded-2xl bg-secondary-400/25" />
            <Gift
              size={28}
              className="relative text-secondary-300"
              strokeWidth={1.6}
            />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary-400/40 bg-secondary-400/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-secondary-300 backdrop-blur-sm">
            Exclusive Offer
          </span>

          <h2 className="sp-shimmer-text mt-4 text-2xl font-black tracking-tight sm:text-3xl">
            Unwrap 10% Off
          </h2>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-primary-100/70">
            Subscribe for exclusive gift deals, new arrivals and offers straight
            to your inbox.
          </p>

          <form onSubmit={handleSubscribe} className="mt-6 flex flex-col gap-3">
            <div className="relative">
              <Mail
                size={15}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary-300/70"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={status === "loading" || status === "success"}
                className={`w-full rounded-xl border bg-primary-950/60 py-3.5 pl-10 pr-3 text-sm text-white placeholder:text-primary-300/50 outline-none transition-all duration-300 disabled:opacity-50 ${
                  status === "error"
                    ? "border-red-500/70 focus:border-red-400"
                    : "border-primary-700 focus:border-secondary-500 focus:shadow-[0_0_0_4px_rgba(201,162,39,0.18)]"
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className="sp-btn-shimmer relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-secondary-500 px-6 py-3.5 text-sm font-bold text-primary-950 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-secondary-500/30 active:scale-95 disabled:translate-y-0 disabled:opacity-80 disabled:hover:shadow-none"
            >
              {status === "loading" && (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Subscribing…
                </>
              )}
              {status === "success" && (
                <span className="sp-check-in flex items-center gap-2">
                  <CheckCircle2 size={16} strokeWidth={2.5} />
                  Subscribed
                </span>
              )}
              {(status === "idle" || status === "error") && (
                <>
                  <Send size={14} />
                  Claim My Discount
                </>
              )}
            </button>
          </form>

          <div className="relative mt-3 h-4">
            {status === "error" && (
              <p className="sp-msg-in text-xs font-medium text-red-400">
                {errorMsg}
              </p>
            )}
            {status === "success" && (
              <p className="sp-msg-in text-xs font-medium text-secondary-300">
                🎁 Thanks! Check your inbox for a confirmation.
              </p>
            )}
          </div>

          <button
            onClick={closePopup}
            className="mt-2 text-xs font-medium text-primary-200/50 underline-offset-2 transition-colors hover:text-primary-200/80 hover:underline"
          >
            No thanks, maybe later
          </button>
        </div>
      </div>

      <style jsx>{`
        .sp-border-ring {
          padding: 1.5px;
          background: conic-gradient(
            from var(--sp-angle, 0deg),
            rgba(201, 162, 39, 0.15),
            rgba(233, 208, 115, 0.6),
            rgba(201, 162, 39, 0.15) 25%,
            rgba(122, 31, 43, 0.3) 50%,
            rgba(201, 162, 39, 0.15) 75%,
            rgba(233, 208, 115, 0.6),
            rgba(201, 162, 39, 0.15)
          );
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: spBorderRotate 5s linear infinite;
        }
        @property --sp-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes spBorderRotate {
          to {
            --sp-angle: 360deg;
          }
        }

        .sp-shimmer-text {
          background-image: linear-gradient(
            100deg,
            #ffffff 20%,
            #f3e2a3 40%,
            #ffffff 60%
          );
          background-size: 220% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: spShimmerText 4s ease-in-out infinite;
        }
        @keyframes spShimmerText {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -60% 0;
          }
        }

        .sp-icon-pulse {
          animation: spIconPulse 2.2s ease-out infinite;
        }
        @keyframes spIconPulse {
          0% {
            transform: scale(0.85);
            opacity: 0.6;
          }
          70%,
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        @keyframes spTwinkle {
          0%,
          100% {
            opacity: 0.15;
            transform: scale(1) rotate(12deg);
          }
          50% {
            opacity: 0.4;
            transform: scale(1.12) rotate(18deg);
          }
        }
        .sp-twinkle {
          animation: spTwinkle 3.5s ease-in-out infinite;
        }
        .sp-twinkle-delay {
          animation: spTwinkle 3.5s ease-in-out infinite;
          animation-delay: 1.2s;
        }

        .sp-btn-shimmer {
          background-image: linear-gradient(
            110deg,
            #c9a227 0%,
            #c9a227 40%,
            #e9d073 50%,
            #c9a227 60%,
            #c9a227 100%
          );
          background-size: 250% 100%;
          background-position: 0% 0;
        }
        .sp-btn-shimmer:hover:not(:disabled) {
          animation: spShimmerMove 1.2s ease-in-out infinite;
        }
        @keyframes spShimmerMove {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -50% 0;
          }
        }

        @keyframes spCheckIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          60% {
            transform: scale(1.15);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .sp-check-in {
          animation: spCheckIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes spMsgIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .sp-msg-in {
          animation: spMsgIn 0.3s ease both;
        }

        @keyframes spShake {
          0%,
          100% {
            transform: translateX(0);
          }
          20% {
            transform: translateX(-6px);
          }
          40% {
            transform: translateX(6px);
          }
          60% {
            transform: translateX(-4px);
          }
          80% {
            transform: translateX(4px);
          }
        }
        .sp-shake {
          animation: spShake 0.4s ease;
        }

        @media (prefers-reduced-motion: reduce) {
          .sp-border-ring,
          .sp-shimmer-text,
          .sp-icon-pulse,
          .sp-twinkle,
          .sp-twinkle-delay,
          .sp-btn-shimmer,
          .sp-check-in,
          .sp-msg-in,
          .sp-shake {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
