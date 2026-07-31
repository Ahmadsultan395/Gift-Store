"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import AdminProvider from "../../providers/AdminProvider";
import { useAdminStore } from "@/stores/useAdminStore";

export default function AdminLayout({ children }) {
  const { settings } = useAdminStore();
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  console.log(settings);

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    setChecking(true);
    fetch("/api/admin/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) {
          router.replace("/admin/login");
        } else {
          setUser(d.data.user);
        }
      })
      .catch(() => router.replace("/admin/login"))
      .finally(() => setChecking(false));
  }, [router, pathname, isLoginPage]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <AdminProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <AdminSidebar
          settings={settings}
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <AdminTopbar user={user} onMenuToggle={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </AdminProvider>
  );
}
