"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  Package,
} from "lucide-react";

import PageHeroHeader from "@/components/website/PageHeroHeader";
import { useWebsiteStore } from "@/stores/useWebsiteStore";

export default function CartPage() {
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState(null);

  const {
    cart,
    updateCartQty,
    removeFromCart,
    appliedCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    storeSettings,
  } = useWebsiteStore();

  // ─────────────────────────────────────────────
  // TOTALS
  // ─────────────────────────────────────────────

  const subTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const deliveryCharge =
    subTotal >= 2000 ? 0 : storeSettings?.shippingCharges || 150;

  const grandTotal = subTotal - couponDiscount + deliveryCharge;

  // ─────────────────────────────────────────────
  // EMPTY CART
  // ─────────────────────────────────────────────

  if (cart.length === 0) {
    return (
      <div className="min-h-screen">
        <PageHeroHeader
          icon="🛒"
          eyebrow="Shopping Cart"
          title="Your Cart"
          subtitle="Everything you add will show up here"
          compact
        />

        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
            <ShoppingCart size={40} className="text-slate-300" />
          </div>

          <h2 className="text-2xl font-bold text-slate-800">
            Your cart is empty
          </h2>

          <p className="mt-2 text-slate-500">
            Looks like you haven't added anything yet.
          </p>

          <Link
            href="/products"
            className="
              mt-6
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-primary-600
              px-6
              py-3
              text-sm
              font-bold
              text-white
              transition-all
              hover:bg-primary-700
              hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.45)]
            "
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // CART PAGE
  // ─────────────────────────────────────────────

  return (
    <div className="min-h-screen">
      <PageHeroHeader
        icon="🛒"
        eyebrow="Shopping Cart"
        title="Your Cart"
        subtitle={`${cart.length} item${
          cart.length === 1 ? "" : "s"
        } ready for checkout`}
        compact
      />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ═══════════════════════════════════════
              CART ITEMS
          ═══════════════════════════════════════ */}

          <div className="space-y-3 lg:col-span-2">
            {cart.map((item) => (
              <div
                key={item._id}
                className="
                  flex
                  flex-col
                  items-start
                  justify-start
                  gap-2
                  rounded-2xl
                  border
                  border-slate-100
                  bg-white
                  p-2.5
                  shadow-sm
                  min-[400px]:flex-row
                  min-[400px]:items-center
                  min-[400px]:justify-between
                  sm:gap-4
                  sm:p-4
                "
              >
                {/* Product Info */}
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  {/* Image */}
                  <div
                    className="
                      h-12
                      w-12
                      flex-shrink-0
                      overflow-hidden
                      rounded-xl
                      border
                      border-slate-100
                      bg-slate-50
                      sm:h-16
                      sm:w-16
                    "
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package size={20} className="text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Name + Price */}
                  <div className="min-w-0 flex-1">
                    <p
                      className="
                        line-clamp-2
                        break-words
                        text-xs
                        font-semibold
                        text-slate-800
                        sm:text-sm
                      "
                    >
                      {item.name}
                    </p>

                    <p className="mt-1 text-xs font-bold text-primary-600 sm:text-sm">
                      PKR {item.price?.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Quantity + Total */}
                <div className="flex w-full justify-between min-[400px]:w-auto">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-0 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => updateCartQty(item._id, item.qty - 1)}
                      className="
                        flex
                        h-6
                        w-6
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-slate-200
                        text-slate-600
                        transition-all
                        hover:border-red-300
                        hover:text-red-500
                        sm:h-7
                        sm:w-7
                      "
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>

                    <span className="w-8 text-center text-sm font-bold">
                      {item.qty}
                    </span>

                    <button
                      type="button"
                      onClick={() => updateCartQty(item._id, item.qty + 1)}
                      disabled={item.qty >= item.stock}
                      className="
                        flex
                        h-6
                        w-6
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-slate-200
                        text-slate-600
                        transition-all
                        hover:border-primary-300
                        hover:text-primary-600
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                        sm:h-7
                        sm:w-7
                      "
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Item Total + Remove */}
                  <div className="flex items-center gap-2">
                    <p className="w-24 text-right text-sm font-bold text-slate-800">
                      PKR {(item.price * item.qty).toLocaleString()}
                    </p>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item._id)}
                      className="
                        text-slate-300
                        transition-colors
                        hover:text-red-500
                      "
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ═══════════════════════════════════════
              ORDER SUMMARY
          ═══════════════════════════════════════ */}

          <div className="lg:col-span-1">
            <div
              className="
                sticky
                top-20
                space-y-4
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-5
              "
            >
              <h2 className="text-base font-bold text-slate-800">
                Order Summary
              </h2>

              {/* ─────────────────────────────────
                  SUBTOTAL / DELIVERY
              ───────────────────────────────── */}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({cart.length} items)</span>

                  <span>PKR {subTotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Delivery</span>

                  <span
                    className={
                      deliveryCharge === 0 ? "font-medium text-primary-600" : ""
                    }
                  >
                    {deliveryCharge === 0 ? "FREE" : `PKR ${deliveryCharge}`}
                  </span>
                </div>

                {/* Coupon Discount */}
                {couponDiscount > 0 && (
                  <div className="flex justify-between font-medium text-primary-600">
                    <span>Coupon ({appliedCoupon?.code})</span>

                    <div className="flex items-center gap-1">
                      <span>-PKR {couponDiscount.toLocaleString()}</span>

                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="
                          text-xs
                          text-red-500
                          transition-colors
                          hover:text-red-700
                        "
                        aria-label="Remove coupon"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* Free Delivery Message */}
                {subTotal < 2000 && (
                  <p className="text-[11px] text-slate-400">
                    Add PKR {(2000 - subTotal).toLocaleString()} more for free
                    delivery!
                  </p>
                )}
              </div>

              {/* ═════════════════════════════════
                  COUPON
              ═════════════════════════════════ */}

              <div className="border-t border-slate-100 pt-3">
                <label className="mb-1.5 block text-xs font-medium text-slate-500">
                  Coupon Code
                </label>

                <div className="flex gap-2">
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Enter code"
                    className="
                      min-w-0
                      flex-1
                      rounded-xl
                      border
                      border-slate-200
                      px-3
                      py-2
                      text-sm
                      outline-none
                      transition-all
                      focus:border-primary-300
                      focus:ring-1
                      focus:ring-primary-300/30
                    "
                  />

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await applyCoupon(coupon);

                        setCouponMsg({
                          type: "success",
                          msg: "Coupon applied successfully",
                        });
                      } catch {
                        setCouponMsg({
                          type: "error",
                          msg: "Invalid coupon",
                        });
                      }
                    }}
                    disabled={!coupon}
                    className="
                      rounded-xl
                      bg-primary-600
                      px-3
                      py-2
                      text-xs
                      font-bold
                      text-white
                      transition-all
                      hover:bg-primary-700
                      hover:shadow-[0_0_16px_rgba(var(--primary-rgb),0.45)]
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    Apply
                  </button>
                </div>

                {couponMsg && (
                  <p
                    className={`
                      mt-1.5
                      text-xs
                      ${
                        couponMsg.type === "success"
                          ? "text-primary-600"
                          : "text-red-500"
                      }
                    `}
                  >
                    {couponMsg.msg}
                  </p>
                )}
              </div>

              {/* ═════════════════════════════════
                  GRAND TOTAL
              ═════════════════════════════════ */}

              <div
                className="
                  flex
                  justify-between
                  border-t
                  border-slate-100
                  pt-3
                  text-base
                  font-bold
                "
              >
                <span>Grand Total</span>

                <span className="text-primary-600">
                  PKR {grandTotal.toLocaleString()}
                </span>
              </div>

              {/* ═════════════════════════════════
                  PROCEED TO CHECKOUT
                  REUSABLE ANIMATION
              ═════════════════════════════════ */}

              <Link
                href={{
                  pathname: "/checkout",
                  query: {
                    coupon: appliedCoupon?.code,
                    discount: couponDiscount || undefined,
                  },
                }}
                className="
                  animate-cart-attention
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-primary-600
                  py-3.5
                  text-sm
                  font-bold
                  text-white
                  transition-colors
                  hover:bg-primary-700
                  hover:shadow-[0_0_24px_theme(colors.primary.500/75%)]
                "
              >
                Proceed to Checkout
                <ArrowRight size={16} />
              </Link>

              {/* Continue Shopping */}
              <Link
                href="/products"
                className="
                  block
                  text-center
                  text-xs
                  text-slate-400
                  transition-colors
                  hover:text-primary-600
                "
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
