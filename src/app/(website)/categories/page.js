"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, X } from "lucide-react";
import PageHeroHeader from "@/components/website/PageHeroHeader";
import { useWebsiteStore } from "@/stores/useWebsiteStore";

export default function CategoriesPage() {
  const { categories, fetchCategories, categoriesLoading } = useWebsiteStore();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const PER_PAGE = 5;

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredCategories.length / PER_PAGE);

  const paginatedCategories = filteredCategories.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE,
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <main className="min-h-screen bg-white">
      <PageHeroHeader
        icon="🗂️"
        eyebrow="Browse"
        title="Explore Categories"
        subtitle="Discover amazing products across our full range of categories"
        compact
      />

      <div className="mx-auto max-w-7xl px-5 py-12">
        <div className="mb-8 flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">All Categories</h2>
            <p className="mt-1 text-sm text-slate-400">
              {categoriesLoading
                ? "Loading categories…"
                : `${filteredCategories.length} categor${
                    filteredCategories.length === 1 ? "y" : "ies"
                  } available`}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-9 text-sm outline-none transition focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-300/30"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {filteredCategories.length === 0 && !categoriesLoading && (
          <div className="py-16 text-center text-slate-500">
            No categories found.
          </div>
        )}
        {categoriesLoading ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-[28px] bg-slate-50 shadow-sm"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {paginatedCategories.map((c) => (
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

        {totalPages > 1 && (
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`h-10 w-10 rounded-lg ${
                  page === i + 1
                    ? "bg-primary-600 text-white"
                    : "border hover:bg-slate-50"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
