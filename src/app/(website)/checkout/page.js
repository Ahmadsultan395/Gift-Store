"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Package } from "lucide-react";
import PageHeroHeader from "@/components/website/PageHeroHeader";
import { useWebsiteStore } from "@/stores/useWebsiteStore";

export default function CheckoutPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const { cart, placeOrder } = useWebsiteStore();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
    paymentMethod: "cod",
  });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const discount = Number(sp.get("discount") || 0);
  const coupon = sp.get("coupon") || "";

  useEffect(() => {
    if (cart.length === 0) {
      router.replace("/cart");
    }
  }, [cart, router]);

  function setF(k) {
    return (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  }

  const subTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryCharge = subTotal >= 2000 ? 0 : 150;
  const grandTotal = subTotal - discount + deliveryCharge;

  async function handleOrder(e) {
    e.preventDefault();

    setError("");

    if (!form.name || !form.phone || !form.address || !form.city) {
      return setError("Please fill all required fields");
    }

    setPlacing(true);

    try {
      const data = await placeOrder({
        ...form,
        items: cart.map((i) => ({
          product: i._id,
          quantity: i.qty,
        })),
        couponCode: coupon || undefined,
      });

      setSuccess(data.order);
    } catch (err) {
      setError(err?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  }

  if (success)
    return (
      <div className="min-h-screen">
        <PageHeroHeader
          icon="✅"
          eyebrow="Checkout"
          title="Order Placed!"
          subtitle="Thanks for shopping with us"
          compact
        />
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary-50">
            <CheckCircle size={40} className="text-primary" />
          </div>
          <p className="mt-2 text-slate-500">
            Your order{" "}
            <span className="font-bold text-primary">
              {success.orderNumber}
            </span>{" "}
            has been received.
          </p>
          <p className="mt-1 text-sm text-slate-400">
            We'll contact you at {form.phone} to confirm delivery.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <button
              onClick={() => router.push("/account/orders")}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-primary-50"
            >
              My Orders
            </button>
            <button
              onClick={() => router.push("/")}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen">
      <PageHeroHeader
        icon="💳"
        eyebrow="Almost There"
        title="Checkout"
        subtitle="Confirm your details to place the order"
        compact
      />

      <div className="mx-auto max-w-5xl px-4 py-10">
        <form
          onSubmit={handleOrder}
          className="grid grid-cols-1 gap-8 lg:grid-cols-3"
        >
          <div className="lg:col-span-2 space-y-5">
            {/* Shipping */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-base font-bold text-slate-800">
                Shipping Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  [
                    "Full Name *",
                    "name",
                    "text",
                    "Enter your name",
                    "col-span-2 sm:col-span-1",
                  ],
                  [
                    "Phone Number *",
                    "phone",
                    "tel",
                    "03xx-xxxxxxx",
                    "col-span-2 sm:col-span-1",
                  ],
                  [
                    "Delivery Address *",
                    "address",
                    "text",
                    "Street, Area",
                    "col-span-2",
                  ],
                  [
                    "City *",
                    "city",
                    "text",
                    "e.g. Lahore",
                    "col-span-2 sm:col-span-1",
                  ],
                ].map(([label, k, type, ph, cls]) => (
                  <div key={k} className={cls}>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      {label}
                    </label>
                    <input
                      type={type}
                      value={form[k]}
                      onChange={setF(k)}
                      placeholder={ph}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary-300 focus:ring-1 focus:ring-primary-300/30"
                    />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Notes (optional)
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={setF("notes")}
                    rows={2}
                    placeholder="Delivery instructions..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary-300 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-base font-bold text-slate-800">
                Payment Method
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["cod", "💵 Cash on Delivery", "Pay when your order arrives"],
                  [
                    "bank_transfer",
                    "🏦 Bank Transfer",
                    "Transfer to our account before delivery",
                  ],
                ].map(([v, l, d]) => (
                  <label
                    key={v}
                    className={`flex cursor-pointer flex-col gap-1 rounded-xl border-2 p-4 transition-all ${form.paymentMethod === v ? "border-primary-300 bg-primary-50" : "border-slate-200 hover:border-slate-300"}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={v}
                      checked={form.paymentMethod === v}
                      onChange={setF("paymentMethod")}
                      className="sr-only"
                    />
                    <span className="font-semibold text-slate-800">{l}</span>
                    <span className="text-xs text-slate-500">{d}</span>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-primary-50 border border-primary-100 px-4 py-3 text-sm text-primary-700">
                {error}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <h2 className="font-bold text-slate-800">Order Summary</h2>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cart.map((i) => (
                  <div key={i._id} className="flex items-center gap-2 text-sm">
                    <div className="h-8 w-8 flex-shrink-0 rounded-lg border border-primary-100 bg-primary-50 overflow-hidden">
                      {i.image ? (
                        <img
                          src={i.image}
                          alt={i.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package size={12} className="text-slate-300" />
                        </div>
                      )}
                    </div>
                    <p className="flex-1 truncate text-slate-700">
                      {i.name} × {i.qty}
                    </p>
                    <p className="font-medium text-slate-800">
                      PKR {(i.price * i.qty).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5 border-t border-primary-100 pt-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>PKR {subTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery</span>
                  <span className={deliveryCharge === 0 ? "text-primary" : ""}>
                    {deliveryCharge === 0 ? "FREE" : `PKR ${deliveryCharge}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Discount</span>
                    <span>-PKR {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base border-t border-primary-100 pt-2">
                  <span>Grand Total</span>
                  <span className="text-primary">
                    PKR {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                type="submit"
                disabled={placing}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-60 transition-colors"
              >
                {placing ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <CheckCircle size={16} />
                )}
                {placing ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
