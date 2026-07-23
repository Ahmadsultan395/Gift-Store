"use client";
import { useState } from "react";
import { Mail, Send, CheckCircle2, Loader2, Sparkles } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [shake, setShake] = useState(false);

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

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
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
      setErrorMsg("Couldn't connect. Please try again.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#0F182A] p-8 text-center md:p-16">
      {/* Animated glow background — brand green only, good contrast against dark base */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="aurora-1 absolute -left-20 top-0 h-72 w-72 rounded-full bg-primary-400/40 blur-[80px]" />
        <div className="aurora-2 absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-primary-400/20 blur-[90px]" />
        {/* <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:32px_32px]" /> */}
      </div>

      <div className="relative">
        {/* Icon badge */}
        <div className="icon-float relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F4C39]/15 ring-1 ring-[#0F4C39]/40">
          <Mail size={26} className="text-primary-400" strokeWidth={2} />
          <Sparkles
            size={13}
            className="absolute -right-1 -top-1 text-amber-400"
            strokeWidth={2.5}
          />
        </div>

        <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-primary-400 ring-1 ring-white/10">
          Stay in the loop
        </span>

        <h2 className="mx-auto mt-4 max-w-lg text-2xl font-black leading-tight tracking-tight text-white md:text-4xl">
          Get Exclusive Deals in Your Inbox
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-slate-300 md:text-base">
          Subscribe for special offers, new arrivals and discount notifications.
        </p>

        <form
          onSubmit={handleSubscribe}
          className={`mx-auto mt-9 flex max-w-md flex-col gap-3 sm:flex-row ${shake ? "shake" : ""}`}
        >
          <div className="relative flex-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={status === "loading" || status === "success"}
              className={`peer w-full rounded-xl border bg-slate-800 px-4 py-3.5 text-sm text-white placeholder:text-slate-400 outline-none transition-all duration-300 disabled:opacity-50 ${
                status === "error"
                  ? "border-red-500/70 focus:border-red-400"
                  : "border-slate-700 focus:border-[#0F4C39]"
              }`}
            />
            <span className="input-glow pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 peer-focus:opacity-100" />
          </div>

          <button
            type="submit"
            disabled={status === "loading" || status === "success"}
            className={`relative flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-xl px-7 py-3.5 text-sm font-bold text-white transition-all duration-300 ${
              status === "success"
                ? "bg-primary-600"
                : "btn-shimmer bg-primary-600 hover:bg-primary-500 hover:shadow-lg hover:shadow-primary-600/30 active:scale-95"
            }`}
          >
            {status === "loading" && (
              <>
                <Loader2 size={16} className="animate-spin" />
                Subscribing…
              </>
            )}
            {status === "success" && (
              <span className="check-in flex items-center gap-2">
                <CheckCircle2 size={17} strokeWidth={2.5} />
                Subscribed
              </span>
            )}
            {(status === "idle" || status === "error") && (
              <>
                <Send size={15} />
                Subscribe
              </>
            )}
          </button>
        </form>

        <div className="mt-3 h-5">
          {status === "error" && (
            <p className="msg-in text-xs font-medium text-red-400">
              {errorMsg}
            </p>
          )}
          {status === "success" && (
            <p className="msg-in text-xs font-medium text-primary-300">
              🎉 Thanks! Check your inbox for a confirmation.
            </p>
          )}
        </div>

        <p className="mt-4 text-[11px] text-slate-400">
          No spam. Unsubscribe anytime.
        </p>
      </div>

      <style jsx>{`
        @keyframes auroraFloat1 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(30px, 20px) scale(1.1);
          }
        }
        @keyframes auroraFloat2 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-25px, -15px) scale(1.08);
          }
        }
        .aurora-1 {
          animation: auroraFloat1 8s ease-in-out infinite;
        }
        .aurora-2 {
          animation: auroraFloat2 9s ease-in-out infinite;
        }

        @keyframes iconFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        .icon-float {
          animation: iconFloat 3s ease-in-out infinite;
        }

        .input-glow {
          box-shadow:
            0 0 0 4px rgba(22, 163, 74, 0.15),
            0 0 24px rgba(22, 163, 74, 0.25);
        }

        .btn-shimmer {
          background-image: linear-gradient(
            110deg,
            #0f4c39 0%,
            #0f4c39 40%,
            #4ade80 50%,
            #0f4c39 60%,
            #0f4c39 100%
          );
          background-size: 250% 100%;
          animation: shimmerMove 3s ease-in-out infinite;
        }
        @keyframes shimmerMove {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -50% 0;
          }
        }

        @keyframes checkIn {
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
        .check-in {
          animation: checkIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes msgIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .msg-in {
          animation: msgIn 0.3s ease both;
        }

        @keyframes shakeX {
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
        .shake {
          animation: shakeX 0.4s ease;
        }

        @media (prefers-reduced-motion: reduce) {
          .aurora-1,
          .aurora-2,
          .icon-float,
          .btn-shimmer,
          .check-in,
          .msg-in,
          .shake {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
