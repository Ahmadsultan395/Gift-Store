"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Search,
  Heart,
  User,
  Menu,
  X,
  Store,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useWebsiteStore } from "@/stores/useWebsiteStore";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { storeSettings, fetchStoreSettings, cart } = useWebsiteStore();

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetchStoreSettings();
  }, [fetchStoreSettings]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const query = search.trim();

    if (!query) return;

    router.push(`/search?q=${encodeURIComponent(query)}`);
    setOpen(false);
  };

  const links = [
    {
      href: "/",
      label: "Home",
    },
    {
      href: "/about",
      label: "About",
    },
    {
      href: "/products",
      label: "Products",
    },
    {
      href: "/categories",
      label: "Categories",
    },
  ];

  const isActive = (href) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-lg border-b border-slate-200"
          : "bg-white/80 backdrop-blur-md border-b border-slate-100"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-20 items-center gap-5">
          {/* LOGO */}

          <Link
            href="/"
            className="flex items-center gap-3 flex-shrink-0 group"
          >
            <div
              className="
              flex h-11 w-11 items-center justify-center 
              rounded-2xl 
              bg-gradient-to-r from-primary to-emerald-500
              text-white shadow-md
              transition
              group-hover:scale-105
              "
            >
              <Store size={21} />
            </div>

            <span className="text-xl font-extrabold tracking-tight text-slate-800">
              {storeSettings?.storeName || "Store"}
            </span>
          </Link>

          {/* DESKTOP SEARCH */}

          <form
            onSubmit={handleSearchSubmit}
            className="
            hidden md:flex flex-1 items-center gap-3
            rounded-full
            border border-slate-200
            bg-white
            px-5 py-3
            shadow-sm
            hover:shadow-md
            focus-within:ring-2
            focus-within:ring-primary/30
            transition
            max-w-lg
            "
          >
            <Search size={18} className="text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="
              w-full bg-transparent 
              outline-none 
              text-sm
              text-slate-700
              "
            />
          </form>

          {/* NAV LINKS */}

          <nav className="hidden md:flex items-center gap-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`
                  relative
                  px-4 py-2
                  rounded-full
                  text-sm
                  font-semibold
                  transition-all duration-300

                  ${
                    isActive(l.href)
                      ? "bg-primary text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100 hover:text-primary"
                  }
                  `}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex-1 md:hidden" />

          {/* ICONS */}

          <div className="flex items-center gap-1">
            <Link
              href="/account/wishlist"
              className="
              hidden sm:flex
              rounded-full
              p-2.5
              text-slate-500
              hover:bg-primary/10
              hover:text-primary
              transition
              "
            >
              <Heart size={20} />
            </Link>

            <Link
              href="/cart"
              className="
              relative
              rounded-full
              p-2.5
              text-slate-500
              hover:bg-primary/10
              hover:text-primary
              transition
              "
            >
              <ShoppingCart size={21} />

              {cartCount > 0 && (
                <span
                  className="
                    absolute
                    -right-1
                    -top-1
                    flex
                    h-5
                    w-5
                    items-center
                    justify-center
                    rounded-full
                    bg-gradient-to-r
                    from-red-500
                    to-pink-500
                    text-[10px]
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
              className="
              rounded-full
              p-2.5
              text-slate-500
              hover:bg-primary/10
              hover:text-primary
              transition
              "
            >
              <User size={21} />
            </Link>

            <button
              onClick={() => setOpen(!open)}
              className="
              md:hidden
              rounded-full
              p-2.5
              text-slate-500
              hover:bg-primary/10
              "
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* MOBILE SEARCH */}

        <div className="pb-4 md:hidden">
          <form
            onSubmit={handleSearchSubmit}
            className="
            flex items-center gap-3
            rounded-full
            border
            border-slate-200
            bg-white
            px-5 py-3
            shadow-sm
            "
          >
            <Search size={18} className="text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="
              flex-1
              bg-transparent
              outline-none
              text-sm
              "
            />
          </form>
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
  );
}
