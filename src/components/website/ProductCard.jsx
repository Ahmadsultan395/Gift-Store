"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Heart, Package, Star, Zap } from "lucide-react";

import { useWebsiteStore } from "@/stores/useWebsiteStore";

// ─────────────────────────────────────────────
// Rating Stars
// ─────────────────────────────────────────────
function StarRating({ rating = 0, count = 0 }) {
  if (!rating || rating === 0) return null;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={10}
            strokeWidth={2}
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

// ─────────────────────────────────────────────
// Product Card
// ─────────────────────────────────────────────
export default function ProductCard({ product }) {
  const router = useRouter();

  const { addToCart, wishlist, toggleWishlist } = useWebsiteStore();

  const [added, setAdded] = useState(false);
  const [buying, setBuying] = useState(false);

  const wished = wishlist.some((item) => (item._id || item) === product._id);

  const image = product.images?.[0]?.url;

  const isOutOfStock = product.stock <= 0;

  // ─────────────────────────────────────────
  // Wishlist
  // ─────────────────────────────────────────
  async function handleWishlist(e) {
    e.preventDefault();
    e.stopPropagation();

    await toggleWishlist(product._id);
  }

  // ─────────────────────────────────────────
  // Add To Cart
  // ─────────────────────────────────────────
  function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock || added) return;

    addToCart(product, 1);

    setAdded(true);

    // setTimeout(() => {
    //   router.push("/cart");
    // }, 350);
  }

  // ─────────────────────────────────────────
  // Buy Now
  // ─────────────────────────────────────────
  function handleBuyNow(e) {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock || buying) return;

    setBuying(true);

    addToCart(product, 1);

    setTimeout(() => {
      router.push("/cart");
    }, 350);
  }

  return (
    <Link
      href={`/products/${product._id}`}
      className="
        group
        relative
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-slate-100
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-primary-200
        hover:shadow-lg
      "
    >
      {/* ═══════════════════════════════════════
          IMAGE
      ═══════════════════════════════════════ */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        {image ? (
          <Image
            src={image}
            alt={product.name || "Product"}
            fill
            sizes="
              (max-width: 640px) 50vw,
              (max-width: 1024px) 25vw,
              20vw
            "
            className="
              object-cover
              transition-transform
              duration-500
              group-hover:scale-105
            "
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package size={40} strokeWidth={1.5} className="text-slate-200" />
          </div>
        )}

        {/* ═════════════════════════════════════
            BADGES
        ═════════════════════════════════════ */}
        <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
          {product.discountPercent > 0 && (
            <span
              className="
                rounded-full
                bg-red-600
                px-2
                py-0.5
                text-[10px]
                font-extrabold
                text-white
                shadow-sm
              "
            >
              {product.discountPercent}% OFF
            </span>
          )}

          {product.isNewArrival && (
            <span
              className="
                rounded-full
                bg-blue-600
                px-2
                py-0.5
                text-[10px]
                font-extrabold
                text-white
                shadow-sm
              "
            >
              NEW
            </span>
          )}

          {product.isFlashSale && (
            <span
              className="
                rounded-full
                bg-amber-500
                px-2
                py-0.5
                text-[10px]
                font-extrabold
                text-white
                shadow-sm
              "
            >
              ⚡ SALE
            </span>
          )}

          {isOutOfStock && (
            <span
              className="
                rounded-full
                bg-slate-600
                px-2
                py-0.5
                text-[10px]
                font-extrabold
                text-white
                shadow-sm
              "
            >
              SOLD OUT
            </span>
          )}
        </div>

        {/* ═════════════════════════════════════
            WISHLIST
        ═════════════════════════════════════ */}
        <button
          type="button"
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          onClick={handleWishlist}
          className="
            absolute
            right-2
            top-2
            z-20
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            bg-white
            shadow-md
            transition-all
            duration-200
            hover:scale-110
            hover:bg-red-50
          "
        >
          <Heart
            size={14}
            strokeWidth={2}
            className={wished ? "fill-red-500 text-red-500" : "text-slate-400"}
          />
        </button>
      </div>

      {/* ═══════════════════════════════════════
          PRODUCT INFO
      ═══════════════════════════════════════ */}
      <div className="flex flex-1 flex-col p-3">
        {/* Category */}
        {product.category && (
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              text-primary-500
            "
          >
            {product.category.name}
          </p>
        )}

        {/* Product Name */}
        <p
          className="
            mt-1
            line-clamp-2
            min-h-[36px]
            text-sm
            font-semibold
            leading-snug
            text-slate-800
          "
        >
          {product.name}
        </p>

        {/* Rating */}
        <div className="mt-1 min-h-[14px]">
          <StarRating rating={product.avgRating} count={product.reviewCount} />
        </div>

        {/* ═════════════════════════════════════
            PRICE
        ═════════════════════════════════════ */}
        <div className="mt-2">
          <p className="text-base font-extrabold text-primary-700">
            PKR {product.sellingPrice?.toLocaleString()}
          </p>

          {product.oldPrice > 0 && (
            <p
              className="
                text-[11px]
                font-medium
                text-slate-500
                line-through
              "
            >
              PKR {product.oldPrice?.toLocaleString()}
            </p>
          )}
        </div>

        {/* ═══════════════════════════════════════
            BOTTOM BUTTONS
        ═══════════════════════════════════════ */}
        <div className="mt-auto pt-3">
          <div className="grid grid-cols-1 min:[500px]-grid-cols-2 gap-2">
            {/* ─────────────────────────────────
                ADD TO CART
            ───────────────────────────────── */}
            <button
              type="button"
              aria-label={isOutOfStock ? "Out of stock" : "Add to cart"}
              onClick={handleAddToCart}
              disabled={isOutOfStock || added}
              className={`
                relative
                flex
                h-10
                items-center
                justify-center
                gap-1.5
                overflow-hidden
                rounded-xl
                border
                px-2
                text-[11px]
                font-extrabold
                transition-all
                duration-150

                ${
                  added
                    ? `
                      border-green-500
                      bg-green-500
                      text-white
                      shadow-[0_0_20px_rgba(34,197,94,0.60)]
                    `
                    : isOutOfStock
                      ? `
                        cursor-not-allowed
                        border-slate-200
                        bg-slate-100
                        text-slate-300
                      `
                      : `
                        border-primary-500
                        bg-primary-500
                        text-white
                        shadow-[0_0_12px_theme(colors.primary.500/45%)]
hover:bg-primary-600
hover:shadow-[0_0_24px_theme(colors.primary.500/75%)]
                      `
                }
                ${!isOutOfStock && !added ? "animate-cart-attention" : ""}
              `}
            >
              <ShoppingCart size={14} strokeWidth={2.5} />

              <span>{added ? "Added!" : "Add to Cart"}</span>
            </button>

            {/* ─────────────────────────────────
                BUY NOW
            ───────────────────────────────── */}
            <button
              type="button"
              aria-label={isOutOfStock ? "Out of stock" : "Buy now"}
              onClick={handleBuyNow}
              disabled={isOutOfStock || buying}
              className={`
                relative
                flex
                h-10
                items-center
                justify-center
                gap-1.5
                overflow-hidden
                rounded-xl
                border
                px-2
                text-[11px]
                font-extrabold
                transition-all
                duration-150

                ${
                  isOutOfStock
                    ? `
                      cursor-not-allowed
                      border-slate-200
                      bg-slate-100
                      text-slate-300
                    `
                    : buying
                      ? `
                        border-amber-500
                        bg-amber-500
                        text-slate-950
                      `
                      : `
                        border-amber-400
                        bg-amber-400
                        text-slate-950
                        shadow-[0_0_16px_rgba(251,191,36,0.65)]
                        hover:bg-amber-300
                        hover:shadow-[0_0_28px_rgba(251,191,36,0.95)]
                      `
                }
                ${!isOutOfStock && !buying ? "animate-buy-attention" : ""}
              `}
            >
              <Zap size={14} strokeWidth={2.5} className="fill-current" />

              <span>{buying ? "Processing..." : "Buy Now"}</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
