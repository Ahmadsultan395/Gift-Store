"use client";
import { useEffect, useState } from "react";
import {
  Mail,
  Send,
  CheckCircle2,
  Loader2,
  Sparkles,
  Percent,
  Zap,
  ShieldCheck,
} from "lucide-react";

const BENEFITS = [
  { icon: Percent, label: "10% off your first order" },
  { icon: Zap, label: "Early access to new arrivals" },
  { icon: ShieldCheck, label: "No spam, unsubscribe anytime" },
];

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [shake, setShake] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

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
    <section className="relative overflow-hidden rounded-3xl bg-[#0B1220] p-7 text-center shadow-2xl shadow-black/40 md:p-12">
      {/* Radial depth glow — richer than a flat base color, cleaner than a baked-in diagonal gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.14),transparent_60%)]" />
      {/* Rotating gradient border — hard-level animated ring (no @property, works everywhere) */}
      <div className="border-glow-hard pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
        <div className="border-glow-hard-spin" />
      </div>

      {/* Subtle grid texture for depth */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:34px_34px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" />

      {/* Animated glow background — richer multi-tone (green + teal + amber) for depth */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="aurora-1 absolute -left-20 top-0 h-72 w-72 rounded-full bg-primary-400/40 blur-[80px]" />
        <div className="aurora-2 absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-teal-400/25 blur-[90px]" />
        <div className="aurora-3 absolute right-1/3 top-1/4 h-56 w-56 rounded-full bg-amber-400/10 blur-[90px]" />
      </div>

      {/* Floating sparkle dots */}
      <div className="pointer-events-none absolute inset-0 hidden sm:block">
        <span className="dot-float dot-1 absolute left-[14%] top-[22%] h-1.5 w-1.5 rounded-full bg-primary-300" />
        <span className="dot-float dot-2 absolute right-[16%] top-[30%] h-1 w-1 rounded-full bg-amber-300" />
        <span className="dot-float dot-3 absolute left-[22%] bottom-[18%] h-1 w-1 rounded-full bg-teal-300" />
        <span className="dot-float dot-4 absolute right-[24%] bottom-[24%] h-1.5 w-1.5 rounded-full bg-white/60" />
        <span className="dot-float dot-5 absolute left-[8%] top-[55%] h-1 w-1 rounded-full bg-primary-300" />
        <span className="dot-float dot-6 absolute right-[9%] top-[52%] h-1 w-1 rounded-full bg-teal-300" />
      </div>

      <div
        className={`relative transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
      >
        {/* Icon badge with pulsing ring */}
        <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center">
          <span className="icon-ring absolute inset-0 rounded-2xl bg-primary-400/30" />
          <div className="icon-float relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F4C39]/15 ring-1 ring-[#0F4C39]/40">
            <Mail size={26} className="text-primary-400" strokeWidth={2} />
            <Sparkles
              size={13}
              className="sparkle-spin absolute -right-1 -top-1 text-amber-400"
              strokeWidth={2.5}
            />
          </div>
        </div>

        <span
          className={`inline-block rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-primary-400 ring-1 ring-white/10 transition-all delay-100 duration-700 ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          Stay in the loop
        </span>

        <h2
          className={`heading-shimmer mx-auto mt-4 max-w-lg bg-gradient-to-r from-white via-primary-200 to-white bg-[length:200%_100%] bg-clip-text text-2xl font-black leading-tight tracking-tight text-transparent transition-all delay-150 duration-700 md:text-4xl ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          Get Exclusive Deals in Your Inbox
        </h2>
        <p
          className={`mx-auto mt-3 max-w-md text-sm text-slate-300 transition-all delay-200 duration-700 md:text-base ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          Subscribe for special offers, new arrivals and discount notifications.
        </p>
        <form
          onSubmit={handleSubscribe}
          className={`mx-auto mt-9 flex max-w-md flex-col gap-3 transition-all delay-300 duration-700 sm:flex-row ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          } ${shake ? "shake" : ""}`}
        >
          <div className="relative flex-1">
            <Mail
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 peer-focus:text-primary-400"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={status === "loading" || status === "success"}
              className={`peer w-full rounded-xl border bg-slate-800 py-3.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-400 outline-none transition-all duration-300 disabled:opacity-50 ${
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
                : "btn-shimmer bg-primary-600 hover:-translate-y-0.5 hover:bg-primary-500 hover:shadow-lg hover:shadow-primary-600/30 active:scale-95"
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

        @keyframes iconRing {
          0% {
            transform: scale(0.9);
            opacity: 0.6;
          }
          70% {
            transform: scale(1.5);
            opacity: 0;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        .icon-ring {
          animation: iconRing 2.4s ease-out infinite;
        }

        @keyframes sparkleSpin {
          0%,
          100% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(25deg) scale(1.15);
          }
        }
        .sparkle-spin {
          animation: sparkleSpin 2.5s ease-in-out infinite;
        }

        @keyframes auroraFloat3 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-18px, 22px) scale(1.12);
          }
        }
        .aurora-3 {
          animation: auroraFloat3 10s ease-in-out infinite;
        }

        @keyframes headingShimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        .heading-shimmer {
          animation: headingShimmer 4s linear infinite;
        }

        .border-glow-hard {
          padding: 1.5px;
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }
        .border-glow-hard-spin {
          position: absolute;
          inset: -60%;
          background: conic-gradient(
            from 0deg,
            transparent 0%,
            rgba(74, 222, 128, 0.95) 10%,
            transparent 25%,
            transparent 50%,
            rgba(45, 212, 191, 0.9) 65%,
            transparent 80%,
            transparent 100%
          );
          animation: spinBorder 5s linear infinite;
        }
        @keyframes spinBorder {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes dotFloat {
          0%,
          100% {
            transform: translate(0, 0) scale(0.8);
            opacity: 0.25;
          }
          50% {
            transform: translate(6px, -10px) scale(1.3);
            opacity: 1;
          }
        }
        .dot-float {
          animation: dotFloat 3.2s ease-in-out infinite;
        }
        .dot-1 {
          animation-delay: 0s;
        }
        .dot-2 {
          animation-delay: 0.6s;
        }
        .dot-3 {
          animation-delay: 1.2s;
        }
        .dot-4 {
          animation-delay: 1.8s;
        }
        .dot-5 {
          animation-delay: 2.4s;
        }
        .dot-6 {
          animation-delay: 3s;
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
          .aurora-3,
          .icon-float,
          .icon-ring,
          .sparkle-spin,
          .border-glow-hard-spin,
          .heading-shimmer,
          .dot-float,
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
