"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Heart, User, LogOut, ChevronRight } from "lucide-react";
import Badge from "@/components/ui/Badge";
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

export default function AccountPage() {
  const router = useRouter();
  const {
    customer,
    authChecked,
    checkAuth,
    myOrders,
    ordersLoading,
    fetchMyOrders,
    logout,
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

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  if (!authChecked || !customer)
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );

  return (
    <div className="min-h-screen">
      <PageHeroHeader
        icon={customer.name?.charAt(0).toUpperCase() || "👤"}
        eyebrow="My Account"
        title={customer.name}
        subtitle={`${customer.phone}${customer.email ? ` • ${customer.email}` : ""}`}
        compact
      >
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl border-2 border-red-500/40 px-5 py-2.5 text-sm font-bold bg-red-500 text-white transition-colors hover:bg-red-500/35"
        >
          <LogOut size={15} /> Logout
        </button>
      </PageHeroHeader>

      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Quick links */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            {
              icon: ShoppingBag,
              label: "My Orders",
              sub: `${myOrders.length} orders`,
              href: "/account/orders",
            },
            {
              icon: Heart,
              label: "Wishlist",
              sub: "Saved items",
              href: "/account/wishlist",
            },
            {
              icon: User,
              label: "Profile",
              sub: "Update info",
              href: "/account/profile",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 hover:border-primary-300 hover:shadow-sm transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                <item.icon size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {item.label}
                </p>
                <p className="text-xs text-slate-400">{item.sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800">Recent Orders</h2>
            <Link
              href="/account/orders"
              className="text-sm text-primary hover:underline"
            >
              View All
            </Link>
          </div>
          {ordersLoading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-lg bg-slate-200"
                />
              ))}
            </div>
          ) : myOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <ShoppingBag size={32} className="mx-auto mb-2 opacity-30" />
              <p>No orders yet.</p>
              <Link
                href="/products"
                className="mt-3 inline-block text-sm text-primary hover:underline"
              >
                Start Shopping →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {myOrders.slice(0, 5).map((o) => (
                <div
                  key={o._id}
                  className="flex items-center justify-between px-5 py-4 hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {o.orderNumber}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(o.createdAt).toLocaleDateString("en-PK")} •{" "}
                      {o.items?.length} items
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">
                        PKR {o.grandTotal?.toLocaleString()}
                      </p>
                      <Badge variant={STATUS_COLOR[o.status]}>{o.status}</Badge>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
