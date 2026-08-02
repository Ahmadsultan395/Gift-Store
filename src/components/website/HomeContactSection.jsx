"use client";
import { useEffect } from "react";
import Link from "next/link";
import { MessageCircle, ArrowRight } from "lucide-react";
import ContactForm from "@/components/website/ContactForm";
import { useWebsiteStore } from "@/stores/useWebsiteStore";

/**
 * Homepage "Get in Touch" section — proper section header (same
 * pattern as TestimonialsSection / FaqHomeSection) wrapping the
 * shared ContactForm (compact mode), plus phone/WhatsApp quick links
 * and a link through to the full /contact page.
 *
 * Uses the same ContactForm as the full /contact page — compact mode
 * only changes spacing/labels, it still collects name, phone, email,
 * subject, and message, so the admin inbox gets complete info either
 * way.
 *
 * Place this AFTER FaqHomeSection and BEFORE NewsletterSection:
 *   ...FaqHomeSection -> HomeContactSection -> NewsletterSection
 */
export default function HomeContactSection() {
  const { storeSettings, fetchStoreSettings } = useWebsiteStore();

  useEffect(() => {
    fetchStoreSettings();
  }, [fetchStoreSettings]);

  const s = storeSettings;

  return (
    <section className="py-4">
      <div className="mb-10 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary-500">
          <MessageCircle size={12} />
          Get in Touch
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          Still Have a Question?
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Reach us directly, or send a quick message below
        </p>
      </div>

      <div className="mx-auto max-w-2xl overflow-hidden rounded-[28px] border border-primary-100 bg-primary-50/40">
        <div className="px-6 py-8 text-center sm:px-8">
          {(s?.phone || s?.socialLinks?.whatsapp) && (
            <div className="mb-6 flex flex-wrap justify-center gap-3">
              {s?.phone && (
                <a
                  href={`tel:${s.phone}`}
                  className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-700"
                >
                  📞 {s.phone}
                </a>
              )}
              {s?.socialLinks?.whatsapp && (
                <a
                  href={`https://wa.me/${s.socialLinks.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-primary-300 bg-white px-5 py-2.5 text-sm font-semibold text-primary-700 transition-all hover:bg-primary-50"
                >
                  💬 WhatsApp
                </a>
              )}
            </div>
          )}

          <ContactForm compact />

          <Link
            href="/contact"
            className="group mt-5 inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
          >
            Need to add more detail? Visit full Contact page
            <ArrowRight
              size={13}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
