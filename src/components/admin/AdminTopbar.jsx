"use client";
import { Bell, Sun, Moon, Menu, Search, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminStore } from "@/stores/useAdminStore";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  Tags,
  Award,
  Truck,
  ShoppingCart,
  Receipt,
  ClipboardList,
  Users,
  Wallet,
  ClipboardCheck,
  Ticket,
  BarChart3,
  Settings as SettingsIcon,
  Image as ImageIcon,
  Mail as MailIcon,
  MessageSquareQuote,
  Star,
  MessageSquare,
} from "lucide-react";

// Same pages as sidebar — flat list for searching
const PAGES = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pos", label: "POS Terminal", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/brands", label: "Brands", icon: Award },
  { href: "/admin/inventory", label: "Inventory", icon: ClipboardCheck },
  { href: "/admin/suppliers", label: "Suppliers", icon: Truck },
  { href: "/admin/purchases", label: "Purchases", icon: Receipt },
  { href: "/admin/sales", label: "Sales History", icon: ClipboardList },
  { href: "/admin/orders", label: "Website Orders", icon: ShoppingCart },
  { href: "/admin/refunds", label: "Refunds", icon: Truck },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/expenses", label: "Expenses", icon: Wallet },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/banners", label: "Banners & Offers", icon: ImageIcon },
  { href: "/admin/newsletter", label: "Newsletter", icon: MailIcon },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  {
    href: "/admin/testimonials",
    label: "Testimonials",
    icon: MessageSquareQuote,
  },
  { href: "/admin/reviews", label: "Product Reviews", icon: Star },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

export default function AdminTopbar({ onMenuToggle }) {
  const { admin, unreadCount } = useAdminStore();
  const [dark, setDark] = useState(false);
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  function toggleDark() {
    document.documentElement.classList.toggle("dark");
    setDark((p) => !p);
  }

  const initials =
    admin?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "AD";

  const query = search.trim().toLowerCase();
  const results = query
    ? PAGES.filter((p) => p.label.toLowerCase().includes(query))
    : [];

  // close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function goTo(href) {
    router.push(href);
    setSearch("");
    setOpen(false);
  }

  return (
    <header className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4">
      <button
        onClick={onMenuToggle}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
      >
        <Menu size={20} />
      </button>

      <div ref={boxRef} className="relative hidden sm:block w-64">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
          <Search size={15} className="text-slate-400 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpen(!!e.target.value.trim());
            }}
            onFocus={() => search.trim() && setOpen(true)}
            placeholder="Search pages..."
            className="flex-1 min-w-0 bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setOpen(false);
              }}
              className="text-slate-400 hover:text-slate-600 flex-shrink-0"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {open && (
          <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
            {results.length === 0 ? (
              <div className="py-6 text-center text-sm text-slate-500">
                No page found for &quot;{search}&quot;
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto py-1">
                {results.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.href}
                      onClick={() => goTo(p.href)}
                      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-slate-50"
                    >
                      <Icon
                        size={15}
                        className="text-slate-400 flex-shrink-0"
                      />
                      <span className="truncate text-sm text-slate-700">
                        {p.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        {/* <button
          onClick={toggleDark}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button> */}

        <Link
          href="/admin/notifications"
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        <div className="mx-2 h-6 w-px bg-slate-200" />

        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white select-none overflow-hidden">
            <Image
              src="/maleDefaultDp.avif"
              alt="Store Logo"
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-700 leading-tight">
              {admin?.name || "Admin"}
            </p>
            <p className="text-xs capitalize text-slate-400">{admin?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
