"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ShoppingCart,
  Package,
  Star,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

import ProductCard from "@/components/website/ProductCard";
import { useWebsiteStore } from "@/stores/useWebsiteStore";
import ReviewSection from "@/components/website/ReviewSection";

function StarRating({ rating = 0, count = 0 }) {
  if (!rating || rating <= 0) return null;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={13}
            className={
              i <= Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "text-slate-200"
            }
          />
        ))}
      </div>

      <span className="text-xs text-slate-400">
        {rating.toFixed(1)}
        {count > 0 ? ` (${count})` : ""}
      </span>
    </div>
  );
}

export default function ProductDetailPage() {
  const {
    currentProduct,
    currentProductLoading,
    fetchProductBySlug,
    addToCart,
    storeSettings,
    fetchStoreSettings,
  } = useWebsiteStore();

  const params = useParams();

  const id = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const [mainImg, setMainImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;

    fetchProductBySlug(id);
  }, [id, fetchProductBySlug]);

  useEffect(() => {
    fetchStoreSettings();
  }, [fetchStoreSettings]);

  const data = currentProduct;
  const p = data?.product;

  if (currentProductLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!p) {
    return (
      <div className="flex min-h-[500px] items-center justify-center px-4">
        <div className="text-center">
          <Package
            size={55}
            className="mx-auto mb-4 text-slate-200"
          />

          <h1 className="text-xl font-bold text-slate-700">
            Product not found.
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            This product could not be loaded.
          </p>

          <p className="mt-3 text-xs text-slate-300">
            Product ID: {id || "missing"}
          </p>
        </div>
      </div>
    );
  }

  const isOutOfStock = Number(p.stock || 0) <= 0;

  const availability =
    p.stock <= 0
      ? "Out of Stock"
      : p.stock <= (p.lowStockThreshold || 5)
        ? `Only ${p.stock} left!`
        : "In Stock";

  const availColor =
    p.stock <= 0
      ? "text-red-600"
      : p.stock <= (p.lowStockThreshold || 5)
        ? "text-yellow-600"
        : "text-green-600";

  // ─────────────────────────────────────
  // ADD TO CART
  // ─────────────────────────────────────

  function handleAddToCart() {
    if (!p || isOutOfStock) return;

    addToCart(p, qty);

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 2000);
  }

  // ─────────────────────────────────────
  // WHATSAPP
  // ─────────────────────────────────────

  function handleWhatsAppOrder() {
    if (!p || isOutOfStock) return;

    /*
      Number footer/store settings se aa raha hai.
      Example:
      03070858719
      +923070858719
      923070858719

      Teeno formats handle ho jayenge.
    */

    const rawPhone = storeSettings?.phone || "";

    if (!rawPhone) {
      alert("WhatsApp number is not configured in Store Settings.");
      return;
    }

    let phone = rawPhone.replace(/\D/g, "");

    // Pakistan local number:
    // 03070858719
    // =>
    // 923070858719
    if (phone.startsWith("0")) {
      phone = "92" + phone.substring(1);
    }

    // Agar +92 already hai to digits ke baad 92 hi rahega.
    // Agar 923... hai to same rahega.

    const productLink =
      typeof window !== "undefined"
        ? window.location.href
        : `https://gift-store-tawny.vercel.app/products/${p._id}`;

    const message = `Assalam o Alaikum,

Mujhe ye product order karna hai:

Product: ${p.name}
Price: PKR ${p.sellingPrice?.toLocaleString()}
Quantity: ${qty}
Product ID: ${p._id}

Product Link:
${productLink}`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(
      message,
    )}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* ═════════════════════════════════════
          PRODUCT TOP
      ═════════════════════════════════════ */}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* ═════════════════════════════════════
            IMAGES
        ═════════════════════════════════════ */}

        <div>
          <div className="mb-3 aspect-square overflow-hidden rounded-2xl border border-primary-100 bg-primary-50">
            {p.images?.[mainImg]?.url ? (
              <img
                src={p.images[mainImg].url}
                alt={p.name || "Product"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package
                  size={64}
                  className="text-slate-200"
                />
              </div>
            )}
          </div>

          {p.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {p.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMainImg(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${
                    i === mainImg
                      ? "border-primary-500"
                      : "border-slate-100"
                  }`}
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

        {/* ═════════════════════════════════════
            DETAILS
        ═════════════════════════════════════ */}

        <div>
          {p.category?.name && (
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-primary-600">
              {p.category.name}
            </p>
          )}

          <h1 className="text-2xl font-bold leading-snug text-slate-800">
            {p.name}
          </h1>

          {p.brand?.name && (
            <p className="mt-1 text-sm text-slate-500">
              Brand:{" "}
              <span className="font-medium">
                {p.brand.name}
              </span>
            </p>
          )}

          {/* RATING */}

          <div className="mt-3">
            <StarRating
              rating={p.avgRating}
              count={p.reviewCount}
            />
          </div>

          {/* PRICE */}

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-extrabold text-primary-700">
              PKR {p.sellingPrice?.toLocaleString()}
            </span>

            {p.oldPrice > 0 && (
              <span className="text-lg text-slate-400 line-through">
                PKR {p.oldPrice?.toLocaleString()}
              </span>
            )}

            {p.discountPercent > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-sm font-bold text-red-600">
                -{p.discountPercent}% OFF
              </span>
            )}
          </div>

          {/* STOCK */}

          <div className="mt-4 flex items-center gap-2">
            <span
              className={`text-sm font-semibold ${availColor}`}
            >
              ● {availability}
            </span>

            <span className="text-slate-300">|</span>

            <span className="text-sm text-slate-500">
              SKU: {p.sku || "-"}
            </span>
          </div>

          {/* SHORT DESCRIPTION */}

          {p.shortDescription && (
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              {p.shortDescription}
            </p>
          )}

          {/* ═════════════════════════════════════
              QUANTITY
          ═════════════════════════════════════ */}

          <div className="mt-6">
            <div className="flex w-fit items-center gap-3 rounded-xl border border-slate-200 px-3 py-2">
              <button
                type="button"
                onClick={() =>
                  setQty((q) => Math.max(1, q - 1))
                }
                disabled={isOutOfStock}
                className="text-lg font-bold text-slate-500 hover:text-slate-800"
              >
                −
              </button>

              <span className="w-8 text-center font-bold">
                {qty}
              </span>

              <button
                type="button"
                onClick={() =>
                  setQty((q) =>
                    Math.min(
                      Number(p.stock || 1),
                      q + 1,
                    ),
                  )
                }
                disabled={isOutOfStock}
                className="text-lg font-bold text-slate-500 hover:text-slate-800"
              >
                +
              </button>
            </div>
          </div>

          {/* ═════════════════════════════════════
              ADD TO CART
          ═════════════════════════════════════ */}

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all ${
              added
                ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
                : isOutOfStock
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : "bg-primary-600 text-white shadow-lg shadow-primary-500/25 hover:bg-primary-700"
            }`}
          >
            <ShoppingCart size={19} />

            {added
              ? "Added to Cart!"
              : isOutOfStock
                ? "Out of Stock"
                : "Add to Cart"}
          </button>

          {/* ═════════════════════════════════════
              BUY NOW + WHATSAPP
          ═════════════════════════════════════ */}

          <div className="mt-3 grid grid-cols-2 gap-3">
            {/* BUY NOW */}

            <button
              type="button"
              onClick={() => {
                if (isOutOfStock) return;

                addToCart(p, qty);

                setTimeout(() => {
                  window.location.href = "/cart";
                }, 200);
              }}
              disabled={isOutOfStock}
              className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-extrabold transition-all ${
                isOutOfStock
                  ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300"
                  : "border-amber-400 bg-amber-400 text-slate-950 shadow-[0_0_16px_rgba(251,191,36,0.55)] hover:bg-amber-300 hover:shadow-[0_0_25px_rgba(251,191,36,0.8)]"
              }`}
            >
              <span className="text-lg">⚡</span>
              Buy Now
            </button>

            {/* WHATSAPP */}

            <button
              type="button"
              onClick={handleWhatsAppOrder}
              disabled={isOutOfStock}
              className={`flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-extrabold text-white transition-all ${
                isOutOfStock
                  ? "cursor-not-allowed bg-slate-300"
                  : "bg-[#25D366] shadow-[0_0_18px_rgba(37,211,102,0.3)] hover:-translate-y-0.5 hover:bg-[#20bd5a] hover:shadow-[0_0_28px_rgba(37,211,102,0.45)]"
              }`}
            >
              <FaWhatsapp size={21} />
              WhatsApp
            </button>
          </div>

          {/* WEIGHT */}

          {p.weight && (
            <p className="mt-3 text-xs text-slate-400">
              Weight: {p.weight}
            </p>
          )}

          {/* TAGS */}

          {p.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {p.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-primary-50 px-3 py-1 text-xs text-slate-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* FEATURES */}

          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-primary-100 pt-5">
            {[
              [
                Truck,
                "Free delivery on orders above PKR 2000",
              ],
              [Shield, "100% Authentic Products"],
              [RotateCcw, "Easy Returns within 7 days"],
            ].map(([Icon, text], index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-1.5 text-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                  <Icon
                    size={18}
                    className="text-primary-400"
                  />
                </div>

                <p className="text-[10px] leading-tight text-slate-500">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════
          DESCRIPTION
      ═════════════════════════════════════ */}

      {p.description && (
        <div className="mt-10 rounded-2xl border border-slate-100 bg-white p-6">
          <h2 className="mb-3 text-lg font-bold text-slate-800">
            Product Description
          </h2>

          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
            {p.description}
          </p>
        </div>
      )}

      {/* ═════════════════════════════════════
          REVIEWS
      ═════════════════════════════════════ */}

      <ReviewSection productId={id} />

      {/* ═════════════════════════════════════
          RELATED PRODUCTS
      ═════════════════════════════════════ */}

      {data?.related?.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 text-xl font-bold text-slate-800">
            Related Products
          </h2>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {data.related.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
