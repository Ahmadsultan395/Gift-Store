"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Store,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Send,
  CheckCircle2,
  Loader2,
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
  "group flex items-center gap-3 text-sm text-slate-300 transition-all duration-500 ease-out hover:text-white hover:translate-x-1";

function FooterLink({ name, url }) {
  return (
    <Link href={url} className={linkStyle}>
      <span className="h-1 w-0 rounded bg-primary-500 transition-all duration-500 ease-out group-hover:w-3" />
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
        bg-slate-900
        flex items-center justify-center
        text-primary-500
        transition-all duration-500
        group-hover:bg-primary-500
        group-hover:text-white
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
group/card relative overflow-hidden rounded-2xl
border border-slate-800 bg-slate-900/60
px-6 py-8 sm:px-10
mb-14
transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
hover:border-primary-500/40 hover:bg-slate-900/80
${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
${shake ? "footer-newsletter-shake" : ""}
`}
    >
      {/* radial glow, brightens on hover */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.10),transparent_60%)] opacity-70 transition-opacity duration-500 group-hover/card:opacity-100" />

      {/* aurora blobs — static, only drift while card is hovered */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="fn-aurora-1 absolute -left-10 top-0 h-40 w-40 rounded-full bg-primary-400/20 blur-[60px] opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" />
        <div className="fn-aurora-2 absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-teal-400/15 blur-[70px] opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" />
      </div>

      <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="group/icon flex items-center gap-4">
          <span className="relative hidden h-11 w-11 shrink-0 items-center justify-center sm:flex">
            <span className="fn-icon-ring absolute inset-0 scale-90 rounded-xl bg-primary-400/30 opacity-0 transition-opacity duration-300 group-hover/icon:opacity-100" />
            <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-primary-500/15 text-primary-400 ring-1 ring-primary-500/30 transition-transform duration-300 group-hover/icon:-translate-y-1 group-hover/icon:scale-105">
              <Mail size={20} />
            </span>
          </span>
          <div>
            <h3 className="text-base font-bold text-white sm:text-lg">
              Get Exclusive Deals in Your Inbox
            </h3>
            <p className="mt-1 text-xs text-slate-400 sm:text-sm">
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
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={status === "loading" || status === "success"}
              className={`w-full rounded-xl border bg-slate-800 py-3 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-300 disabled:opacity-50 ${
                status === "error"
                  ? "border-red-500/70 focus:border-red-400"
                  : "border-slate-700 focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(22,163,74,0.15)]"
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading" || status === "success"}
            className={`fn-btn-shimmer relative overflow-hidden flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-600/30 active:scale-95 disabled:opacity-80 disabled:translate-y-0 disabled:hover:shadow-none`}
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
          <p className="fn-msg-in text-xs font-medium text-primary-300">
            🎉 Thanks! Check your inbox for a confirmation.
          </p>
        )}
      </div>

      <style jsx>{`
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
        /* .fn-btn-shimmer {
          background-image: linear-gradient(
            110deg,
            #16a34a 0%,
            #16a34a 40%,
            #4ade80 50%,
            #16a34a 60%,
            #16a34a 100%
          );
          background-size: 250% 100%;
          background-position: 0% 0;
        } */
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
          .fn-msg-in {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
// ---- End Newsletter ----

export default function Footer() {
  const { storeSettings, fetchStoreSettings } = useWebsiteStore();

  useEffect(() => {
    fetchStoreSettings();
  }, []);

  const form = storeSettings || {};

  return (
    <footer className="relative overflow-hidden bg-slate-950 text-slate-300">
      <div
        className="
absolute top-0 left-1/2
-translate-x-1/2
h-44 w-[420px]
bg-primary-500/10
blur-[90px]
"
      />

      <div className="relative max-w-7xl mx-auto px-5 py-16">
        <FooterNewsletter />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* BRAND */}

          <div>
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <span
                className="
h-12 w-12 rounded-xl
bg-primary-500
flex items-center justify-center
text-white shadow-lg
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
                  <Store size={21} className="h-4 w-4 sm:h-6 sm:w-6" />
                )}
              </span>

              <span
                className="
text-xl font-bold text-white
group-hover:text-primary-400
"
              >
                {form.storeName || "Store"}
              </span>
            </Link>

            <p className="text-sm leading-7 text-slate-300">
              {form.description ||
                "Premium products with trusted quality and smooth shopping experience."}
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
                    className="
        h-10 w-10 rounded-full
        bg-slate-900
        border border-slate-800
        flex items-center justify-center
        text-slate-300
        transition-all duration-500
        hover:bg-primary-500
        hover:text-white
        hover:-translate-y-1
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
text-white text-sm font-semibold
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
text-white text-sm font-semibold
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
border-t border-slate-800
flex flex-col sm:flex-row
justify-between items-center
gap-3
text-xs text-slate-400
"
        >
          <p>
            © {new Date().getFullYear()} {form.storeName || "Store"}. All rights
            reserved.
          </p>

          <p className="hover:text-white">Premium Shopping Experience</p>
        </div>
      </div>
    </footer>
  );
}
