"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ShoppingCart,
  Heart,
  Package,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Zap,
} from "lucide-react";
import ProductCard from "@/components/website/ProductCard";
import { useWebsiteStore } from "@/stores/useWebsiteStore";
import ReviewSection from "@/components/website/ReviewSection";

export default function ProductDetailPage() {
  const {
    currentProduct,
    currentProductLoading,
    fetchProductBySlug,
    addToCart,
  } = useWebsiteStore();
  const { id } = useParams();
  const router = useRouter();
  const [mainImg, setMainImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [buying, setBuying] = useState(false);

  const data = currentProduct;
  const loading = currentProductLoading;
  console.log(data);

  useEffect(() => {
    if (id) {
      fetchProductBySlug(id);
    }
  }, [id, fetchProductBySlug]);

  function handleAddToCart() {
    if (!data?.product) return;

    addToCart(data.product, qty);

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 2000);
  }

  function handleBuyNow(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!data?.product) return;
    if (data.product.stock <= 0 || buying) return;

    setBuying(true);

    addToCart(data.product, qty);

    setTimeout(() => {
      router.push("/cart");
    }, 350);
  }

  if (loading)
    return (
      <div className="flex justify-center items-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  if (!data?.product)
    return (
      <div className="py-24 text-center text-slate-400">Product not found.</div>
    );

  const p = data.product;
  const isOutOfStock = p.stock <= 0;
  const availability =
    p.stock <= 0
      ? "Out of Stock"
      : p.stock <= p.lowStockThreshold
        ? `Only ${p.stock} left!`
        : "In Stock";
  const availColor =
    p.stock <= 0
      ? "text-primary-700"
      : p.stock <= p.lowStockThreshold
        ? "text-yellow-600"
        : "text-primary-600";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Images */}
        <div>
          <div className="overflow-hidden rounded-2xl border border-primary-100 bg-primary-50 aspect-square mb-3">
            {p.images?.[mainImg]?.url ? (
              <img
                src={p.images[mainImg].url}
                alt={p.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package size={64} className="text-slate-200" />
              </div>
            )}
          </div>
          {p.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {p.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainImg(i)}
                  className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${i === mainImg ? "border-primary-500" : "border-slate-100"}`}
                >
                  <img
                    src={img.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {p.category && (
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-primary-600">
              {p.category.name}
            </p>
          )}
          <h1 className="text-2xl font-bold text-slate-800 leading-snug">
            {p.name}
          </h1>
          {p.brand && (
            <p className="mt-1 text-sm text-slate-500">
              Brand: <span className="font-medium">{p.brand.name}</span>
            </p>
          )}

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-primary-700">
              PKR {p.sellingPrice?.toLocaleString()}
            </span>
            {p.oldPrice > 0 && (
              <span className="text-lg text-slate-400 line-through">
                PKR {p.oldPrice?.toLocaleString()}
              </span>
            )}
            {p.discountPercent > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-sm font-bold text-primary-700">
                -{p.discountPercent}% OFF
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className={`text-sm font-semibold ${availColor}`}>
              ● {availability}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-sm text-slate-500">SKU: {p.sku}</span>
          </div>

          {p.shortDescription && (
            <p className="mt-4 text-sm text-slate-600 leading-relaxed">
              {p.shortDescription}
            </p>
          )}

          {/* Qty selector + Add to Cart / Buy Now — quantity control on
              its own row, buttons in an equal-width flex row below it
              on small screens, all in one row on larger screens. */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 self-start">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="text-slate-500 hover:text-slate-800 font-bold text-lg leading-none"
              >
                −
              </button>
              <span className="w-8 text-center font-bold">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(p.stock || 1, q + 1))}
                className="text-slate-500 hover:text-slate-800 font-bold text-lg leading-none"
              >
                +
              </button>
            </div>

            <div className="flex flex-1 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
                  added
                    ? "bg-primary-700 text-white"
                    : isOutOfStock
                      ? "bg-primary-50 text-slate-400 cursor-not-allowed"
                      : "bg-primary-600 text-white  shadow-[0_0_24px_theme(colors.primary.500/35%)] hover:bg-primary-600  hover:shadow-[0_0_24px_theme(colors.primary.500/75%)] animate-cart-attention"
                }`}
              >
                <ShoppingCart size={18} />
                {added
                  ? "Added to Cart!"
                  : isOutOfStock
                    ? "Out of Stock"
                    : "Add to Cart"}
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
                  flex-1
                  h-12
                  items-center
                  justify-center
                  gap-2
                  overflow-hidden
                  rounded-xl
                  border
                  px-2
                  text-sm
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
                <Zap size={18} strokeWidth={2.5} className="fill-current" />
                <span>{buying ? "Processing..." : "Buy Now"}</span>
              </button>
            </div>
          </div>

          {p.weight && (
            <p className="mt-3 text-xs text-slate-400">Weight: {p.weight}</p>
          )}
          {p.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-primary-50 px-3 py-1 text-xs text-slate-600"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-primary-100 pt-5">
            {[
              [Truck, "Free delivery on orders above PKR 2000"],
              [Shield, "100% Authentic Products"],
              [RotateCcw, "Easy Returns within 7 days"],
            ].map(([Icon, txt], i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1.5 text-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                  <Icon size={18} className="text-primary-400" />
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  {txt}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      {p.description && (
        <div className="mt-10 rounded-2xl border border-slate-100 bg-white p-6">
          <h2 className="mb-3 text-lg font-bold text-slate-800">
            Product Description
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {p.description}
          </p>
        </div>
      )}

      {/* Reviews */}
      <ReviewSection productId={id} />

      {/* Related */}
      {data.related?.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 text-xl font-bold text-slate-800">
            Related Products
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
            {data.related.map((rp) => (
              <ProductCard key={rp._id} product={rp} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
