"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Search,
  Heart,
  User,
  Menu,
  X,
  Store,
  Loader2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useWebsiteStore } from "@/stores/useWebsiteStore";
import Image from "next/image";

// Gender tabs shown in the navbar with their mega-menu promo image.
// Add /unisexCat.png to /public if you want a real promo image for Unisex.
const GENDER_TABS = [
  { key: "Men", label: "Men", image: "/menCat.png" },
  { key: "Women", label: "Women", image: "/womenCat.png" },
  { key: "Kids", label: "Kids", image: "/kidsCat.png" },
  // { key: "Unisex", label: "Unisex", image: "/unisexCat.png" },
];

const LEADING_LINKS = [{ href: "/", label: "Home" }];

const TRAILING_LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "Faqs" },
];

export default function Navbar({ isHome = false, scrolled = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    storeSettings,
    fetchStoreSettings,
    cart,
    products,
    productsLoading,
    categories,
    fetchProducts,
    setProductFilters,
  } = useWebsiteStore();

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Mega menu state
  const [activeGender, setActiveGender] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const closeTimerRef = useRef(null);

  const debounceRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchStoreSettings();
  }, [fetchStoreSettings]);

  // Close mega menu + mobile menu on route change
  useEffect(() => {
    setActiveGender(null);
    setOpen(false);
    setMobileExpanded(null);
  }, [pathname]);

  // Focus input + lock body scroll when search modal opens
  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [searchOpen]);

  // Close modal / mega menu on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setActiveGender(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Debounced live search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const query = search.trim();
    if (!query) return;

    debounceRef.current = setTimeout(async () => {
      setProductFilters({ search: query });

      await fetchProducts({
        ...useWebsiteStore.getState().productFilters,
        page: 1,
        limit: 8,
        search: query,
      });
    }, 400);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = search.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    closeSearch();
  };

  const openSearch = () => {
    setOpen(false);
    setActiveGender(null);
    setSearchOpen(true);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearch("");
  };

  const getCategoryName = (product) => {
    if (product?.category?.name) return product.category.name;
    const found = categories?.find(
      (c) => c._id === product?.category || c._id === product?.categoryId,
    );
    return found?.name || null;
  };

  const getProductImage = (product) =>
    product?.images?.[0]?.url || product?.image || null;

  // Filter categories belonging to a gender tab.
  // Change `c.gender` below if your category schema uses a different field.
  const getCategoriesForGender = useCallback(
    (genderKey) => {
      if (!categories?.length) return [];
      const matched = categories.filter(
        (c) => c.gender === genderKey || c?.appliesTo?.includes?.(genderKey),
      );
      return matched.length ? matched : categories;
    },
    [categories],
  );

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    if (href === "/account") return pathname === "/account";
    return pathname.startsWith(href);
  };

  const results = (products || []).slice(0, 8);
  const hasQuery = search.trim().length > 0;

  // --- Hover-intent handlers (small delay before closing so the menu
  // doesn't flicker when moving the mouse from the tab into the panel) ---
  const handleTabEnter = (key) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setActiveGender(key);
  };

  const handleTabLeave = () => {
    closeTimerRef.current = setTimeout(() => setActiveGender(null), 150);
  };

  const handlePanelEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full
    transform-gpu
    transition-[background-color,box-shadow,backdrop-filter,border-color]
    duration-1000
    ease-out
    ${
      isHome && !scrolled
        ? "bg-transparent border-b border-transparent shadow-none backdrop-blur-0"
        : "bg-primary-800  backdrop-blur-md"
    }
  `}
        onMouseLeave={handleTabLeave}
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 sm:h-[72px] items-center justify-between">
            {/* LOGO */}
            <Link
              href="/"
              aria-label="Home"
              className="flex items-center gap-2.5 shrink-0"
            >
              <div
                className="
    flex h-8 w-8 sm:h-10 sm:w-10 
    items-center justify-center 
    overflow-hidden
    rounded-xl 
    bg-gradient-to-br from-primary to-primary-500
    text-white shadow-md ring-2 ring-white/10
    transition
    group-hover:scale-105
  "
              >
                {storeSettings?.logo?.url ? (
                  <Image
                    src={storeSettings.logo.url}
                    alt={storeSettings?.storeName || "Store Logo"}
                    width={40}
                    height={40}
                    className="h-full w-full rounded-xl object-contain"
                  />
                ) : (
                  <Store size={18} className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </div>

              <span className="hidden sm:block text-lg font-extrabold tracking-tight text-white">
                {storeSettings?.storeName || "Store"}
              </span>
            </Link>

            {/* NAV LINKS */}
            <nav className="hidden md:flex flex-1 justify-center items-center gap-1">
              {LEADING_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive(l.href)
                      ? "bg-white text-primary shadow-sm"
                      : "bg-transparent text-white/90 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {l.label}
                </Link>
              ))}

              {GENDER_TABS.map((tab) => (
                <div key={tab.key} onMouseEnter={() => handleTabEnter(tab.key)}>
                  <Link
                    href={`/products?gender=${tab.key}`}
                    className={`relative flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      activeGender === tab.key
                        ? "bg-white text-primary shadow-sm"
                        : "bg-transparent text-white/90 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {tab.label}
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        activeGender === tab.key ? "rotate-180" : ""
                      }`}
                    />
                  </Link>
                </div>
              ))}

              {TRAILING_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive(l.href)
                      ? "bg-white text-primary shadow-sm"
                      : "bg-transparent text-white/90 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* ICONS */}
            <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
              <button
                onClick={openSearch}
                className="rounded-full p-2 sm:p-2.5 text-white transition hover:bg-white/10 hover:scale-105"
                aria-label="Search"
              >
                <Search size={19} className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
              </button>

              <Link
                href="/account/wishlist"
                aria-label="Wishlist"
                className={`rounded-full p-2 sm:p-2.5 transition hover:scale-105 ${
                  isActive("/account/wishlist")
                    ? "bg-white text-primary"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Heart size={19} className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
              </Link>

              <Link
                href="/cart"
                aria-label="Shopping Cart"
                className={`relative rounded-full p-2 sm:p-2.5 transition hover:scale-105 ${
                  isActive("/cart")
                    ? "bg-white text-primary"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <ShoppingCart
                  size={19}
                  className="h-[18px] w-[18px] sm:h-5 sm:w-5"
                />

                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-[9px] font-bold text-white shadow">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>

              <Link
                href="/account"
                aria-label="Account"
                className={`rounded-full p-2 sm:p-2.5 transition hover:scale-105 ${
                  isActive("/account")
                    ? "bg-white text-primary"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <User size={19} className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
              </Link>

              <button
                onClick={() => setOpen(!open)}
                aria-label={open ? "Close menu" : "Open menu"}
                className="md:hidden rounded-full p-2 text-white hover:bg-white/10"
              >
                {open ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* ================= MEGA MENU (desktop) ================= */}
          {activeGender && (
            <div
              onMouseEnter={handlePanelEnter}
              onMouseLeave={handleTabLeave}
              className="
              absolute left-0 right-0 top-full z-40
              hidden md:block
              border-t border-slate-100 bg-white shadow-2xl
              animate-in fade-in slide-in-from-top-1 duration-150
              "
            >
              <div className="mx-auto grid max-w-7xl grid-cols-4 gap-8 px-8 py-8">
                {/* Category columns */}
                <div className="col-span-3 grid grid-cols-3 gap-6">
                  {chunkArray(getCategoriesForGender(activeGender), 3).map(
                    (col, i) => (
                      <div key={i} className="flex flex-col gap-3">
                        {col.map((c) => (
                          <Link
                            key={c._id}
                            href={`/products?gender=${activeGender}&category=${c._id}`}
                            className="text-sm font-medium text-slate-600 transition hover:text-primary"
                          >
                            {c.name}
                          </Link>
                        ))}
                      </div>
                    ),
                  )}
                </div>

                {/* Promo image */}
                <Link
                  href={`/products?gender=${activeGender}`}
                  className="group relative col-span-1 overflow-hidden rounded-2xl"
                >
                  <img
                    src={GENDER_TABS.find((t) => t.key === activeGender)?.image}
                    alt={activeGender}
                    className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <span className="absolute bottom-3 left-4 flex items-center gap-1 text-sm font-semibold text-white">
                    Shop All {activeGender}
                    <ChevronRight
                      size={15}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </Link>
              </div>
            </div>
          )}

          {/* ================= MOBILE MENU ================= */}
          {open && (
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white shadow-xl p-3 md:hidden">
              {LEADING_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive(l.href)
                      ? "bg-primary text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {l.label}
                </Link>
              ))}

              {GENDER_TABS.map((tab) => {
                const isExpanded = mobileExpanded === tab.key;
                return (
                  <div key={tab.key}>
                    <div
                      className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        isExpanded
                          ? "bg-primary/10 text-primary"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Link
                        href={`/products?gender=${tab.key}`}
                        onClick={() => setOpen(false)}
                        className="flex-1"
                      >
                        {tab.label}
                      </Link>
                      <button
                        onClick={() =>
                          setMobileExpanded(isExpanded ? null : tab.key)
                        }
                        aria-label={`Toggle ${tab.label} categories`}
                        className="p-1"
                      >
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mb-2 ml-4 flex flex-col gap-1 border-l border-slate-100 pl-4">
                        {getCategoriesForGender(tab.key).map((c) => (
                          <Link
                            key={c._id}
                            href={`/products?gender=${tab.key}&category=${c._id}`}
                            onClick={() => setOpen(false)}
                            className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary"
                          >
                            {c.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {TRAILING_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive(l.href)
                      ? "bg-primary text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* SEARCH MODAL */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-20 sm:pt-28"
          onClick={closeSearch}
        >
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-3 border-b border-slate-100 px-5 py-4"
            >
              <Search size={20} className="flex-shrink-0 text-slate-400" />
              <input
                ref={searchInputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-transparent text-base outline-none placeholder:text-slate-400"
              />
              {productsLoading && (
                <Loader2 size={18} className="animate-spin text-slate-300" />
              )}
              <button
                type="button"
                onClick={closeSearch}
                className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </form>

            {hasQuery && (
              <div className="max-h-[26rem] overflow-y-auto">
                {productsLoading && results.length === 0 ? (
                  <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
                    <Loader2 size={16} className="animate-spin" />
                    Loading...
                  </div>
                ) : results.length === 0 ? (
                  <div className="py-10 text-center text-sm text-slate-500">
                    No products found for &quot;{search}&quot;
                  </div>
                ) : (
                  <div className="py-2">
                    {results.map((product) => {
                      const img = getProductImage(product);
                      const categoryName = getCategoryName(product);
                      return (
                        <Link
                          key={product._id}
                          href={`/products/${product._id}`}
                          onClick={closeSearch}
                          className="flex items-center gap-3 px-5 py-2.5 transition hover:bg-slate-50"
                        >
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                            {img ? (
                              <Image
                                src={img}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-300">
                                <Store size={18} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {product.name}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {categoryName ? `in ${categoryName}` : "Product"}
                              {product.price != null && (
                                <span className="ml-2 font-medium text-primary">
                                  Rs {product.price}
                                </span>
                              )}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleSearchSubmit}
              disabled={!hasQuery}
              className="block w-full border-t border-slate-100 bg-slate-50 px-4 py-3.5 text-center text-sm font-semibold text-primary transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              {hasQuery
                ? `See all results for "${search}"`
                : "Type to search products"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Splits an array into `n` roughly-equal columns for the mega menu grid
function chunkArray(arr, n) {
  const result = Array.from({ length: n }, () => []);
  arr.forEach((item, i) => result[i % n].push(item));
  return result;
}
