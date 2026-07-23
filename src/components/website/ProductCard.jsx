"use client";
import Link from "next/link";
import { ShoppingCart, Heart, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { wishlistApi } from "@/services/api";
import { useWebsiteStore } from "@/stores/useWebsiteStore";

export default function ProductCard({ product }) {
  const { addToCart } = useWebsiteStore();
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);

  useEffect(() => {
    async function checkWishlist() {
      try {
        const data = await wishlistApi.get();

        const exists = data.some((item) => item._id === product._id);

        setWished(exists);
      } catch {}
    }

    checkWishlist();
  }, [product._id]);

  async function toggleWishlist(e) {
    e.preventDefault();

    try {
      const data = await wishlistApi.toggle(product._id);

      setWished(data?.added ?? false);

      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (error) {
      console.log(error);
      alert(error.message || "Something went wrong");
    }
  }

  const image = product.images?.[0]?.url;
  const isOutOfStock = product.stock <= 0;

  return (
    <Link
      href={`/products/${product._id}`}
      className="group relative flex flex-col rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-primary-200 transition-all overflow-hidden"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-slate-50 aspect-square">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package size={40} className="text-slate-200" />
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.discountPercent > 0 && (
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
              -{product.discountPercent}%
            </span>
          )}
          {product.isNewArrival && (
            <span className="rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-bold text-white">
              NEW
            </span>
          )}
          {product.isFlashSale && (
            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
              ⚡ SALE
            </span>
          )}
          {isOutOfStock && (
            <span className="rounded-full bg-slate-500 px-2 py-0.5 text-[10px] font-bold text-white">
              OUT
            </span>
          )}
        </div>
        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(e);
          }}
          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow hover:bg-red-50 transition-colors"
        >
          <Heart
            size={13}
            className={wished ? "fill-red-500 text-red-500" : "text-slate-400"}
          />
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        {product.category && (
          <p className="text-[10px] font-medium uppercase tracking-wide text-primary-500">
            {product.category.name}
          </p>
        )}
        <p className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug">
          {product.name}
        </p>
        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <div>
            <p className="text-base font-bold text-primary-700">
              PKR {product.sellingPrice?.toLocaleString()}
            </p>
            {product.oldPrice > 0 && (
              <p className="text-[11px] text-slate-400 line-through">
                PKR {product.oldPrice?.toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={() => addToCart(product, 1)}
            disabled={isOutOfStock}
            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-all ${
              added
                ? "bg-primary-500 text-white scale-90"
                : isOutOfStock
                  ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                  : "bg-green-50 text-primary-500 hover:bg-primary-500 hover:text-white"
            }`}
          >
            <ShoppingCart size={15} />
          </button>
        </div>
      </div>
    </Link>
  );
}
