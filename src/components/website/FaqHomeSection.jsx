"use client";
import { useEffect, useState } from "react";
import { HelpCircle } from "lucide-react";
import FaqSection from "@/components/website/FaqSection";
import { useWebsiteStore } from "@/stores/useWebsiteStore";

export default function FaqHomeSection() {
  const { storeSettings, fetchStoreSettings } = useWebsiteStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoreSettings().finally(() => setLoading(false));
  }, []);

  const faqs = storeSettings?.faqs || [];

  return (
    <section className="py-4">
      <div className="mb-10 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary-500">
          <HelpCircle size={12} />
          Help Center
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          Frequently Asked Questions
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Answers to what customers ask us most
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <FaqSection faqs={faqs} loading={loading} />
      </div>
    </section>
  );
}
