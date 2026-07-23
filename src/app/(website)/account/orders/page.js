"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import PageHeroHeader from "@/components/website/PageHeroHeader";
import { useWebsiteStore } from "@/stores/useWebsiteStore";

const STATUS_COLOR = {
  pending: "yellow",
  confirmed: "blue",
  packed: "purple",
  shipped: "orange",
  delivered: "green",
  cancelled: "red",
};

export default function OrdersPage() {
  const router = useRouter();
  const [viewing, setViewing] = useState(null);
  const {
    customer,
    authChecked,
    checkAuth,
    myOrders,
    ordersLoading,
    fetchMyOrders,
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
    fetchMyOrders();
  }, [authChecked, customer, router, fetchMyOrders]);

  const loading = !authChecked || ordersLoading;

  return (
    <div className="min-h-screen">
      <PageHeroHeader
        icon="🧾"
        eyebrow="My Account"
        title="My Orders"
        subtitle={
          loading
            ? "Loading your order history..."
            : `${myOrders?.length || 0} order${myOrders?.length === 1 ? "" : "s"} placed so far`
        }
        compact
      />

      <div className="mx-auto max-w-3xl px-4 py-10">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0F4C39] border-t-transparent" />
          </div>
        ) : myOrders.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <ShoppingBag size={48} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium">No orders yet</p>
            <a
              href="/products"
              className="mt-3 inline-block text-sm text-primary-600 hover:underline"
            >
              Start Shopping →
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {myOrders.map((o) => (
              <div
                key={o._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-slate-800">{o.orderNumber}</p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {new Date(o.createdAt).toLocaleDateString("en-PK", {
                        dateStyle: "long",
                      })}
                    </p>
                    <p className="text-sm text-slate-500">
                      {o.items?.length} items • PKR{" "}
                      {o.grandTotal?.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={STATUS_COLOR[o.status]}>{o.status}</Badge>
                    <Badge
                      variant={o.paymentMethod === "cod" ? "yellow" : "green"}
                    >
                      {o.paymentMethod?.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 overflow-x-auto">
                  {o.items?.slice(0, 4).map((item, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 h-12 w-12 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-300">
                          📦
                        </div>
                      )}
                    </div>
                  ))}
                  {o.items?.length > 4 && (
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-xs font-medium text-slate-500">
                      +{o.items.length - 4}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setViewing(o)}
                  className="mt-3 text-sm font-medium text-primary-600 hover:text-primary-600/90"
                >
                  View Details →
                </button>
              </div>
            ))}
          </div>
        )}

        <Modal
          open={!!viewing}
          onClose={() => setViewing(null)}
          title={`Order: ${viewing?.orderNumber}`}
          size="md"
        >
          {viewing && (
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <Badge variant={STATUS_COLOR[viewing.status]}>
                  {viewing.status}
                </Badge>
                <span className="text-xs text-slate-400">
                  {new Date(viewing.createdAt).toLocaleString("en-PK")}
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-400 mb-2">
                  DELIVERY ADDRESS
                </p>
                <p className="font-medium">{viewing.shippingInfo?.name}</p>
                <p className="text-slate-500">
                  {viewing.shippingInfo?.address}, {viewing.shippingInfo?.city}
                </p>
                <p className="text-slate-500">{viewing.shippingInfo?.phone}</p>
              </div>
              <div className="space-y-2">
                {viewing.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 rounded-lg border border-slate-100 overflow-hidden bg-slate-50">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-lg">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-700">{item.name}</p>
                      <p className="text-xs text-slate-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-primary-600">
                      PKR {item.total?.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-3 space-y-1">
                {[
                  ["Subtotal", viewing.subTotal],
                  ["Delivery", viewing.deliveryCharges],
                  ["Discount", viewing.discount ? -viewing.discount : null],
                  ["Total", viewing.grandTotal],
                ].map(([l, v]) =>
                  v != null ? (
                    <div
                      key={l}
                      className={`flex justify-between text-sm ${l === "Total" ? "font-bold pt-1 border-t border-slate-100" : "text-slate-500"}`}
                    >
                      <span>{l}</span>
                      <span className={l === "Total" ? "text-primary-600" : ""}>
                        {l === "Discount"
                          ? `-PKR ${Math.abs(v).toLocaleString()}`
                          : `PKR ${v?.toLocaleString()}`}
                      </span>
                    </div>
                  ) : null,
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
