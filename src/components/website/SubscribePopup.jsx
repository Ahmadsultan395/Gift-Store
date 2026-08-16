"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
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
 *  - If the visitor closes it (X or "no thanks") → it will not
 *    show again until SHOW_INTERVAL_HOURS have passed, BUT a small
 *    animated vertical tab stays stuck to the side of the screen.
 *    Clicking that tab reopens the popup immediately (bypasses the
 *    interval wait).
 *  - If the visitor successfully subscribes → neither the popup nor
 *    the side tab ever show again on that browser (permanent
 *    dismissal).
 *  - Everything is tracked in localStorage, so it persists across
 *    page navigations and browser restarts (not just per-tab/session).
 *
 * A single `view` state ("closed" | "popup" | "tab") drives everything —
 * no chained timeouts flipping multiple booleans, so there's no race
 * condition where the popup opens and then instantly reverts.
 *
 * The side tab NEVER translates itself off/on screen horizontally.
 * It animates only opacity + scale (anchored at the screen edge), so
 * it can never push the page's scrollable width and create a gap —
 * even if some ancestor element has its own CSS transform.
 *
 * TO CHANGE THE FREQUENCY:
 *  - "1 baar din mein"        → SHOW_INTERVAL_HOURS = 24
 *  - "har 4 ghante baad"      → SHOW_INTERVAL_HOURS = 4
 *  - "har 1 ghante baad"      → SHOW_INTERVAL_HOURS = 1
 *
 * TO CHANGE THE TAB SIDE:
 *  - TAB_SIDE = "right" | "left"
 */

// ── Config — tweak these to control behaviour ────────────────────────
const SHOW_INTERVAL_HOURS = 24; // how often to re-show after a close
const FIRST_SHOW_DELAY_MS = 1800; // small delay so it doesn't jump-scare on load
const TAB_SIDE = "left"; // "right" | "left"

const STORAGE_KEYS = {
  lastShown: "gs_newsletter_last_shown",
  subscribed: "gs_newsletter_subscribed",
};

export default function SubscribePopup() {
  // "closed" | "popup" | "tab"  — single source of truth, no races
  const [view, setView] = useState("closed");
  const [popupMounted, setPopupMounted] = useState(false);
  const [tabMounted, setTabMounted] = useState(false);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [shake, setShake] = useState(false);

  const subscribedRef = useRef(false);

  // Render through a portal straight into document.body so this widget is
  // never affected by any parent's overflow/scroll/transform — that was
  // the cause of the tab appearing to vanish while scrolling.
  const [portalReady, setPortalReady] = useState(false);
  useEffect(() => setPortalReady(true), []);

  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  // ── Decide on mount what to show ──────────────────────────────────
  useEffect(() => {
    try {
      const alreadySubscribed = localStorage.getItem(STORAGE_KEYS.subscribed);
      if (alreadySubscribed === "true") {
        subscribedRef.current = true;
        setView("closed");
        return;
      }

      const lastShown = localStorage.getItem(STORAGE_KEYS.lastShown);
      const intervalMs = SHOW_INTERVAL_HOURS * 60 * 60 * 1000;
      const eligible =
        !lastShown || Date.now() - Number(lastShown) >= intervalMs;

      if (!eligible) {
        setView("tab");
        return;
      }

      const timer = setTimeout(() => {
        setView("popup");
        localStorage.setItem(STORAGE_KEYS.lastShown, String(Date.now()));
      }, FIRST_SHOW_DELAY_MS);

      return () => clearTimeout(timer);
    } catch {
      // localStorage unavailable (SSR/private mode) — just skip silently
    }
  }, []);

  // entrance animation flags — driven purely by `view`
  useEffect(() => {
    if (view === "popup") {
      const raf = requestAnimationFrame(() => setPopupMounted(true));
      return () => cancelAnimationFrame(raf);
    }
    setPopupMounted(false);

    if (view === "tab") {
      const raf = requestAnimationFrame(() => setTabMounted(true));
      return () => cancelAnimationFrame(raf);
    }
    setTabMounted(false);
  }, [view]);

  const closePopup = useCallback(() => {
    setPopupMounted(false);
    setTimeout(() => {
      setView(subscribedRef.current ? "closed" : "tab");
    }, 250); // let exit animation play
  }, []);

  const openFromTab = useCallback(() => {
    setTabMounted(false);
    setTimeout(() => {
      setView("popup");
    }, 200);
  }, []);

  // lock body scroll while popup open
  useEffect(() => {
    if (view === "popup") {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [view]);

  // close on Escape
  useEffect(() => {
    if (view !== "popup") return;
    const onKey = (e) => e.key === "Escape" && closePopup();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, closePopup]);

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
      subscribedRef.current = true;
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

  if (!portalReady) return null;

  return createPortal(
    <>
      {view === "popup" && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-300 ${
            popupMounted ? "opacity-100" : "opacity-0"
          }`}
          aria-modal="true"
          role="dialog"
        >
          {/* backdrop */}
          <div className="absolute inset-0 bg-primary-950/70 backdrop-blur-sm" />

          {/* card */}
          <div
            className={`
            sp-border-glow
            relative w-full max-w-md overflow-hidden rounded-3xl
            bg-gradient-to-br from-primary-900 via-primary-950 to-primary-950
            shadow-2xl shadow-black/50
            transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${popupMounted ? "translate-y-0 scale-100 opacity-100" : "translate-y-6 scale-95 opacity-0"}
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
                Subscribe for exclusive gift deals, new arrivals and offers
                straight to your inbox.
              </p>

              <form
                onSubmit={handleSubscribe}
                className="mt-6 flex flex-col gap-3"
              >
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
      )}

      {/* ── Vertical side tab ─────────────────────────────────────────
          Anchored flush to the edge at all times. Only opacity + scale
          animate (transform-origin sits on the edge itself), so this
          element never extends past the viewport and can never create
          horizontal overflow/gap on the page, regardless of any
          transformed ancestor. */}
      {view === "tab" && (
        <div
          className={`fixed top-1/2 z-[9998] -translate-y-1/2 ${
            TAB_SIDE === "right" ? "right-0" : "left-0"
          }`}
          style={{
            transformOrigin:
              TAB_SIDE === "right" ? "right center" : "left center",
          }}
        >
          <button
            onClick={openFromTab}
            aria-label="Open 10% off gift offer"
            className={`
              sp-tab-float sp-tab-glow sp-tab-attention
              relative flex flex-col items-center gap-1.5 sm:gap-3
              ${TAB_SIDE === "right" ? "rounded-l-2xl" : "rounded-r-2xl"}
              border-2 sm:border-[3px] border-[#3a0a12]
              px-2 py-3 sm:px-3.5 sm:py-6
              transition-all duration-300 ease-out
              hover:px-3 sm:hover:px-5
              active:scale-95
              ${tabMounted ? "opacity-100 scale-100" : "opacity-0 scale-75"}
            `}
            style={{
              background:
                "linear-gradient(180deg, #FFE27A 0%, #F7C325 50%, #E0A600 100%)",
              minWidth: 38,
            }}
          >
            {/* pulsing "ping" ring — the classic notification-badge attention grabber */}
            <span className="sp-tab-ping pointer-events-none absolute inset-0 rounded-[inherit]" />

            <span className="sp-tab-icon relative flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#3a0a12] shadow-md">
              <Gift
                size={13}
                strokeWidth={2.4}
                className="text-[#FFE27A] sm:hidden"
              />
              <Gift
                size={17}
                strokeWidth={2.4}
                className="hidden text-[#FFE27A] sm:block"
              />
            </span>
            <span
              className="relative text-[10px] sm:text-[13px] font-black uppercase tracking-wider text-[#3a0a12]"
              style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                textShadow: "0 1px 0 rgba(255,255,255,0.35)",
              }}
            >
              10% Off
            </span>
            <span className="sp-tab-shine pointer-events-none absolute inset-0 rounded-[inherit]" />
          </button>

          <style jsx>{`
            .sp-tab-float {
              animation: spTabBob 2.6s ease-in-out infinite;
            }
            @keyframes spTabBob {
              0%,
              100% {
                transform: translateY(0);
              }
              50% {
                transform: translateY(-10px);
              }
            }

            .sp-tab-glow {
              box-shadow:
                0 0 22px 4px rgba(247, 195, 37, 0.75),
                0 10px 28px -4px rgba(0, 0, 0, 0.6);
            }

            /* big periodic "look at me" pulse, on top of the constant float */
            .sp-tab-attention {
              animation:
                spTabBob 2.6s ease-in-out infinite,
                spTabAttention 4s ease-in-out infinite;
            }
            @keyframes spTabAttention {
              0%,
              78%,
              100% {
                filter: brightness(1);
              }
              84% {
                filter: brightness(1.35);
              }
              90% {
                filter: brightness(1);
              }
            }

            /* expanding ring that pings outward, like a notification badge */
            .sp-tab-ping {
              box-shadow: 0 0 0 0 rgba(255, 214, 92, 0.7);
              animation: spTabPing 2.2s cubic-bezier(0.2, 0.7, 0.3, 1) infinite;
            }
            @keyframes spTabPing {
              0% {
                box-shadow: 0 0 0 0 rgba(255, 214, 92, 0.65);
              }
              70% {
                box-shadow: 0 0 0 16px rgba(255, 214, 92, 0);
              }
              100% {
                box-shadow: 0 0 0 0 rgba(255, 214, 92, 0);
              }
            }

            .sp-tab-icon {
              animation: spTabIconPulse 2.6s ease-in-out infinite;
            }
            @keyframes spTabIconPulse {
              0%,
              100% {
                transform: scale(1) rotate(0deg);
              }
              50% {
                transform: scale(1.22) rotate(-8deg);
              }
            }

            .sp-tab-shine {
              background: linear-gradient(
                115deg,
                transparent 35%,
                rgba(255, 255, 255, 0.65) 50%,
                transparent 65%
              );
              background-size: 220% 220%;
              background-position: 130% 0;
              animation: spTabShineSweep 2.6s ease-in-out infinite;
              animation-delay: 1s;
            }
            @keyframes spTabShineSweep {
              0% {
                background-position: 130% 0;
              }
              35%,
              100% {
                background-position: -30% 0;
              }
            }

            @media (prefers-reduced-motion: reduce) {
              .sp-tab-float,
              .sp-tab-glow,
              .sp-tab-attention,
              .sp-tab-ping,
              .sp-tab-icon,
              .sp-tab-shine {
                animation: none !important;
              }
            }
          `}</style>
        </div>
      )}
    </>,
    document.body,
  );
}
