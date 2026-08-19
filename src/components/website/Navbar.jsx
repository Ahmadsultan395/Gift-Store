"use client";

import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useWebsiteStore } from "@/stores/useWebsiteStore";
import Image from "next/image";

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

  const debounceRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchStoreSettings();
  }, [fetchStoreSettings]);

  // Focus input + lock body scroll when modal opens
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

  // Close modal on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") setSearchOpen(false);
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

  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/products", label: "Products" },
    { href: "/categories", label: "Categories" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "Faqs" },
  ];

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    if (href === "/account") return pathname === "/account";
    return pathname.startsWith(href);
  };

  const results = (products || []).slice(0, 8);
  const hasQuery = search.trim().length > 0;

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
        : "bg-primary-800/95 shadow-lg backdrop-blur-md border-b border-white/5"
    }
  `}
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 sm:h-[72px] items-center justify-between">
            {/* LOGO */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
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
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`
                  relative
                  px-3.5 py-2
                  rounded-lg
                  text-sm
                  font-semibold
                  transition-all duration-200

                  ${
                    isActive(l.href)
                      ? "bg-white text-primary shadow-sm"
                      : "bg-transparent text-white/90 hover:bg-white/10 hover:text-white"
                  }
                  `}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* <div className="flex-1" /> */}

            {/* ICONS */}
            <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
              <button
                onClick={openSearch}
                className="
                rounded-full
                p-2
                sm:p-2.5
                text-white
                transition
                hover:bg-white/10
                hover:scale-105
                "
                aria-label="Search"
              >
                <Search size={19} className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
              </button>

              <Link
                href="/account/wishlist"
                className={`
              rounded-full
              p-2
              sm:p-2.5
              transition
              hover:scale-105

               ${
                 isActive("/account/wishlist")
                   ? "bg-white text-primary"
                   : "text-white hover:bg-white/10"
               }
              `}
              >
                <Heart size={19} className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
              </Link>

              <Link
                href="/cart"
                className={`
              relative
              rounded-full
              p-2
              sm:p-2.5
              transition
              hover:scale-105

               ${
                 isActive("/cart")
                   ? "bg-white text-primary"
                   : "text-white hover:bg-white/10"
               }
              `}
              >
                <ShoppingCart
                  size={19}
                  className="h-[18px] w-[18px] sm:h-5 sm:w-5"
                />

                {cartCount > 0 && (
                  <span
                    className="
                    absolute
                    -right-0.5
                    -top-0.5
                    flex
                    h-[18px]
                    w-[18px]
                    items-center
                    justify-center
                    rounded-full
                    bg-gradient-to-r
                    from-red-500
                    to-pink-500
                    text-[9px]
                    font-bold
                    text-white
                    shadow
                    "
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>

              <Link
                href="/account"
                className={`
              rounded-full
              p-2
              sm:p-2.5
              transition
              hover:scale-105

               ${
                 isActive("/account")
                   ? "bg-white text-primary"
                   : "text-white hover:bg-white/10"
               }
              `}
              >
                <User size={19} className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
              </Link>

              <button
                onClick={() => setOpen(!open)}
                className="
              md:hidden
              rounded-full
              p-2
              text-white
              hover:bg-white/10
              "
              >
                {open ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* MOBILE MENU */}
          {open && (
            <div
              className="
              mb-4
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-xl
              p-3
              md:hidden
              "
            >
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`
                    block
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    transition

                    ${
                      isActive(l.href)
                        ? "bg-primary text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }
                    `}
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
            className="
            relative w-full max-w-xl
            rounded-2xl bg-white
            shadow-2xl
            overflow-hidden
            animate-in fade-in zoom-in-95 duration-150
            "
          >
            {/* Input row */}
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

            {/* Results */}
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

            {/* Footer CTA */}
            <button
              onClick={handleSearchSubmit}
              disabled={!hasQuery}
              className="
              block w-full border-t border-slate-100
              bg-slate-50 px-4 py-3.5 text-center text-sm font-semibold
              text-primary transition hover:bg-slate-100
              disabled:cursor-not-allowed disabled:text-slate-300
              "
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
