"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  Package,
} from "lucide-react";
import { useRouter } from "next/navigation";
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

  const subTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryCharge =
    subTotal >= 2000 ? 0 : storeSettings?.shippingCharges || 150;

  const grandTotal = subTotal - couponDiscount + deliveryCharge;

  if (cart.length === 0)
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
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white hover:bg-primary-700/90"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen">
      <PageHeroHeader
        icon="🛒"
        eyebrow="Shopping Cart"
        title="Your Cart"
        subtitle={`${cart.length} item${cart.length === 1 ? "" : "s"} ready for checkout`}
        compact
      />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {cart.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
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
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {item.name}
                  </p>
                  <p className="text-sm font-bold text-primary-600 mt-0.5">
                    PKR {item.price?.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateCartQty(item._id, item.qty - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:border-red-300 hover:text-red-500"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateCartQty(item._id, item.qty + 1)}
                    disabled={item.qty >= item.stock}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-600 disabled:opacity-40"
                  >
                    <Plus size={13} />
                  </button>
                </div>
                <p className="w-24 text-right text-sm font-bold text-slate-800">
                  PKR {(item.price * item.qty).toLocaleString()}
                </p>
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <h2 className="text-base font-bold text-slate-800">
                Order Summary
              </h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({cart.length} items)</span>
                  <span>PKR {subTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery</span>
                  <span
                    className={
                      deliveryCharge === 0 ? "text-primary-600 font-medium" : ""
                    }
                  >
                    {deliveryCharge === 0 ? "FREE" : `PKR ${deliveryCharge}`}
                  </span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-primary-600 font-medium">
                    <span>Coupon ({appliedCoupon?.code})</span>

                    <div className="flex items-center gap-1">
                      <span>-PKR {couponDiscount.toLocaleString()}</span>

                      <button
                        onClick={removeCoupon}
                        className="text-red-500 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
                {subTotal < 2000 && (
                  <p className="text-[11px] text-slate-400">
                    Add PKR {(2000 - subTotal).toLocaleString()} more for free
                    delivery!
                  </p>
                )}
              </div>

              {/* Coupon */}
              <div className="border-t border-slate-100 pt-3">
                <label className="mb-1.5 block text-xs font-medium text-slate-500">
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />

                  <button
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
                    className="rounded-xl bg-primary-600 px-3 py-2 text-xs font-bold text-white"
                  >
                    Apply
                  </button>
                </div>

                {couponMsg && (
                  <p
                    className={`mt-1.5 text-xs ${
                      couponMsg.type === "success"
                        ? "text-primary-600"
                        : "text-red-500"
                    }`}
                  >
                    {couponMsg.msg}
                  </p>
                )}
                {couponMsg && (
                  <p
                    className={`mt-1.5 text-xs ${
                      couponMsg.type === "success"
                        ? "text-primary-600"
                        : "text-red-500"
                    }`}
                  >
                    {couponMsg.msg}
                  </p>
                )}
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-base">
                <span>Grand Total</span>
                <span className="text-primary-600">
                  PKR {grandTotal.toLocaleString()}
                </span>
              </div>

              <Link
                href={{
                  pathname: "/checkout",
                  query: {
                    coupon: appliedCoupon?.code,
                    discount: couponDiscount || undefined,
                  },
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 text-sm font-bold text-white hover:bg-primary-600/90 transition-colors"
              >
                Proceed to Checkout <ArrowRight size={16} />
              </Link>
              <Link
                href="/products"
                className="block text-center text-xs text-slate-400 hover:text-slate-600"
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
