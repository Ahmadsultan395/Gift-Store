"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ShoppingCart,
  Package,
  Truck,
  Shield,
  RotateCcw,
  Zap,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

import ProductCard from "@/components/website/ProductCard";
import { useWebsiteStore } from "@/stores/useWebsiteStore";
import ReviewSection from "@/components/website/ReviewSection";

export default function ProductDetailPage() {
  const {
    currentProduct,
    currentProductLoading,
    fetchProductBySlug,
    addToCart,

    // Store settings se phone number
    storeSettings,
    fetchStoreSettings,
  } = useWebsiteStore();

  const { id } = useParams();
  const router = useRouter();

  const [mainImg, setMainImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [buying, setBuying] = useState(false);

  const data = currentProduct;
  const loading = currentProductLoading;

  // ============================================================
  // FETCH PRODUCT + STORE SETTINGS
  // ============================================================
  useEffect(() => {
    if (id) {
      fetchProductBySlug(id);
    }

    fetchStoreSettings();
  }, [id, fetchProductBySlug, fetchStoreSettings]);

  // ============================================================
  // ADD TO CART
  // ============================================================
  function handleAddToCart() {
    if (!data?.product) return;

    addToCart(data.product, qty);

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 2000);
  }

  // ============================================================
  // BUY NOW
  // ============================================================
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

  // ============================================================
  // GET WHATSAPP NUMBER FROM STORE SETTINGS
  // ============================================================
  function getWhatsAppNumber() {
    let number = storeSettings?.phone || "";

    // Sirf numbers rakho
    number = number.replace(/\D/g, "");

    // Pakistan local number:
    // 03001234567
    // =>
    // 923001234567
    if (number.startsWith("0")) {
      number = "92" + number.substring(1);
    }

    // Agar 3001234567 save hai
    if (!number.startsWith("92") && number.length === 10) {
      number = "92" + number;
    }

    return number;
  }

  // ============================================================
  // ORDER ON WHATSAPP
  // ============================================================
  function handleWhatsAppOrder() {
    if (!data?.product) return;

    const p = data.product;

    const whatsappNumber = getWhatsAppNumber();

    // Store settings mein phone number nahi mila
    if (!whatsappNumber) {
      alert("WhatsApp number is not configured in Store Settings.");
      return;
    }

    // Current website ka URL automatically milega.
    //
    // Example:
    // https://gift-store-tawny.vercel.app/products/6a7ded...
    //
    // localhost par:
    // http://localhost:3000/products/6a7ded...
    const productUrl = `${window.location.origin}/products/${p._id}`;

    const message = `Assalam o Alaikum,

Mujhe ye product order karna hai:

Product: ${p.name}
Price: PKR ${p.sellingPrice?.toLocaleString()}
Quantity: ${qty}

Product Link:
${productUrl}

Please confirm availability and order details.`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message,
    )}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  // ============================================================
  // LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  // ============================================================
  // PRODUCT NOT FOUND
  // ============================================================
  if (!data?.product) {
    return (
      <div className="py-24 text-center text-slate-400">
        Product not found.
      </div>
    );
  }

  const p = data.product;

  // ============================================================
  // PRODUCT STATUS
  // ============================================================
  const isOutOfStock = p.stock <= 0;

  const availability =
    p.stock <= 0
      ? "Out of Stock"
      : p.stock <= p.lowStockThreshold
        ? `Only ${p.stock} left!`
        : "In Stock";

  const availColor =
    p.stock <= 0
      ? "text-red-600"
      : p.stock <= p.lowStockThreshold
        ? "text-yellow-600"
        : "text-green-600";

  const whatsappNumber = getWhatsAppNumber();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">

        {/* ======================================================
            PRODUCT IMAGES
        ====================================================== */}
        <div>
          <div className="mb-3 aspect-square overflow-hidden rounded-2xl border border-primary-100 bg-primary-50">
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
                  type="button"
                  onClick={() => setMainImg(i)}
                  className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
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

        {/* ======================================================
            PRODUCT DETAILS
        ====================================================== */}
        <div>
          {/* CATEGORY */}
          {p.category && (
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-primary-600">
              {p.category.name}
            </p>
          )}

          {/* NAME */}
          <h1 className="text-2xl font-bold leading-snug text-slate-800">
            {p.name}
          </h1>

          {/* BRAND */}
          {p.brand && (
            <p className="mt-1 text-sm text-slate-500">
              Brand:{" "}
              <span className="font-medium">{p.brand.name}</span>
            </p>
          )}

          {/* ====================================================
              PRICE
          ==================================================== */}
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
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-sm font-bold text-red-700">
                -{p.discountPercent}% OFF
              </span>
            )}
          </div>

          {/* ====================================================
              AVAILABILITY + SKU
          ==================================================== */}
          <div className="mt-4 flex items-center gap-2">
            <span className={`text-sm font-semibold ${availColor}`}>
              ● {availability}
            </span>

            <span className="text-slate-300">|</span>

            <span className="text-sm text-slate-500">
              SKU: {p.sku}
            </span>
          </div>

          {/* SHORT DESCRIPTION */}
          {p.shortDescription && (
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              {p.shortDescription}
            </p>
          )}

          {/* ====================================================
              QUANTITY
          ==================================================== */}
          <div className="mt-6">
            <div className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
              <button
                type="button"
                onClick={() =>
                  setQty((q) => Math.max(1, q - 1))
                }
                disabled={isOutOfStock}
                className="text-lg font-bold leading-none text-slate-500 transition-colors hover:text-slate-800 disabled:cursor-not-allowed"
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
                    Math.min(p.stock || 1, q + 1),
                  )
                }
                disabled={isOutOfStock}
                className="text-lg font-bold leading-none text-slate-500 transition-colors hover:text-slate-800 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>

          {/* ====================================================
              ADD TO CART + BUY NOW
          ==================================================== */}
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">

            {/* ADD TO CART */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
                added
                  ? "bg-green-600 text-white"
                  : isOutOfStock
                    ? "cursor-not-allowed bg-primary-50 text-slate-400"
                    : "bg-primary-600 text-white shadow-[0_0_24px_theme(colors.primary.500/35%)] hover:bg-primary-700 hover:shadow-[0_0_24px_theme(colors.primary.500/55%)]"
              }`}
            >
              <ShoppingCart size={18} />

              {added
                ? "Added to Cart!"
                : isOutOfStock
                  ? "Out of Stock"
                  : "Add to Cart"}
            </button>

            {/* BUY NOW */}
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isOutOfStock || buying}
              className={`relative flex h-12 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl border px-2 text-sm font-extrabold transition-all duration-150 ${
                isOutOfStock
                  ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300"
                  : buying
                    ? "border-amber-500 bg-amber-500 text-slate-950"
                    : "border-amber-400 bg-amber-400 text-slate-950 shadow-[0_0_16px_rgba(251,191,36,0.65)] hover:bg-amber-300 hover:shadow-[0_0_28px_rgba(251,191,36,0.95)]"
              }`}
            >
              <Zap
                size={18}
                strokeWidth={2.5}
                className="fill-current"
              />

              <span>
                {buying ? "Processing..." : "Buy Now"}
              </span>
            </button>
          </div>

          {/* ====================================================
              WHATSAPP ORDER BUTTON
              
              IMPORTANT:
              Number Store Settings se aa raha hai.
              Product ID message mein nahi jayegi.
              Current browser domain ka product link jayega.
          ==================================================== */}
          <button
            type="button"
            onClick={handleWhatsAppOrder}
            disabled={!whatsappNumber || isOutOfStock}
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all duration-300 ${
              !whatsappNumber || isOutOfStock
                ? "cursor-not-allowed bg-slate-300"
                : "bg-[#25D366] shadow-[0_0_20px_rgba(37,211,102,0.25)] hover:-translate-y-0.5 hover:bg-[#20bd5a] hover:shadow-[0_0_28px_rgba(37,211,102,0.4)] active:scale-[0.98]"
            }`}
          >
            <FaWhatsapp size={21} />

            {!whatsappNumber
              ? "WhatsApp Number Not Configured"
              : isOutOfStock
                ? "Out of Stock"
                : "Order on WhatsApp"}
          </button>

          {/* WEIGHT */}
          {p.weight && (
            <p className="mt-3 text-xs text-slate-400">
              Weight: {p.weight}
            </p>
          )}

          {/* TAGS */}
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

          {/* ====================================================
              PRODUCT FEATURES
          ==================================================== */}
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
                  <Icon
                    size={18}
                    className="text-primary-400"
                  />
                </div>

                <p className="text-[10px] leading-tight text-slate-500">
                  {txt}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================
          PRODUCT DESCRIPTION
      ======================================================== */}
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

      {/* ========================================================
          REVIEWS
      ======================================================== */}
      <ReviewSection productId={id} />

      {/* ========================================================
          RELATED PRODUCTS
      ======================================================== */}
      {data.related?.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 text-xl font-bold text-slate-800">
            Related Products
          </h2>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
            {data.related.map((rp) => (
              <ProductCard
                key={rp._id}
                product={rp}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
