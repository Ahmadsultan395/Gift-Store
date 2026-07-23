"use client";
/**
 * WebsiteProvider
 * Website layout mein wrap karo — categories, settings, auth ek baar load
 */

import { useEffect } from "react";
import { useWebsiteStore } from "@/stores/useWebsiteStore";

export default function WebsiteProvider({ children }) {
  const {
    fetchStoreSettings,
    fetchCategories,
    checkAuth,
    fetchWishlist,
    customer,
  } = useWebsiteStore();

  useEffect(() => {
    fetchStoreSettings();
    fetchCategories();
    checkAuth();
  }, []);

  // Load wishlist when customer logs in
  useEffect(() => {
    if (customer) fetchWishlist();
  }, [customer?._id]);

  return <>{children}</>;
}
