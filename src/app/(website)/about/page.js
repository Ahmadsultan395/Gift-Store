"use client";
import { useEffect, useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import PageHeroHeader from "@/components/website/PageHeroHeader";
import { useWebsiteStore } from "@/stores/useWebsiteStore";

export default function AboutPage() {
  const { storeSettings, fetchStoreSettings } = useWebsiteStore();

  useEffect(() => {
    fetchStoreSettings();
  }, []);

  const settings = storeSettings || {};

  const storeName = settings?.storeName || "Pansar Store";
  const aboutText = settings?.cms?.aboutPage;

  return (
    <div className="min-h-screen">
      <PageHeroHeader
        icon="🛒"
        eyebrow="Welcome"
        title={storeName}
        subtitle="Your trusted grocery store — fresh essentials, delivered straight to your door"
        stats={[
          { value: "500+", label: "Products" },
          { value: "1000+", label: "Happy Customers" },
          { value: "4.8", label: "Average Rating" },
          { value: "5+", label: "Years of Service" },
        ]}
      >
        <Link
          href="/products"
          className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary-600 shadow-lg transition-colors hover:bg-[#F3FBEA]"
        >
          🛍️ Shop Now
        </Link>
        <a
          href={`tel:${settings?.phone || ""}`}
          className="rounded-xl border-2 border-white/50 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/20"
        >
          📞 Call Us
        </a>
      </PageHeroHeader>

      <div className="mx-auto max-w-5xl px-4 py-14 space-y-16">
        {/* ── Our Story ─────────────────────────────────────────── */}
        <section className="grid grid-cols-1 gap-10 md:grid-cols-2 items-center">
          <div>
            <span className="inline-block rounded-full bg-green-100 px-4 py-1 text-xs font-bold uppercase tracking-widest text-primary-600 mb-4">
              Our Story
            </span>
            <h2 className="text-3xl font-extrabold text-slate-800 leading-tight">
              From a Small Shop
              <br />
              <span className="text-primary-500">to an Online Store</span>
            </h2>
            <div className="mt-5 text-slate-600 leading-relaxed space-y-3 text-[15px]">
              {aboutText ? (
                aboutText
                  .split("\n")
                  .map((p, i) => p.trim() && <p key={i}>{p}</p>)
              ) : (
                <>
                  <p>
                    We started as a small neighborhood grocery shop. We noticed
                    customers struggling to find quality products easily, so we
                    decided to move online.
                  </p>
                  <p>
                    Today, we deliver fresh groceries, spices, staples, and
                    daily essentials to thousands of customers — all at the best
                    prices.
                  </p>
                  <p>
                    Our mission is simple: give you everything you need, without
                    ever having to leave home.
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { emoji: "🌿", title: "Fresh Products", desc: "Stocked daily" },
              {
                emoji: "💰",
                title: "Best Prices",
                desc: "The best value in town",
              },
              {
                emoji: "🚚",
                title: "Fast Delivery",
                desc: "Same-day in local areas",
              },
              {
                emoji: "✅",
                title: "100% Authentic",
                desc: "Backed by our quality guarantee",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4 hover:border-primary-300 hover:bg-primary-100 transition-all"
              >
                <span className="text-2xl">{f.emoji}</span>
                <p className="mt-2 text-sm font-bold text-slate-800">
                  {f.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Why Choose Us ─────────────────────────────────────── */}
        <section>
          <div className="text-center mb-10">
            <span className="inline-block rounded-full bg-green-100 px-4 py-1 text-xs font-bold uppercase tracking-widest text-primary-500 mb-3">
              Why Choose Us
            </span>
            <h2 className="text-3xl font-extrabold text-slate-800">
              What Sets Us Apart
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              {
                icon: "🛡️",
                title: "Quality Assured",
                desc: "Every product is carefully checked and packed. Expiry dates are always verified.",
                color: "from-green-50 to-emerald-50 border-green-100",
              },
              {
                icon: "⚡",
                title: "Fast & Reliable",
                desc: "Same-day delivery in local areas. Order before 12 PM and get it today.",
                color: "from-blue-50 to-cyan-50 border-blue-100",
              },
              {
                icon: "🤝",
                title: "Trusted for Years",
                desc: "Thousands of families trust us. A 4.8 star rating and a growing community.",
                color: "from-purple-50 to-pink-50 border-purple-100",
              },
            ].map((f) => (
              <div
                key={f.title}
                className={`rounded-2xl border bg-gradient-to-br ${f.color} p-6`}
              >
                <span className="text-4xl">{f.icon}</span>
                <h3 className="mt-4 text-lg font-bold text-slate-800">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Contact ───────────────────────────────────────────── */}
        <section>
          <div className="text-center mb-10">
            <span className="inline-block rounded-full bg-green-100 px-4 py-1 text-xs font-bold uppercase tracking-widest text-primary-500 mb-3">
              Get In Touch
            </span>
            <h2 className="text-3xl font-extrabold text-slate-800">
              Contact Us
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              {
                icon: <Phone size={22} />,
                label: "Phone / WhatsApp",
                value: settings?.phone || "0300-0000000",
                href: `tel:${settings?.phone || ""}`,
                color: "bg-green-600",
                desc: "Mon-Sat, 9am - 9pm",
              },
              {
                icon: <Mail size={22} />,
                label: "Email",
                value: settings?.email || "info@pansarstore.com",
                href: `mailto:${settings?.email || ""}`,
                color: "bg-blue-600",
                desc: "We reply within 24 hours",
              },
              {
                icon: <MapPin size={22} />,
                label: "Address",
                value: settings?.address || "Main Bazaar, Punjab, Pakistan",
                href: "#",
                color: "bg-orange-600",
                desc: "Walk-ins welcome",
              },
            ].map((c) => (
              <a
                key={c.label}
                href={c.href}
                className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center hover:border-primary-200 hover:shadow-md transition-all"
              >
                <div
                  className={`${c.color} mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-white group-hover:scale-110 transition-transform`}
                >
                  {c.icon}
                </div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  {c.label}
                </p>
                <p className="mt-1.5 font-semibold text-slate-800 text-sm">
                  {c.value}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">{c.desc}</p>
              </a>
            ))}
          </div>

          {(settings?.socialLinks?.facebook ||
            settings?.socialLinks?.instagram ||
            settings?.socialLinks?.whatsapp) && (
            <div className="mt-6 flex justify-center gap-4">
              {settings.socialLinks.facebook && (
                <a
                  href={settings.socialLinks.facebook}
                  target="_blank"
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  <Facebook size={16} /> Facebook
                </a>
              )}
              {settings.socialLinks.instagram && (
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  className="flex items-center gap-2 rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-pink-700 transition-colors"
                >
                  <Instagram size={16} /> Instagram
                </a>
              )}
              {settings.socialLinks.whatsapp && (
                <a
                  href={`https://wa.me/${settings.socialLinks.whatsapp}`}
                  target="_blank"
                  className="flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600/80 transition-colors"
                >
                  💬 WhatsApp
                </a>
              )}
            </div>
          )}
        </section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <section className="rounded-3xl bg-gradient-to-br from-[#0F4C39] to-[#0B3D2E] p-10 text-center text-white">
          <h2 className="text-2xl font-extrabold">Order Today!</h2>
          <p className="mt-2 text-white/75">
            Fresh groceries, best prices, fast delivery — with {storeName}
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3 text-sm font-bold text-white shadow-lg transition-colors hover:bg-accent/80"
          >
            <ShoppingBag size={16} /> Browse Products
          </Link>
        </section>
      </div>
    </div>
  );
}
