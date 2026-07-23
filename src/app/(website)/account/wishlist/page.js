"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import ProductCard from "@/components/website/ProductCard";
import PageHeroHeader from "@/components/website/PageHeroHeader";
import { useWebsiteStore } from "@/stores/useWebsiteStore";

export default function WishlistPage() {
  const router = useRouter();
  const {
    customer,
    authChecked,
    checkAuth,
    wishlist,
    wishlistLoading,
    fetchWishlist,
    toggleWishlist,
  } = useWebsiteStore();

  useEffect(() => {
    async function init() {
      if (!authChecked) await checkAuth();
    }
    init();
  }, [authChecked, checkAuth]);

  useEffect(() => {
    if (!authChecked) return;
    if (!customer) {
      router.push("/account/login");
      return;
    }
    fetchWishlist();
  }, [authChecked, customer, router, fetchWishlist]);

  const loading = !authChecked || wishlistLoading;

  return (
    <div className="min-h-screen">
      <PageHeroHeader
        icon="❤️"
        eyebrow="Saved For Later"
        title="My Wishlist"
        subtitle="Keep your favourite products saved and ready to shop whenever you are"
        stats={
          !loading ? [{ value: wishlist.length, label: "Saved Items" }] : []
        }
        compact
      />

      <div className="mx-auto max-w-5xl px-4 py-10">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-400 border-t-transparent" />
          </div>
        ) : wishlist.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
              <Heart size={36} className="text-red-300" />
            </div>
            <p className="text-lg font-semibold text-slate-700">
              Your wishlist is empty
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Save products you like by tapping the heart icon
            </p>
            <Link
              href="/products"
              className="mt-4 inline-block rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-700"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {wishlist.map((p) => (
              <div key={p._id} className="relative group">
                <ProductCard product={p} />
                <button
                  onClick={() => toggleWishlist(p._id)}
                  className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
