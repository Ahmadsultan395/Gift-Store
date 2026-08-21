"use client";
import Link from "next/link";
import { ShoppingCart, Heart, Package, Star } from "lucide-react";
import { useState } from "react";
import { useWebsiteStore } from "@/stores/useWebsiteStore";
import Image from "next/image";

// ── Rating stars helper ────────────────────────────────────────────
function StarRating({ rating = 0, count = 0 }) {
  if (!rating || rating === 0) return null;
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={10}
            className={
              i <= Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "text-slate-200"
            }
          />
        ))}
      </div>
      <span className="text-[10px] text-slate-400">
        {rating.toFixed(1)}
        {count > 0 ? ` (${count})` : ""}
      </span>
    </div>
  );
}

export default function ProductCard({ product }) {
  const { addToCart, wishlist, toggleWishlist } = useWebsiteStore();
  const [added, setAdded] = useState(false);

  const wished = wishlist.some((item) => (item._id || item) === product._id);

  async function handleWishlist(e) {
    e.preventDefault();
    e.stopPropagation();

    await toggleWishlist(product._id);
  }

  function handleAddToCart(e) {
    e.preventDefault();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
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
          <Image
            src={image}
            alt={product.name || "Product"}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package size={40} className="text-slate-200" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.discountPercent > 0 && (
            <span className="rounded-full bg-red-700 px-2 py-0.5 text-[10px] font-bold text-white">
              {product.discountPercent}% off
            </span>
          )}
          {product.isNewArrival && (
            <span className="rounded-full bg-blue-700 px-2 py-0.5 text-[10px] font-bold text-white">
              NEW
            </span>
          )}
          {product.isFlashSale && (
            <span className="rounded-full bg-amber-700 px-2 py-0.5 text-[10px] font-bold text-white">
              ⚡ SALE
            </span>
          )}
          {isOutOfStock && (
            <span className="rounded-full bg-slate-500 px-2 py-0.5 text-[10px] font-bold text-white">
              SOLD
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          onClick={handleWishlist}
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

        {/* ⭐ Rating — avgRating aur reviewCount product se auto aata hai */}
        <StarRating rating={product.avgRating} count={product.reviewCount} />

        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <div>
            <p className="text-base font-bold text-primary-700">
              PKR {product.sellingPrice?.toLocaleString()}
            </p>
            {product.oldPrice > 0 && (
              <p className="text-[11px] text-slate-600 line-through">
                PKR {product.oldPrice?.toLocaleString()}
              </p>
            )}
          </div>
          <button
            aria-label={isOutOfStock ? "Out of stock" : "Add to cart"}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-all ${
              added
                ? "bg-primary-500 text-white scale-90"
                : isOutOfStock
                  ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                  : "bg-primary-50 text-primary-500 hover:bg-primary-500 hover:text-white"
            }`}
          >
            <ShoppingCart size={15} />
          </button>
        </div>
      </div>
    </Link>
  );
}
