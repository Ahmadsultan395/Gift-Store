"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Gift,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Send,
  CheckCircle2,
  Loader2,
  Sparkles,
  Ribbon,
  PartyPopper,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useWebsiteStore } from "@/stores/useWebsiteStore";
import Image from "next/image";

const quickLinks = [
  ["Home", "/"],
  ["Products", "/products"],
  ["Cart", "/cart"],
  ["My Orders", "/account/orders"],
  ["Contact", "/contact"],
  ["Faqs", "/faq"],
];

const policies = [
  ["Privacy Policy", "/privacy"],
  ["Return Policy", "/return-policy"],
  ["Terms & Conditions", "/terms"],
];

const socials = {
  facebook: Facebook,
  instagram: Instagram,
  whatsapp: FaWhatsapp,
  youtube: Youtube,
};

const linkStyle =
  "group flex items-center gap-3 text-sm text-primary-100/80 transition-all duration-500 ease-out hover:text-secondary-300 hover:translate-x-1";

function FooterLink({ name, url }) {
  return (
    <Link href={url} className={linkStyle}>
      <span className="h-1 w-0 rounded bg-secondary-400 transition-all duration-500 ease-out group-hover:w-3" />
      {name}
    </Link>
  );
}

function ContactItem({ icon: Icon, value, href }) {
  if (!value) return null;

  return (
    <a href={href} className={linkStyle}>
      <span
        className="
        h-10 w-10 shrink-0 rounded-full
        bg-primary-900
        border border-primary-800
        flex items-center justify-center
        text-secondary-400
        transition-all duration-500
        group-hover:bg-secondary-500
        group-hover:text-primary-950
        group-hover:scale-110
        "
      >
        <Icon size={16} />
      </span>

      <span>{value}</span>
    </a>
  );
}

// ---- Newsletter (merged into Footer, same functionality as NewsletterSection) ----
function FooterNewsletter() {
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
    <div
      className={`
fn-border-glow
group/card relative overflow-hidden rounded-2xl
bg-gradient-to-br from-primary-900/80 via-primary-900/60 to-primary-950/80
px-6 py-8 sm:px-10
mb-14
shadow-xl shadow-black/30
transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
hover:shadow-secondary-500/10 hover:-translate-y-0.5
${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
${shake ? "footer-newsletter-shake" : ""}
`}
    >
      {/* animated gradient border ring */}
      <div className="fn-border-ring pointer-events-none absolute inset-0 rounded-2xl" />
      <div className="pointer-events-none absolute inset-[1px] rounded-2xl bg-primary-950/40" />

      {/* radial glow, brightens on hover — warm gold glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,162,39,0.18),transparent_60%)] opacity-80 transition-opacity duration-500 group-hover/card:opacity-100" />

      {/* aurora blobs — always drifting, brighten further on hover */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="fn-aurora-1 absolute -left-10 top-0 h-40 w-40 rounded-full bg-secondary-400/25 blur-[60px] opacity-40 transition-opacity duration-500 group-hover/card:opacity-100" />
        <div className="fn-aurora-2 absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-primary-400/20 blur-[70px] opacity-40 transition-opacity duration-500 group-hover/card:opacity-100" />
      </div>

      {/* decorative sparkle accents, gift-shop touch — gentle twinkle */}
      <Sparkles
        size={70}
        className="fn-twinkle pointer-events-none absolute -right-4 -top-4 text-secondary-400/20 rotate-12"
      />
      <Gift
        size={50}
        strokeWidth={1.3}
        className="fn-twinkle-delay pointer-events-none absolute -left-2 -bottom-3 text-secondary-400/15 -rotate-12"
      />

      <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="group/icon flex items-center gap-4">
          <span className="relative hidden h-11 w-11 shrink-0 items-center justify-center sm:flex">
            <span className="fn-icon-ring absolute inset-0 scale-90 rounded-xl bg-secondary-400/30 opacity-0 transition-opacity duration-300 group-hover/icon:opacity-100" />
            <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-secondary-500/15 text-secondary-400 ring-1 ring-secondary-500/30 transition-transform duration-300 group-hover/icon:-translate-y-1 group-hover/icon:scale-105">
              <Gift size={20} />
            </span>
          </span>
          <div>
            <h3 className="fn-shimmer-text text-base font-bold sm:text-lg">
              Get Exclusive Gift Deals in Your Inbox
            </h3>
            <p className="mt-1 text-xs text-primary-100/70 sm:text-sm">
              Subscribe for special offers, new arrivals and discount
              notifications.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubscribe}
          className="flex w-full max-w-md flex-col gap-3 sm:w-auto sm:flex-row"
        >
          <div className="relative flex-1">
            <Mail
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-300/70"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={status === "loading" || status === "success"}
              className={`w-full rounded-xl border bg-primary-950/60 py-3 pl-9 pr-3 text-sm text-white placeholder:text-primary-300/50 outline-none transition-all duration-300 disabled:opacity-50 ${
                status === "error"
                  ? "border-red-500/70 focus:border-red-400"
                  : "border-primary-700 focus:border-secondary-500 focus:shadow-[0_0_0_4px_rgba(201,162,39,0.18)]"
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading" || status === "success"}
            className={`fn-btn-shimmer relative overflow-hidden flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-secondary-500 px-6 py-3 text-sm font-bold text-primary-950 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-secondary-500/30 active:scale-95 disabled:opacity-80 disabled:translate-y-0 disabled:hover:shadow-none`}
          >
            {status === "loading" && (
              <>
                <Loader2 size={15} className="animate-spin" />
                Subscribing…
              </>
            )}
            {status === "success" && (
              <span className="fn-check-in flex items-center gap-2">
                <CheckCircle2 size={16} strokeWidth={2.5} />
                Subscribed
              </span>
            )}
            {(status === "idle" || status === "error") && (
              <>
                <Send size={14} />
                Subscribe
              </>
            )}
          </button>
        </form>
      </div>

      <div className="relative mt-2 h-4 text-center sm:text-left">
        {status === "error" && (
          <p className="fn-msg-in text-xs font-medium text-red-400">
            {errorMsg}
          </p>
        )}
        {status === "success" && (
          <p className="fn-msg-in text-xs font-medium text-secondary-300">
            🎁 Thanks! Check your inbox for a confirmation.
          </p>
        )}
      </div>

      <style jsx>{`
        /* animated conic gradient border — the premium "gift wrap ribbon" ring */
        .fn-border-glow {
          position: relative;
        }
        .fn-border-ring {
          padding: 1px;
          background: conic-gradient(
            from var(--fn-angle, 0deg),
            rgba(201, 162, 39, 0.15),
            rgba(233, 208, 115, 0.55),
            rgba(201, 162, 39, 0.15) 25%,
            rgba(122, 31, 43, 0.25) 50%,
            rgba(201, 162, 39, 0.15) 75%,
            rgba(233, 208, 115, 0.55),
            rgba(201, 162, 39, 0.15)
          );
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: fnBorderRotate 5s linear infinite;
        }
        @property --fn-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes fnBorderRotate {
          to {
            --fn-angle: 360deg;
          }
        }

        /* shimmering gold-white sweep across the heading text */
        .fn-shimmer-text {
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
          animation: fnShimmerText 4s ease-in-out infinite;
        }
        @keyframes fnShimmerText {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -60% 0;
          }
        }

        @keyframes fnTwinkle {
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
        .fn-twinkle {
          animation: fnTwinkle 3.5s ease-in-out infinite;
        }
        .fn-twinkle-delay {
          animation: fnTwinkle 3.5s ease-in-out infinite;
          animation-delay: 1.2s;
        }

        @keyframes footerNewsletterShake {
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
        .footer-newsletter-shake {
          animation: footerNewsletterShake 0.4s ease;
        }

        @keyframes fnAuroraFloat1 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(18px, 12px) scale(1.1);
          }
        }
        @keyframes fnAuroraFloat2 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-16px, -10px) scale(1.08);
          }
        }
        /* aurora only animates while the card is hovered (opacity is 0 otherwise) */
        .group\\/card:hover .fn-aurora-1 {
          animation: fnAuroraFloat1 6s ease-in-out infinite;
        }
        .group\\/card:hover .fn-aurora-2 {
          animation: fnAuroraFloat2 7s ease-in-out infinite;
        }

        @keyframes fnIconRing {
          0% {
            transform: scale(0.9);
            opacity: 0.6;
          }
          70%,
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        .group\\/icon:hover .fn-icon-ring {
          animation: fnIconRing 1s ease-out infinite;
        }

        /* shimmer sweep only plays on hover, resets when not hovered */
        .fn-btn-shimmer {
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
        .fn-btn-shimmer:hover:not(:disabled) {
          animation: fnShimmerMove 1.2s ease-in-out infinite;
        }
        @keyframes fnShimmerMove {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -50% 0;
          }
        }

        @keyframes fnCheckIn {
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
        .fn-check-in {
          animation: fnCheckIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes fnMsgIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .fn-msg-in {
          animation: fnMsgIn 0.3s ease both;
        }

        @media (prefers-reduced-motion: reduce) {
          .footer-newsletter-shake,
          .fn-aurora-1,
          .fn-aurora-2,
          .fn-icon-ring,
          .fn-btn-shimmer,
          .fn-check-in,
          .fn-msg-in,
          .fn-border-ring,
          .fn-shimmer-text,
          .fn-twinkle,
          .fn-twinkle-delay {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
// ---- End Newsletter ----

// ---- Premium decorative background (dot grid + floating gift icons + sparkles) ----
function FooterBgDecor() {
  const floaters = [
    { Icon: Gift, top: "8%", left: "6%", size: 26, delay: "0s", dur: "9s" },
    {
      Icon: Sparkles,
      top: "18%",
      left: "88%",
      size: 20,
      delay: "1.2s",
      dur: "7s",
    },
    {
      Icon: Ribbon,
      top: "62%",
      left: "3%",
      size: 22,
      delay: "2.1s",
      dur: "10s",
    },
    {
      Icon: PartyPopper,
      top: "72%",
      left: "92%",
      size: 24,
      delay: "0.6s",
      dur: "8s",
    },
    {
      Icon: Sparkles,
      top: "42%",
      left: "50%",
      size: 16,
      delay: "1.8s",
      dur: "11s",
    },
    {
      Icon: Gift,
      top: "88%",
      left: "40%",
      size: 18,
      delay: "2.6s",
      dur: "9.5s",
    },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* premium gradient mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-56 w-[520px] bg-secondary-500/15 blur-[110px]" />
      <div className="absolute bottom-0 right-0 h-64 w-64 bg-primary-500/15 blur-[110px]" />
      <div className="absolute bottom-10 left-0 h-48 w-48 bg-secondary-600/10 blur-[100px]" />

      {/* subtle dot grid, gives a premium wrapping-paper texture */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          color: "#C9A227",
        }}
      />

      {/* floating gift-themed icons */}
      {floaters.map(({ Icon, top, left, size, delay, dur }, i) => (
        <span
          key={i}
          className="fbg-float absolute text-secondary-500/15"
          style={{
            top,
            left,
            animationDelay: delay,
            animationDuration: dur,
          }}
        >
          <Icon size={size} strokeWidth={1.5} />
        </span>
      ))}

      <style jsx>{`
        @keyframes fbgFloat {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.35;
          }
          50% {
            transform: translateY(-14px) rotate(8deg);
            opacity: 0.7;
          }
        }
        .fbg-float {
          animation: fbgFloat 8s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .fbg-float,
          .fbg-sweep {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
// ---- End decorative background ----

export default function Footer() {
  const { storeSettings, fetchStoreSettings } = useWebsiteStore();

  useEffect(() => {
    fetchStoreSettings();
  }, []);

  const form = storeSettings || {};

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-primary-950 via-primary-950 to-primary-900 text-primary-100/80">
      <FooterBgDecor />

      {/* top gold hairline, premium separator from page content */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-secondary-500/50 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-5 py-16">
        <FooterNewsletter />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* BRAND */}

          <div>
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <span className="relative flex h-12 w-12 shrink-0">
                <span className="footer-logo-pulse absolute inset-0 rounded-xl bg-secondary-500/40" />
                <span
                  className="
relative h-12 w-12 rounded-xl
bg-gradient-to-br from-secondary-400 to-secondary-600
flex items-center justify-center
text-primary-950 shadow-lg shadow-secondary-900/40
ring-1 ring-secondary-300/40
transition-transform duration-700
group-hover:scale-110
group-hover:rotate-6
"
                >
                  {storeSettings?.logo?.url ? (
                    <Image
                      src={storeSettings.logo.url}
                      alt={storeSettings?.storeName || "Store Logo"}
                      width={44}
                      height={44}
                      className="h-full w-full rounded-lg object-contain"
                    />
                  ) : (
                    <Gift size={21} className="h-4 w-4 sm:h-6 sm:w-6" />
                  )}
                </span>
              </span>

              <span
                className="
text-xl font-bold text-white
group-hover:text-secondary-400
transition-colors duration-500
"
              >
                {form.storeName || "Gift Store"}
              </span>
            </Link>

            <p className="text-sm leading-7 text-primary-100/70">
              {form.description ||
                "Curated gifts and premium products for every celebration, wrapped with care and delivered with love."}
            </p>

            <div className="flex gap-3 mt-6">
              {Object.entries(socials).map(([key, Icon]) => {
                if (!form.socialLinks?.[key]) return null;

                let href = form.socialLinks[key];

                if (key === "whatsapp") {
                  const number = href.replace(/\D/g, "");
                  href = `https://wa.me/${number}`;
                }

                return (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={
                      key === "facebook"
                        ? "Facebook"
                        : key === "instagram"
                          ? "Instagram"
                          : key === "whatsapp"
                            ? "WhatsApp"
                            : "YouTube"
                    }
                    className="
        h-10 w-10 rounded-full
        bg-primary-900
        border border-primary-800
        flex items-center justify-center
        text-primary-100/80
        transition-all duration-500 ease-out
        hover:bg-secondary-500
        hover:text-primary-950
        hover:-translate-y-1.5
        hover:scale-110
        hover:shadow-lg hover:shadow-secondary-500/30
        hover:border-secondary-400
      "
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* LINKS */}

          {[
            ["Quick Links", quickLinks],
            ["Policies", policies],
          ].map(([title, items]) => (
            <div key={title}>
              <h3
                className="
text-secondary-400 text-sm font-semibold
uppercase tracking-[.2em]
mb-6
"
              >
                {title}
              </h3>

              <ul className="space-y-4">
                {items.map(([name, url]) => (
                  <li key={url}>
                    <FooterLink name={name} url={url} />
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* CONTACT */}

          <div>
            <h3
              className="
text-secondary-400 text-sm font-semibold
uppercase tracking-[.2em]
mb-6
"
            >
              Contact
            </h3>

            <div className="space-y-5">
              <ContactItem
                icon={Phone}
                value={form.phone}
                href={`tel:${form.phone}`}
              />

              <ContactItem
                icon={Mail}
                value={form.email}
                href={`mailto:${form.email}`}
              />

              <ContactItem
                icon={MapPin}
                value={form.address}
                href={`https://www.google.com/maps/search/${encodeURIComponent(form.address || "")}`}
              />
            </div>
          </div>
        </div>

        <div
          className="
mt-14 pt-6
border-t border-primary-800
flex flex-col sm:flex-row
justify-between items-center
gap-3
text-xs text-primary-200/60
"
        >
          <p>
            © {new Date().getFullYear()} {form.storeName || "Gift Store"}. All
            rights reserved.
          </p>

          <p className="flex items-center gap-1.5 hover:text-secondary-400 transition-colors duration-300">
            <Gift size={13} className="text-secondary-500" />
            Premium Gifting Experience
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes footerLogoPulse {
          0% {
            transform: scale(0.85);
            opacity: 0.55;
          }
          70%,
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        .footer-logo-pulse {
          animation: footerLogoPulse 2.2s ease-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .footer-logo-pulse {
            animation: none !important;
          }
        }
      `}</style>
    </footer>
  );
}
