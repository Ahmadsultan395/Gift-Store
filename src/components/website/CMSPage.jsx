"use client";
import { useEffect, useState } from "react";
import PageHeroHeader from "@/components/website/PageHeroHeader";
import { useWebsiteStore } from "@/stores/useWebsiteStore";

export default function CMSPage({
  title,
  subtitle,
  icon,
  defaultContent,
  settingsKey,
}) {
  const { storeSettings, settingsLoaded, fetchStoreSettings } =
    useWebsiteStore();

  useEffect(() => {
    fetchStoreSettings();
  }, [fetchStoreSettings]);

  const loading = !settingsLoaded;
  const cmsContent = storeSettings?.cms?.[settingsKey];
  const content = cmsContent && cmsContent.trim() ? cmsContent : defaultContent;
  const storeName = storeSettings?.storeName || "Pansar Store";

  return (
    <div className="min-h-screen bg-white">
      <PageHeroHeader
        icon={icon}
        eyebrow={`Last updated: ${new Date().toLocaleDateString("en-PK", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`}
        title={title}
        subtitle={subtitle.replace("{store}", storeName)}
        compact
      />

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-4 animate-pulse rounded-full bg-slate-100"
                  style={{ width: `${70 + i * 5}%` }}
                />
              ))}
            </div>
          ) : (
            <div className="prose prose-slate max-w-none">
              {content.split("\n\n").map((block, i) => {
                const trimmed = block.trim();
                if (!trimmed) return null;

                // Heading (starts with ##)
                if (trimmed.startsWith("## ")) {
                  return (
                    <h2
                      key={i}
                      className="mt-8 mb-3 first:mt-0 text-xl font-bold text-slate-800 flex items-center gap-2"
                    >
                      <span className="h-6 w-1 rounded-full bg-primary-300 flex-shrink-0" />
                      {trimmed.replace("## ", "")}
                    </h2>
                  );
                }
                // Subheading (starts with #)
                if (trimmed.startsWith("# ")) {
                  return (
                    <h3
                      key={i}
                      className="mt-6 mb-2 text-lg font-semibold text-slate-700"
                    >
                      {trimmed.replace("# ", "")}
                    </h3>
                  );
                }
                // Bullet list
                if (trimmed.startsWith("- ")) {
                  const items = trimmed
                    .split("\n")
                    .filter((l) => l.startsWith("- "));
                  return (
                    <ul key={i} className="my-3 space-y-2">
                      {items.map((item, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2.5 text-slate-600"
                        >
                          <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary-600" />
                          <span>{item.replace("- ", "")}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }
                // Normal paragraph
                return (
                  <p key={i} className="my-3 text-slate-600 leading-relaxed">
                    {trimmed}
                  </p>
                );
              })}
            </div>
          )}
        </div>

        {/* Contact box */}
        <div className="mt-6 rounded-2xl border border-primary-200 bg-primary-50 p-6">
          <h3 className="font-bold text-primary-700">Have a question? 💬</h3>
          <p className="mt-1 text-sm text-primary-600/80">
            Get in touch with us — we're always here to help.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {storeSettings?.phone && (
              <a
                href={`tel:${cmsContent.phone}`}
                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-primary-600 shadow-sm hover:bg-primary-700/90 hover:text-white transition-colors"
              >
                📞 {storeSettings.phone}
              </a>
            )}
            {storeSettings?.email && (
              <a
                href={`mailto:${storeSettings.email}`}
                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-primary-600 shadow-sm hover:bg-primary-700/90 hover:text-white transition-colors"
              >
                ✉️ {storeSettings.email}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
