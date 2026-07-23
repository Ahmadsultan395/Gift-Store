"use client";
/**
 * AdminProvider
 * Admin layout mein wrap karo — ek baar auth check aur reference
 * data (categories, brands, suppliers) load ho jata hai
 */

import { useEffect } from "react";
import { useAdminStore } from "@/stores/useAdminStore";

export default function AdminProvider({ children }) {
  const {
    checkAuth,
    fetchCategories,
    fetchBrands,
    fetchSuppliers,
    fetchUnreadCount,
    fetchSettings,
  } = useAdminStore();

  useEffect(() => {
    // Auth check
    checkAuth();
    // Load reference data once (sidebar dropdowns, POS, etc.)
    fetchCategories();
    fetchBrands();
    fetchSuppliers();
    fetchSettings();
    // Notification count (topbar badge)
    fetchUnreadCount();
    // Refresh notif count every 60s
    const t = setInterval(fetchUnreadCount, 60_000);
    return () => clearInterval(t);
  }, []);

  return <>{children}</>;
}
