"use client";
import { useEffect, useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  ShoppingBag,
  Gift,
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

  const storeName = settings?.storeName || "Gift Store";
  const aboutText = settings?.cms?.aboutPage;

  return (
    <div className="min-h-screen">
      <PageHeroHeader
        icon="🎁"
        eyebrow="Welcome"
        title={storeName}
        subtitle="Your trusted gift shop — curated presents and premium keepsakes, wrapped with care"
        stats={[
          { value: "500+", label: "Products" },
          { value: "1000+", label: "Happy Customers" },
          { value: "4.8", label: "Average Rating" },
          { value: "5+", label: "Years of Service" },
        ]}
      >
        <Link
          href="/products"
          className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary-600 shadow-lg transition-colors hover:bg-secondary-50"
        >
          🎁 Shop Now
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
            <span className="inline-block rounded-full bg-secondary-100 px-4 py-1 text-xs font-bold uppercase tracking-widest text-primary-600 mb-4">
              Our Story
            </span>
            <h2 className="text-3xl font-extrabold text-slate-800 leading-tight">
              From a Small Shop
              <br />
              <span className="text-primary-600">
                to Your Favorite Gift Store
              </span>
            </h2>
            <div className="mt-5 text-slate-600 leading-relaxed space-y-3 text-[15px]">
              {aboutText ? (
                aboutText
                  .split("\n")
                  .map((p, i) => p.trim() && <p key={i}>{p}</p>)
              ) : (
                <>
                  <p>
                    We started as a small neighborhood gift shop. We noticed
                    customers struggling to find thoughtful, quality gifts
                    easily, so we decided to move online.
                  </p>
                  <p>
                    Today, we curate and deliver beautifully wrapped gifts,
                    keepsakes, and celebration essentials to thousands of
                    customers — all at the best prices.
                  </p>
                  <p>
                    Our mission is simple: help you find the perfect gift for
                    every occasion, without ever having to leave home.
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { emoji: "🎀", title: "Curated Gifts", desc: "Handpicked daily" },
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
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4 hover:border-secondary-300 hover:bg-secondary-50 transition-all"
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
            <span className="inline-block rounded-full bg-secondary-100 px-4 py-1 text-xs font-bold uppercase tracking-widest text-primary-600 mb-3">
              Why Choose Us
            </span>
            <h2 className="text-3xl font-extrabold text-slate-800">
              What Sets Us Apart
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              {
                icon: "🎁",
                title: "Quality Assured",
                desc: "Every gift is carefully checked, wrapped and packed with care before it reaches you.",
                color: "from-primary-50 to-secondary-50 border-primary-100",
              },
              {
                icon: "⚡",
                title: "Fast & Reliable",
                desc: "Same-day delivery in local areas. Order before 12 PM and get it today.",
                color: "from-secondary-50 to-amber-50 border-secondary-100",
              },
              {
                icon: "🤝",
                title: "Trusted for Years",
                desc: "Thousands of families trust us. A 4.8 star rating and a growing community.",
                color: "from-primary-50 to-rose-50 border-primary-100",
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
            <span className="inline-block rounded-full bg-secondary-100 px-4 py-1 text-xs font-bold uppercase tracking-widest text-primary-600 mb-3">
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
                color: "bg-primary-600",
                desc: "Mon-Sat, 9am - 9pm",
              },
              {
                icon: <Mail size={22} />,
                label: "Email",
                value: settings?.email || "info@giftstore.com",
                href: `mailto:${settings?.email || ""}`,
                color: "bg-secondary-600",
                desc: "We reply within 24 hours",
              },
              {
                icon: <MapPin size={22} />,
                label: "Address",
                value: settings?.address || "Main Bazaar, Punjab, Pakistan",
                href: "#",
                color: "bg-primary-800",
                desc: "Walk-ins welcome",
              },
            ].map((c) => (
              <a
                key={c.label}
                href={c.href}
                className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center hover:border-secondary-300 hover:shadow-md transition-all"
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
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              {settings.socialLinks.facebook && (
                <a
                  href={settings.socialLinks.facebook}
                  target="_blank"
                  className="flex items-center gap-2 rounded-xl bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-800 transition-colors"
                >
                  <Facebook size={16} /> Facebook
                </a>
              )}
              {settings.socialLinks.instagram && (
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 transition-colors"
                >
                  <Instagram size={16} /> Instagram
                </a>
              )}
              {settings.socialLinks.whatsapp && (
                <a
                  href={`https://wa.me/${settings.socialLinks.whatsapp}`}
                  target="_blank"
                  className="flex items-center gap-2 rounded-xl bg-secondary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-secondary-700 transition-colors"
                >
                  💬 WhatsApp
                </a>
              )}
            </div>
          )}
        </section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900 to-primary-700 p-10 text-center text-white">
          <Gift
            size={140}
            strokeWidth={1}
            className="pointer-events-none absolute -right-6 -top-6 text-secondary-400/10 rotate-12"
          />
          <h2 className="relative text-2xl font-extrabold">Order Today!</h2>
          <p className="relative mt-2 text-white/75">
            Curated gifts, best prices, fast delivery — with {storeName}
          </p>
          <Link
            href="/products"
            className="relative mt-6 inline-flex items-center gap-2 rounded-xl bg-secondary-500 px-8 py-3 text-sm font-bold text-primary-950 shadow-lg transition-colors hover:bg-secondary-400"
          >
            <ShoppingBag size={16} /> Browse Products
          </Link>
        </section>
      </div>
    </div>
  );
}
