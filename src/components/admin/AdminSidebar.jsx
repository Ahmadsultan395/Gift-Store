"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
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
  Image,
  BarChart3,
  Settings,
  LogOut,
  Store,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Mail } from "lucide-react";

const navGroups = [
  {
    label: "Main",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      {
        href: "/admin/pos",
        label: "POS Terminal",
        icon: ShoppingCart,
        badge: "HOT",
      },
    ],
  },
  {
    label: "Inventory",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: Tags },
      { href: "/admin/brands", label: "Brands", icon: Award },
      { href: "/admin/inventory", label: "Inventory", icon: ClipboardCheck },
    ],
  },
  {
    label: "Purchases & Sales",
    items: [
      { href: "/admin/suppliers", label: "Suppliers", icon: Truck },
      { href: "/admin/purchases", label: "Purchases", icon: Receipt },
      { href: "/admin/sales", label: "Sales History", icon: ClipboardList },
      { href: "/admin/orders", label: "Website Orders", icon: ShoppingCart },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/expenses", label: "Expenses", icon: Wallet },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/admin/coupons", label: "Coupons", icon: Ticket },
      { href: "/admin/banners", label: "Banners & Offers", icon: Image },
      { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/reports", label: "Reports", icon: BarChart3 },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

function NavItem({ href, label, icon: Icon, badge, onClick }) {
  const pathname = usePathname();
  const isActive =
    pathname === href ||
    (href !== "/admin/dashboard" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
        isActive
          ? "bg-primary-600 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <Icon
        size={17}
        className={`flex-shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`}
      />
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
            isActive
              ? "bg-white/20 text-white"
              : "bg-primary-100 text-primary-700"
          }`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

function NavGroup({ group, defaultOpen = true, onNav }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600"
      >
        <span>{group.label}</span>
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>
      {open && (
        <div className="space-y-0.5">
          {group.items.map((item) => (
            <NavItem key={item.href} {...item} onClick={onNav} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminSidebar({ mobileOpen, onClose }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white">
          <Store size={18} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-800">
            Pansar Store
          </p>
          <p className="text-[11px] text-slate-400">Management System</p>
        </div>
        <button
          onClick={onClose}
          className="ml-auto text-slate-400 hover:text-slate-600 lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navGroups.map((group, i) => (
          <NavGroup
            key={group.label}
            group={group}
            defaultOpen={i < 3}
            onNav={onClose}
          />
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex h-screen w-64 flex-col border-r border-slate-200 bg-white flex-shrink-0">
        {content}
      </aside>
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={onClose}
          />
          <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200 bg-white lg:hidden">
            {content}
          </aside>
        </>
      )}
    </>
  );
}
