"use client";

import { useEffect } from "react";
import { useWebsiteStore } from "@/stores/useWebsiteStore";

export default function StoreHydrate() {
  useEffect(() => {
    useWebsiteStore.persist.rehydrate();
  }, []);

  return null;
}
