"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PageHeroHeader from "@/components/website/PageHeroHeader";
import { useWebsiteStore } from "@/stores/useWebsiteStore";

export default function CategoriesPage() {
  const { categories, fetchCategories, categoriesLoading } = useWebsiteStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <main className="min-h-screen bg-slate-50">
      <PageHeroHeader
        icon="🗂️"
        eyebrow="Browse"
        title="Explore Categories"
        subtitle="Discover amazing products across our full range of categories"
        compact
      />

      <div className="mx-auto max-w-7xl px-5 py-12">
        {categoriesLoading ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-[28px] bg-white shadow-sm"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {categories.map((c) => (
              <Link
                key={c._id}
                href={`/products?category=${c._id}`}
                className="
                  group relative overflow-hidden rounded-[30px]
                  border border-slate-200 bg-white p-5
                  shadow-sm transition-all duration-500
                  hover:-translate-y-2
                  hover:border-primary-300
                  hover:shadow-[0_25px_60px_rgba(11,61,46,0.15)]
                "
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#F3FBEA] to-transparent opacity-0 transition group-hover:opacity-100" />

                <div className="relative flex flex-col items-center text-center">
                  <div
                    className="
                    mb-4 flex h-24 w-24 items-center justify-center
                    overflow-hidden rounded-3xl
                    bg-gradient-to-br from-primary-50 to-primary-200
                    shadow-inner
                    transition duration-500
                    group-hover:scale-110
                  "
                  >
                    {c.image?.url ? (
                      <img
                        src={c.image.url}
                        alt={c.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl">🛒</span>
                    )}
                  </div>

                  <h2 className="text-base font-bold text-slate-800 transition group-hover:text-primary-600">
                    {c.name}
                  </h2>

                  {c.description && (
                    <p className="mt-2 line-clamp-2 text-xs text-slate-400">
                      {c.description}
                    </p>
                  )}

                  <div
                    className="
                    mt-5 flex items-center gap-1
                    rounded-full bg-[#F3FBEA]
                    px-4 py-2
                    text-xs font-bold text-primary-600
                    transition-all duration-300
                    group-hover:bg-primary-700
                    group-hover:text-white
                  "
                  >
                    Shop Now
                    <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
