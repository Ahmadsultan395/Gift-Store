"use client";
export const dynamic = "force-dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, Package, Search } from "lucide-react";
import ProductCard from "@/components/website/ProductCard";
import PageHeroHeader from "@/components/website/PageHeroHeader";
import { useEffect, useState } from "react";
import { useWebsiteStore } from "@/stores/useWebsiteStore";

const GENDER_FILTERS = ["Men", "Women", "Kids"];

export default function ProductsContentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    products,
    productsPagination,
    productsLoading,
    categories,
    fetchProducts,
    fetchCategories,
    setProductFilters,
  } = useWebsiteStore();
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const q = searchParams.get("q") || searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  // Independent from "category" — stays put while you browse categories
  // within it, only changes when you tap a different Shop-For button.
  const gender = searchParams.get("gender") || "";
  const sort = searchParams.get("sort") || "createdAt";
  const featured = searchParams.get("featured") || "";
  const newArr = searchParams.get("newArrival") || "";
  const flash = searchParams.get("flashSale") || "";

  // Once a gender is picked, only show categories that belong to it
  // (Unisex categories show under every gender). With no gender picked,
  // every category is visible.
  const visibleCategories = gender
    ? categories.filter((c) => {
        const g = c.gender || "Unisex";
        return g === gender || g === "Unisex";
      })
    : categories;

  const [categorySearch, setCategorySearch] = useState("");
  const categoryListResults = visibleCategories.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase()),
  );

  const [search, setSearch] = useState(q);

  useEffect(() => {
    setSearch(q);
  }, [q]);

  function handleSearch(e) {
    const value = e.target.value;

    setSearch(value);

    const params = new URLSearchParams(searchParams.toString());

    if (value.trim()) {
      params.set("q", value);
    } else {
      params.delete("q");
    }

    params.delete("page");

    router.push(`/products?${params.toString()}`);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const params = {
      page,
      limit: 24,
      sort,
    };

    if (q) params.search = q;
    if (category) params.category = category;
    if (gender) params.gender = gender;
    if (featured === "true") params.featured = "true";
    if (newArr === "true") params.newArrival = "true";
    if (flash === "true") params.flashSale = "true";

    fetchProducts(params);

    setProductFilters(params);
  }, [q, category, gender, sort, page, featured, newArr, flash]);

  useEffect(() => {
    setPage(1);
  }, [q, category, gender, sort, featured, newArr, flash]);

  function updateParam(key, val) {
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set(key, val);
    else params.delete(key);
    params.delete("page");
    router.push(`/products?${params}`);
  }

  // Switching gender clears the specific category (it likely belongs to
  // the old gender) but the gender itself is a separate param, so it
  // survives every category click below.
  function selectGender(g) {
    const params = new URLSearchParams(searchParams.toString());
    if (g) params.set("gender", g);
    else params.delete("gender");
    params.delete("category");
    params.delete("page");
    router.push(`/products?${params}`);
  }

  return (
    <div className="min-h-screen">
      <PageHeroHeader
        icon="🛍️"
        eyebrow="Shop"
        title={q ? `Results for "${q}"` : "All Products"}
        subtitle={`${productsPagination.total || 0} products found`}
        compact
      />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-center min-[500px]:justify-end gap-3">
          {/* Search */}
          <div className="relative w-[200px]">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search products..."
              className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-300/30"
            />
          </div>

          {/* Right Controls */}
          <div className="flex flex-wrap  items-center justify-center min-[500px]:justify-end gap-3 ">
            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-300/30 w-[200px]"
            >
              <option value="createdAt">Latest</option>
              <option value="popular">Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>

            <button
              onClick={() => setShowFilters((p) => !p)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:border-primary-300 hover:text-primary-600  w-[200px]"
            >
              <SlidersHorizontal size={15} />
              Filters
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden w-56 flex-shrink-0 md:block">
            <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-4 space-y-6">
              {/* Gender quick-filter — independent of the category below */}
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                  Shop For
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => selectGender("")}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${!gender ? "bg-[#F3FBEA] text-primary-600 font-medium" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    All
                  </button>
                  {GENDER_FILTERS.map((g) => (
                    <button
                      key={g}
                      onClick={() => selectGender(g)}
                      className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${gender === g ? "bg-[#F3FBEA] text-primary-600 font-medium" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                  {gender ? `${gender}'s Categories` : "Categories"}
                </h3>

                {/* Inline search — keeps a long category list (50-100+) usable */}
                {visibleCategories.length > 8 && (
                  <input
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Search categories..."
                    className="mb-2 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-primary-300"
                  />
                )}

                <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
                  <button
                    onClick={() => updateParam("category", "")}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${!category ? "bg-[#F3FBEA] text-primary-600 font-medium" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    All {gender || "Categories"}
                  </button>
                  {categoryListResults.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => updateParam("category", c._id)}
                      className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${category === c._id ? "bg-[#F3FBEA] text-primary-600 font-medium" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      {c.name}
                    </button>
                  ))}
                  {categoryListResults.length === 0 && (
                    <p className="px-3 py-2 text-xs text-slate-400">
                      No categories found.
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                  Special
                </h3>
                <div className="space-y-1">
                  {[
                    ["Featured", "featured", "true"],
                    ["New Arrivals", "newArrival", "true"],
                    ["Flash Sale", "flashSale", "true"],
                  ].map(([l, k, v]) => (
                    <button
                      key={k}
                      onClick={() =>
                        updateParam(k, searchParams.get(k) ? "" : "true")
                      }
                      className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${searchParams.get(k) ? "bg-[#F3FBEA] text-primary-600 font-medium" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {productsLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square animate-pulse rounded-2xl bg-slate-100"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-24 text-slate-400">
                <Package size={56} className="opacity-20" />
                <p className="text-lg font-medium">No products found</p>
                <button
                  onClick={() => router.push("/products")}
                  className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {products.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>
                {productsPagination.pages > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    {Array.from(
                      { length: productsPagination.pages },
                      (_, i) => i + 1,
                    ).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`h-9 w-9 rounded-xl text-sm font-medium transition-colors ${p === page ? "bg-primary-600 text-white" : "border border-slate-200 text-slate-600 hover:border-[#A8E063]"}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters */}
      {showFilters && (
        <div
          className="fixed inset-0 z-50 bg-black/40 md:hidden"
          onClick={() => setShowFilters(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute left-0 top-0 h-full w-[85%] max-w-[320px] overflow-y-auto bg-white shadow-xl"
          >
            <div className="sticky top-0 flex items-center justify-between border-b bg-white p-4">
              <h2 className="text-lg font-semibold">Filters</h2>

              <button
                onClick={() => setShowFilters(false)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 p-4">
              {/* Gender quick-filter */}
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                  Shop For
                </h3>

                <div className="space-y-1">
                  <button
                    onClick={() => selectGender("")}
                    className={`flex w-full rounded-lg px-3 py-2 text-left text-sm ${
                      !gender
                        ? "bg-[#F3FBEA] font-medium text-primary-600"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    All
                  </button>

                  {GENDER_FILTERS.map((g) => (
                    <button
                      key={g}
                      onClick={() => selectGender(g)}
                      className={`flex w-full rounded-lg px-3 py-2 text-left text-sm ${
                        gender === g
                          ? "bg-[#F3FBEA] font-medium text-primary-600"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                  {gender ? `${gender}'s Categories` : "Categories"}
                </h3>

                {visibleCategories.length > 8 && (
                  <input
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Search categories..."
                    className="mb-2 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-primary-300"
                  />
                )}

                <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
                  <button
                    onClick={() => {
                      updateParam("category", "");
                      setShowFilters(false);
                    }}
                    className={`flex w-full rounded-lg px-3 py-2 text-left text-sm ${
                      !category
                        ? "bg-[#F3FBEA] font-medium text-primary-600"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    All {gender || "Categories"}
                  </button>

                  {categoryListResults.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => {
                        updateParam("category", c._id);
                        setShowFilters(false);
                      }}
                      className={`flex w-full rounded-lg px-3 py-2 text-left text-sm ${
                        category === c._id
                          ? "bg-[#F3FBEA] font-medium text-primary-600"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special */}
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                  Special
                </h3>

                <div className="space-y-1">
                  {[
                    ["Featured", "featured"],
                    ["New Arrivals", "newArrival"],
                    ["Flash Sale", "flashSale"],
                  ].map(([label, key]) => (
                    <button
                      key={key}
                      onClick={() => {
                        updateParam(key, searchParams.get(key) ? "" : "true");
                        setShowFilters(false);
                      }}
                      className={`flex w-full rounded-lg px-3 py-2 text-left text-sm ${
                        searchParams.get(key)
                          ? "bg-[#F3FBEA] font-medium text-primary-600"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
