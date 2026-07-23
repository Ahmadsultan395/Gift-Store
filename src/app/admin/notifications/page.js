"use client";

import { useEffect } from "react";
import { Bell, CheckCheck } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useAdminStore } from "@/stores/useAdminStore";

const TYPE_ICON = {
  new_order: "🛒",
  low_stock: "⚠️",
  out_of_stock: "🔴",
  expired_product: "📅",
  new_customer: "👤",
};

const TYPE_COLOR = {
  new_order: "green",
  low_stock: "yellow",
  out_of_stock: "red",
  expired_product: "orange",
  new_customer: "blue",
};

export default function NotificationsPage() {
  const {
    notifications,
    notifLoading,
    unreadCount,
    fetchNotifications,
    markAllRead,
  } = useAdminStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread notifications`}
        action={
          unreadCount > 0 && (
            <Button variant="outline" onClick={markAllRead}>
              <CheckCheck size={15} />
              Mark All Read
            </Button>
          )
        }
      />

      <div className="space-y-2">
        {notifLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-slate-100"
            />
          ))
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
            <Bell size={48} className="opacity-20" />
            <p>No notifications yet.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`flex items-start gap-4 rounded-xl border px-5 py-4 transition-colors ${
                !n.isRead
                  ? "border-green-200 bg-green-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm border border-slate-100">
                {TYPE_ICON[n.type] || "🔔"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-800">{n.title}</p>

                  <Badge variant={TYPE_COLOR[n.type]}>
                    {n.type?.replace(/_/g, " ")}
                  </Badge>

                  {!n.isRead && (
                    <span className="h-2 w-2 rounded-full bg-green-600 flex-shrink-0" />
                  )}
                </div>

                <p className="mt-0.5 text-sm text-slate-500">{n.message}</p>

                <p className="mt-1 text-xs text-slate-400">
                  {new Date(n.createdAt).toLocaleString("en-PK")}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
