"use client";
import { useEffect } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  MessageCircle,
  Clock,
} from "lucide-react";
import PageHeroHeader from "@/components/website/PageHeroHeader";
import ContactForm from "@/components/website/ContactForm";
import { useWebsiteStore } from "@/stores/useWebsiteStore";

// ── Info card ──────────────────────────────────────────────────────
function InfoCard({ icon: Icon, label, value, href, color }) {
  const inner = (
    <div
      className={`group flex items-start gap-4 rounded-2xl border p-5 transition-all hover:shadow-md ${color.border} bg-white`}
    >
      <div
        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${color.icon}`}
      >
        <Icon size={22} className={color.iconText} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-slate-800 leading-snug">
          {value}
        </p>
      </div>
    </div>
  );
  return href ? (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
    >
      {inner}
    </a>
  ) : (
    <div>{inner}</div>
  );
}

export default function ContactPage() {
  const { storeSettings, fetchStoreSettings } = useWebsiteStore();

  useEffect(() => {
    fetchStoreSettings();
  }, []);

  const s = storeSettings;

  return (
    <main className="min-h-screen bg-white">
      <PageHeroHeader
        icon="💬"
        eyebrow="Contact Us"
        title="Get in Touch"
        subtitle="Have a question, suggestion, or complaint? We're here to help — you'll hear back soon."
        compact
      />

      <div className="mx-auto max-w-5xl px-5 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* ── Left: Info cards ────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Direct Contact
            </p>

            {s?.phone && (
              <InfoCard
                icon={Phone}
                label="Phone / WhatsApp"
                value={s.phone}
                href={`tel:${s.phone}`}
                color={{
                  border: "border-primary-100 hover:border-primary-300",
                  icon: "bg-primary-100",
                  iconText: "text-primary-600",
                }}
              />
            )}
            {s?.email && (
              <InfoCard
                icon={Mail}
                label="Email"
                value={s.email}
                href={`mailto:${s.email}`}
                color={{
                  border: "border-blue-100 hover:border-blue-300",
                  icon: "bg-blue-100",
                  iconText: "text-blue-600",
                }}
              />
            )}
            {s?.address && (
              <InfoCard
                icon={MapPin}
                label="Address"
                value={s.address}
                color={{
                  border: "border-orange-100 hover:border-orange-300",
                  icon: "bg-orange-100",
                  iconText: "text-orange-500",
                }}
              />
            )}

            {/* Hours */}
            <InfoCard
              icon={Clock}
              label="Business Hours"
              value="Mon–Sun: 9am – 9pm"
              color={{
                border: "border-purple-100 hover:border-purple-300",
                icon: "bg-purple-100",
                iconText: "text-purple-600",
              }}
            />

            {/* Social links */}
            {(s?.socialLinks?.facebook ||
              s?.socialLinks?.instagram ||
              s?.socialLinks?.whatsapp) && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                  Social Media
                </p>
                <div className="flex flex-wrap gap-2">
                  {s.socialLinks.facebook && (
                    <a
                      href={s.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
                    >
                      <Facebook size={14} /> Facebook
                    </a>
                  )}
                  {s.socialLinks.instagram && (
                    <a
                      href={s.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 text-xs font-bold text-white hover:opacity-90 transition-opacity"
                    >
                      <Instagram size={14} /> Instagram
                    </a>
                  )}
                  {s.socialLinks.whatsapp && (
                    <a
                      href={`https://wa.me/${s.socialLinks.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-xs font-bold text-white hover:bg-primary-600 transition-colors"
                    >
                      <MessageCircle size={14} /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Contact Form ──────────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <h2 className="mb-1 text-lg font-bold text-slate-800">
                Send a Message
              </h2>
              <p className="mb-6 text-sm text-slate-500">
                Fill out the form below — we'll reply within 24 hours
              </p>

              <ContactForm />

              <p className="mt-4 text-center text-xs text-slate-400">
                Or reach us directly on WhatsApp
                {s?.socialLinks?.whatsapp ? ` — ` : ""}
                {s?.socialLinks?.whatsapp && (
                  <a
                    href={`https://wa.me/${s.socialLinks.whatsapp}`}
                    target="_blank"
                    rel="noopener"
                    className="font-semibold text-primary-600 hover:underline"
                  >
                    {s.socialLinks.whatsapp}
                  </a>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
