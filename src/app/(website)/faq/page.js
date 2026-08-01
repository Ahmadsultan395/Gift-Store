"use client";
import { useEffect, useState } from "react";
import { HelpCircle } from "lucide-react";
import PageHeroHeader from "@/components/website/PageHeroHeader";
import FaqSection from "@/components/website/FaqSection";
import { useWebsiteStore } from "@/stores/useWebsiteStore";

export default function FAQPage() {
  const { storeSettings, fetchStoreSettings } = useWebsiteStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoreSettings().finally(() => setLoading(false));
  }, []);

  const faqs = storeSettings?.faqs || [];

  return (
    <main className="min-h-screen bg-white">
      <PageHeroHeader
        icon="❓"
        eyebrow="Help Center"
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about our store"
        compact
      />

      <div className="mx-auto max-w-2xl px-5 py-12">
        <FaqSection faqs={faqs} loading={loading} />

        {/* Contact CTA */}
        <div className="mt-10 overflow-hidden rounded-[28px] border border-primary-100 bg-primary-50/40">
          <div className="px-8 py-8 text-center">
            <p className="text-base font-bold text-slate-800">
              Still have a question?
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Get in touch with us directly
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {storeSettings?.phone && (
                <a
                  href={`tel:${storeSettings.phone}`}
                  className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-700"
                >
                  📞 {storeSettings.phone}
                </a>
              )}
              {storeSettings?.socialLinks?.whatsapp && (
                <a
                  href={`https://wa.me/${storeSettings.socialLinks.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-primary-300 bg-white px-5 py-2.5 text-sm font-semibold text-primary-700 transition-all hover:bg-primary-50"
                >
                  💬 WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
