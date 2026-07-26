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
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { storeSettings, fetchStoreSettings, cart } = useWebsiteStore();

  console.log(storeSettings);

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

    if (href === "/account") {
      return pathname === "/account";
    }

    return pathname.startsWith(href);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-primary-700 " : "bg-primary-700"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-20 items-center gap-1 sm:gap-5">
          {/* LOGO */}

          <Link
            href="/"
            className="flex items-center gap-3 flex-shrink-0 group"
          >
            <div
              className="
    flex h-7 w-7 sm:h-11 sm:w-11 
    items-center justify-center 
    overflow-hidden
    rounded-lg sm:rounded-2xl 
    bg-gradient-to-r from-primary to-primary-500
    text-white shadow-md
    transition
    group-hover:scale-105
  "
            >
              {storeSettings?.logo?.url ? (
                <Image
                  src={storeSettings.logo.url}
                  alt={storeSettings?.storeName || "Store Logo"}
                  width={44}
                  height={44}
                  className="h-full w-full rounded-lg object-contain"
                />
              ) : (
                <Store size={21} className="h-4 w-4 sm:h-6 sm:w-6" />
              )}
            </div>

            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
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
            <Search size={18} className="text-white" />

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
                      ? "bg-white text-primary shadow-md"
                      : "bg-transparent text-white hover:bg-slate-200/50 hover:text-primary"
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
              className={`
              rounded-full
               px-1.5
              py-1.5
              sm:px-2.5
               sm:py-2.5
              transition

               ${
                 isActive("/account/wishlist")
                   ? "bg-white text-primary hover:bg-slate-200/50 hover:text-primary"
                   : "text-white hover:bg-slate-200/50 hover:text-primary"
               }
              `}
            >
              <Heart size={20} className="h-4 w-4  sm:h-6 sm:w-6" />
            </Link>

            <Link
              href="/cart"
              className={`
              relative
              rounded-full
              px-1.5
              py-1.5
              sm:px-2.5
               sm:py-2.5
              transition

               ${
                 isActive("/cart")
                   ? "bg-white text-primary hover:bg-slate-200/50 hover:text-primary"
                   : "text-white hover:bg-slate-200/50 hover:text-primary"
               }
                  
              `}
            >
              <ShoppingCart size={21} className="h-4 w-4  sm:h-6 sm:w-6" />

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
              className={`
              rounded-full
              px-1.5
              py-1.5
              sm:px-2.5
               sm:py-2.5
              transition

               ${
                 isActive("/account")
                   ? "bg-white text-primary hover:bg-slate-200/50 hover:text-primary"
                   : "text-white hover:bg-slate-200/50 hover:text-primary"
               }
              `}
            >
              <User size={21} className="h-4 w-4  sm:h-6 sm:w-6" />
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
