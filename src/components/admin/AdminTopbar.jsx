"use client";
import { Bell, Sun, Moon, Menu, Search } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useAdminStore } from "@/stores/useAdminStore";
import Image from "next/image";

export default function AdminTopbar({ onMenuToggle }) {
  const { admin, unreadCount } = useAdminStore();
  const [dark, setDark] = useState(false);

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

  return (
    <header className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4">
      <button
        onClick={onMenuToggle}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
      >
        <Menu size={20} />
      </button>

      <div className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 w-64">
        <Search size={15} className="text-slate-400 flex-shrink-0" />
        <input
          placeholder="Search..."
          className="flex-1 min-w-0 bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
        />
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
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white select-none">
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
